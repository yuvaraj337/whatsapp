import { handleProjects } from './routes/projects.js';
import { handleProperties } from './routes/properties.js';
import { handlePlots } from './routes/plots.js';
import { handleAssistant } from './routes/assistant.js';
import { handleCrm } from './routes/crm.js';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleWhatsApp } from './routes/whatsapp.js';
import { handleBookings } from './routes/bookings.js';

const PORT = Number(process.env.API_PORT || 3001);

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3004',
  'http://localhost:3003',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

const MAX_BODY_BYTES = 32768;

function sendJson(res, status, payload, origin = '') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (origin && !res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.end(JSON.stringify(payload));
}

function sendRaw(res, status, payload, origin = '') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (origin && !res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.end(payload);
}

function isLocalOrigin(origin) {
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();

    return (
      (host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '[::1]') &&
      (parsed.protocol === 'http:' ||
        parsed.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

function corsOrigin(requestOrigin) {
  if (!requestOrigin) return '';

  const configured = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (configured.includes('*')) {
    return requestOrigin;
  }

  const allowed = new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...configured
  ]);

  if (
    allowed.has(requestOrigin) ||
    isLocalOrigin(requestOrigin)
  ) {
    return requestOrigin;
  }

  return null;
}

/*
 * IMPORTANT:
 * WhatsApp webhook signatures are calculated against the
 * EXACT raw HTTP request body.
 *
 * Therefore we preserve the raw bytes in req.rawBody
 * before parsing the JSON.
 */
async function readRawBody(req) {
  if (Buffer.isBuffer(req.rawBody) && req.rawBody.length > 0) {
    return req.rawBody;
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

    total += buffer.length;

    if (total > MAX_BODY_BYTES) {
      const error = new Error('Request body too large');
      error.code = 'REQUEST_BODY_TOO_LARGE';
      throw error;
    }

    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks);

  req.rawBody = rawBody;

  console.log('[api] captured raw body bytes:', rawBody.length);

  return rawBody;
}

async function readJsonBody(req) {
  const rawBody = await readRawBody(req);

  if (!rawBody.length) {
    return {};
  }

  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch (error) {
    error.code = 'INVALID_JSON';
    throw error;
  }
}

async function parseBody(req, res, origin) {
  const contentLength = Number(
    req.headers['content-length'] || 0
  );

  if (contentLength > MAX_BODY_BYTES) {
    sendJson(
      res,
      400,
      {
        error: {
          code: 'REQUEST_BODY_TOO_LARGE',
          message: 'Request body is too large.'
        }
      },
      origin
    );

    return null;
  }

  try {
    return await readJsonBody(req);
  } catch (error) {
    sendJson(
      res,
      400,
      {
        error: {
          code: error.code || 'INVALID_JSON',
          message:
            error.code === 'REQUEST_BODY_TOO_LARGE'
              ? 'Request body is too large.'
              : 'Request body must contain valid JSON.'
        }
      },
      origin
    );

    return null;
  }
}

export async function router(req, res) {
  const requestOrigin = req.headers.origin || '';
  const origin = corsOrigin(requestOrigin);

  if (requestOrigin && origin === null) {
    return sendJson(res, 403, {
      error: {
        code: 'CORS_FORBIDDEN',
        message: 'Origin is not allowed.'
      }
    });
  }

  if (origin) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      origin
    );
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;

    if (origin) {
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, OPTIONS'
      );

      res.setHeader(
        'Access-Control-Allow-Headers',
        req.headers['access-control-request-headers'] ||
        'Accept, Content-Type, Authorization, X-CRM-Key'
      );

      res.setHeader(
        'Access-Control-Max-Age',
        '86400'
      );
    }

    return res.end();
  }

  const url = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`
  );

  const pathParts = url.pathname
    .split('/')
    .filter(Boolean);

  try {
    /*
     * ==========================================
     * WHATSAPP WEBHOOK
     * ==========================================
     */

    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'whatsapp'
    ) {
      /*
       * Meta webhook verification
       */
      if (req.method === 'GET') {
        const result = await handleWhatsApp(
          req,
          pathParts,
          url.searchParams
        );

        if (result?.raw !== undefined) {
          return sendRaw(
            res,
            result.status,
            result.raw,
            origin
          );
        }

        if (result) {
          return sendJson(
            res,
            result.status,
            result.error
              ? { error: result.error }
              : { data: result.data },
            origin
          );
        }
      }

      /*
       * WhatsApp webhook events
       *
       * parseBody() preserves the exact request
       * bytes in req.rawBody.
       *
       * handleWhatsApp() then verifies the
       * X-Hub-Signature-256 header against req.rawBody.
       */
      if (req.method === 'POST') {
        const body = await parseBody(
          req,
          res,
          origin
        );

        if (body === null) {
          return;
        }

        const result = await handleWhatsApp(
          req,
          pathParts,
          url.searchParams,
          body
        );

        if (result) {
          return sendJson(
            res,
            result.status,
            result.error
              ? { error: result.error }
              : { data: result.data },
            origin
          );
        }
      }
    }

    /*
     * ==========================================
     * BOOKINGS (Public)
     * ==========================================
     */
    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'bookings' &&
      req.method === 'POST'
    ) {
      const body = await parseBody(
        req,
        res,
        origin
      );

      if (body === null) {
        return;
      }

      const result = await handleBookings(
        req,
        pathParts,
        body
      );

      return sendJson(
        res,
        result.status,
        result.error
          ? { error: result.error }
          : { data: result.data },
        origin
      );
    }

    /*
     * ==========================================
     * AI ASSISTANT
     * ==========================================
     */

    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'assistant' &&
      req.method === 'POST'
    ) {
      const body = await parseBody(
        req,
        res,
        origin
      );

      if (body === null) {
        return;
      }

      const result = await handleAssistant(
        pathParts,
        body
      );

      return sendJson(
        res,
        result.status,
        result.error
          ? { error: result.error }
          : { data: result.data },
        origin
      );
    }

    /*
     * ==========================================
     * CRM
     * ==========================================
     */

    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'crm'
    ) {
      if (req.method === 'GET') {
        const result = await handleCrm(
          req,
          pathParts,
          url.searchParams
        );

        if (result) {
          return sendJson(
            res,
            result.status,
            result.error
              ? { error: result.error }
              : { data: result.data },
            origin
          );
        }
      }

      if (
        req.method === 'POST' ||
        req.method === 'PATCH'
      ) {
        const body = await parseBody(
          req,
          res,
          origin
        );

        if (body === null) {
          return;
        }

        const result = await handleCrm(
          req,
          pathParts,
          url.searchParams,
          body
        );

        if (result) {
          return sendJson(
            res,
            result.status,
            result.error
              ? { error: result.error }
              : { data: result.data },
            origin
          );
        }
      }
    }

    /*
     * ==========================================
     * ONLY GET REQUESTS BELOW THIS POINT
     * ==========================================
     */

    if (req.method !== 'GET') {
      return sendJson(
        res,
        405,
        {
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message:
              'Only GET, POST and PATCH requests are supported.'
          }
        },
        origin
      );
    }

    if (
      req.headers['content-length'] ||
      req.headers['transfer-encoding']
    ) {
      return sendJson(
        res,
        400,
        {
          error: {
            code: 'REQUEST_BODY_NOT_ALLOWED',
            message:
              'GET requests must not include a request body.'
          }
        },
        origin
      );
    }

    /*
     * ==========================================
     * PUBLIC API ROUTES
     * ==========================================
     */

    let result = await handleProjects(
      pathParts
    );

    if (!result) {
      result = await handlePlots(
        pathParts
      );
    }

    if (!result) {
      result = await handleProperties(
        pathParts,
        url.searchParams
      );
    }

    if (!result) {
      return sendJson(
        res,
        404,
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found.'
          }
        },
        origin
      );
    }

    if (
      result.data === null &&
      result.status === 200
    ) {
      return sendJson(
        res,
        404,
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found.'
          }
        },
        origin
      );
    }

    return sendJson(
      res,
      result.status,
      result.error
        ? { error: result.error }
        : { data: result.data },
      origin
    );
  } catch (error) {
    console.error(
      '[api]',
      error?.message || error
    );

    return sendJson(
      res,
      500,
      {
        error: {
          code: 'INTERNAL_ERROR',
          message:
            'An unexpected error occurred.'
        }
      },
      origin
    );
  }
}

const currentFile =
  fileURLToPath(import.meta.url).toLowerCase();

const executedFile =
  process.argv[1]
    ? path.resolve(process.argv[1]).toLowerCase()
    : '';

if (executedFile === currentFile) {
  const server = http.createServer(router);

  server.listen(PORT, () => {
    console.log(
      `VR Real Estate API listening on http://localhost:${PORT}`
    );

    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.warn(
        '⚠️ Notice: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured in .env yet.'
      );

      console.warn(
        '   Add your Supabase credentials in .env to enable database queries.'
      );
    }
  });
}
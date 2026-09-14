import { listProjects, getProjectDetails } from './projectsService.js';
import { listProperties, getPropertyByCode } from './propertiesService.js';
import { listProjectPlots } from './plotsService.js';
import { supabaseGet } from '../lib/supabase.js';
import { processAgentMessage } from './crmAgentEngine.js';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 12;
const AI_TIMEOUT_MS = 15000;
const MAX_CONTEXT_PROPERTIES = 60;
const MAX_CONTEXT_PLOTS = 80;

const SYSTEM_PROMPT = `You are the Real Estate Brothers group AI Assistant for the Real Estate Brothers group website and WhatsApp.
Answer only from verified data supplied in the context and the conversation.
Never invent prices, availability, dimensions, locations, amenities, RERA information, approvals, returns, or property details.
If the supplied data does not contain an answer, say that the information is not available and suggest contacting Real Estate Brothers group or requesting a site visit when useful.
Availability claims must reflect the supplied current inventory only.
Never claim that a plot is reserved, booked, sold, or a site visit is confirmed unless the supplied data explicitly says so.
Do not make legal, financial, investment-return, approval, title, or guaranteed-outcome claims.
You may explain general real-estate concepts briefly, but redirect unrelated questions toward Real Estate Brothers group topics.
The source contains local SVG/project coordinates for the master plan; never describe them as latitude/longitude.
When discussing P18, preserve its source identifiers exactly if relevant: property code P18, source id P18, source number P118.
When a visitor expresses buying or site-visit intent, naturally suggest the existing site-visit/contact option without claiming that a booking has been completed.
Keep answers concise and useful for chat. Prefer bullets for multiple properties.`;

function sanitizeHistory(conversation) {
  if (!Array.isArray(conversation)) return [];
  return conversation
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content.slice(0, MAX_MESSAGE_LENGTH) }]
    }));
}

function compactContext({ projects = [], details = [], properties = [], plots = [], matches = [] } = {}) {
  return JSON.stringify({
    projects,
    project_details: details,
    properties: properties.slice(0, MAX_CONTEXT_PROPERTIES),
    green_meadows_plots: plots.slice(0, MAX_CONTEXT_PLOTS),
    exact_matches: matches
  });
}

function requestedPlotNumbers(message) {
  const numbers = new Set();
  const patterns = [
    /\b(?:plot|site|property)\s*(?:no\.?|number|#)?\s*(\d{1,5})\b/gi,
    /\bP\s*(\d{1,5})\b/gi
  ];
  for (const pattern of patterns) {
    for (const match of message.matchAll(pattern)) numbers.add(Number(match[1]));
  }
  return [...numbers].slice(0, 5);
}

function wantsAvailability(message) {
  return /\b(available|availability|vacant|open|for sale|still available)\b/i.test(message);
}

function wantsProjects(message) {
  return /\b(projects?|locations?|developments?|properties?)\b/i.test(message) &&
    /\b(what|which|show|list|have|available|offer|options?)\b/i.test(message);
}

function wantsProjectDetails(message) {
  return /\b(amenit|location|where|address|rera|developer|about|facilit|landmark)\b/i.test(message);
}

async function findPlotsByNumber(numbers) {
  if (!numbers.length) return [];
  const rows = await supabaseGet('plot_details', {
    select: 'property_id,plot_number,plot_area,area_unit,label_x,label_y,rotation,display_order',
    plot_number: `in.(${numbers.join(',')})`,
    order: 'plot_number.asc',
    limit: String(numbers.length * 2)
  });
  if (!rows.length) return [];
  const uniqueIds = [...new Set(rows.map((row) => row.property_id).filter(Boolean))];
  const properties = await supabaseGet('properties', {
    select: 'id,project_id,property_code,slug,property_type,inventory_status,title,description,area,area_unit,price,currency,metadata',
    id: `in.(${uniqueIds.join(',')})`,
    order: 'property_code.asc'
  });
  const propertyMap = new Map(properties.map((row) => [row.id, row]));
  return rows.map((plot) => ({
    plot_number: plot.plot_number,
    plot_area: plot.plot_area,
    area_unit: plot.area_unit,
    property: propertyMap.get(plot.property_id) || null
  })).filter((row) => row.property);
}

async function loadContext(message) {
  const text = message.toLowerCase();
  const plotNumbers = requestedPlotNumbers(message);
  const exactPlots = await findPlotsByNumber(plotNumbers);

  const projects = await listProjects();
  const details = [];
  const properties = [];
  let plots = [];

  if (plotNumbers.length) {
    const projectIds = [...new Set(exactPlots.map((item) => item.property?.project_id).filter(Boolean))];
    for (const projectId of projectIds.slice(0, 3)) {
      const project = projects.find((item) => item.id === projectId);
      if (project) details.push(await getProjectDetails(project.slug));
    }
  } else if (wantsProjects(message) || wantsProjectDetails(message)) {
    for (const project of projects.slice(0, 8)) details.push(await getProjectDetails(project.slug));
  }

  if (wantsAvailability(message) || /\b(price|cost|budget|sq\.?\s*yd|square|area|size|facing)\b/i.test(message)) {
    properties.push(...await listProperties({ status: wantsAvailability(message) ? 'AVAILABLE' : undefined }));
  }

  if (/green\s+meadows|plot|site\b/i.test(text) && !plotNumbers.length) {
    plots = (await listProjectPlots('vr-green-meadows')) || [];
  }

  return compactContext({ projects, details, properties, plots, matches: exactPlots });
}

function extractText(payload) {
  const chunks = [];
  for (const candidate of payload?.candidates || []) {
    for (const part of candidate?.content?.parts || []) {
      if (typeof part?.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

function providerErrorDetails(payload) {
  const error = payload?.error && typeof payload.error === 'object' ? payload.error : {};
  return {
    status: typeof error.status === 'string' ? error.status : undefined,
    code: typeof error.code === 'number' || typeof error.code === 'string' ? error.code : undefined,
    message: typeof error.message === 'string' ? error.message : undefined
  };
}


export async function answerAssistant({ message, conversation = [], phone = '', profileName = '', channel = 'website' }) {
  if (typeof message !== 'string' || !message.trim()) {
    return { status: 400, error: { code: 'MESSAGE_REQUIRED', message: 'A message is required.' } };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { status: 400, error: { code: 'MESSAGE_TOO_LARGE', message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` } };
  }

  // 1. Process CRM Agent actions (Site visits, Enquiries, Detail updates)
  try {
    const agentResult = await processAgentMessage({
      message: message.trim(),
      conversation,
      phone,
      profileName,
      channel
    });
    if (agentResult && agentResult.reply) {
      return { status: 200, data: { reply: agentResult.reply, agentResult } };
    }
  } catch (agentErr) {
    console.warn('[assistant] crmAgentEngine error:', agentErr?.message || agentErr);
  }

  if (!process.env.GEMINI_API_KEY) {
    return { status: 503, error: { code: 'AI_NOT_CONFIGURED', message: 'The AI assistant is not configured yet.' } };
  }

  let context;
  try {
    context = await loadContext(message.trim());
  } catch (error) {
    console.error('[assistant] context load failed', error?.message || error);
    return { status: 502, error: { code: 'AI_CONTEXT_ERROR', message: 'The assistant could not load the latest property data.' } };
  }

  const contents = [
    ...sanitizeHistory(conversation),
    {
      role: 'user',
      parts: [{ text: `Verified Real Estate Brothers group data context:\n${context}\n\nVisitor question:\n${message.trim()}` }]
    }
  ];
  const endpoint = `${GEMINI_API_BASE_URL}/${encodeURIComponent(MODEL)}:generateContent`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.2 }
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    console.error('[assistant] Gemini provider request failed', {
      timeout: timedOut,
      message: timedOut ? 'Provider request timed out.' : (error?.message || 'Network request failed.'),
      model: MODEL
    });
    return { status: 502, error: { code: 'AI_PROVIDER_ERROR', message: 'The AI assistant is temporarily unavailable.' } };
  }

  if (!response.ok) {
    let providerPayload = null;
    try { providerPayload = await response.json(); } catch { await response.text().catch(() => ''); }
    const details = providerErrorDetails(providerPayload);
    console.error('[assistant] Gemini provider request failed', {
      status: response.status,
      type: details.status,
      code: details.code,
      message: details.message,
      model: MODEL
    });
    return { status: 502, error: { code: 'AI_PROVIDER_ERROR', message: 'The AI assistant is temporarily unavailable.' } };
  }

  let payload;
  try { payload = await response.json(); } catch {
    return { status: 502, error: { code: 'AI_INVALID_RESPONSE', message: 'The AI assistant returned an invalid response.' } };
  }

  const reply = extractText(payload);
  if (!reply) {
    console.error('[assistant] Gemini provider returned no text', { model: MODEL });
    return { status: 502, error: { code: 'AI_INVALID_RESPONSE', message: 'The AI assistant returned an invalid response.' } };
  }

  return { status: 200, data: { reply } };
}

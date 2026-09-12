# VR Real Estate — Integrated Website + CRM + AI + WhatsApp

This build keeps the existing website UI/UX intact and connects the existing Supabase-backed CRM, AI assistant, and WhatsApp Cloud API integration through the same backend. n8n is not required for the production WhatsApp flow.

## Local development

1. Copy `.env.example` to `.env` and fill the server-side secrets.
2. Install dependencies: `npm install`
3. Start the API: `npm run api`
4. In another terminal start the website: `npm run dev`
5. Vite serves the website on `http://localhost:3000` and proxies `/api` to the API on `http://localhost:3001`.

If you use a different API port, set `API_PORT` and update the Vite proxy target in `vite.config.js`.

## Netlify deployment

The included `netlify.toml` builds the Vite app and deploys `netlify/functions/backend.js`. `/api/*` is rewritten to the backend function.

Set these Netlify environment variables (server-side only):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `CRM_ACCESS_KEY`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_GRAPH_VERSION` (for example `v23.0`)
- `WHATSAPP_APP_SECRET` (recommended; enables Meta webhook signature verification)

Do not upload or commit `.env`.

## Meta WhatsApp webhook

For production, point the Meta WhatsApp webhook callback to:

`https://YOUR-NETLIFY-DOMAIN/api/whatsapp/webhook`

Use the same value as `WHATSAPP_VERIFY_TOKEN` in Meta's Verify Token field and subscribe to the `messages` webhook field.

The GET webhook endpoint performs Meta verification. POST webhook events are handled by the application, stored in Supabase, passed to the AI when AI is enabled for the conversation, and replied to through the WhatsApp Cloud API. Incoming WhatsApp leads and conversations appear in the existing CRM.

## Security

`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, WhatsApp access tokens, the Meta app secret, and `CRM_ACCESS_KEY` must remain server-side. The browser should only use the CRM access key through the existing CRM login flow.

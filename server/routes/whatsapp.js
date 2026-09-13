import crypto from 'node:crypto';
import { answerAssistant } from '../services/assistantService.js';
import { supabaseAdminGet, supabaseAdminPost, supabaseAdminPatch } from '../lib/supabaseAdmin.js';
import { createSiteVisitRecord, parseSchedule } from './bookings.js';

function textMessage(message) {
  return message?.type === 'text' && typeof message?.text?.body === 'string' ? message.text.body.trim() : '';
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function isBuyingIntent(text) {
  return /\b(buy|purchase|book|price|cost|plot|site|property|available|interested|invest)\b/i.test(text);
}

function isSiteVisitIntent(text) {
  return /\b(site\s*visit|visit|come\s+(?:to|and|see)|schedule|appointment|meet|see\s+the\s+plot|view\s+plot)\b/i.test(text);
}

function plotNumbers(text) {
  const numbers = new Set();
  for (const match of text.matchAll(/\b(?:plot|site|property)\s*(?:no\.?|number|#)?\s*(\d{1,5})\b/gi)) numbers.add(Number(match[1]));
  for (const match of text.matchAll(/\bP\s*(\d{1,5})\b/gi)) numbers.add(Number(match[1]));
  return [...numbers].slice(0, 5);
}

/**
 * Extracts site visit parameters (project, plot, date, time) from a customer message.
 */
function extractSiteVisitFromMessage(text) {
  if (!isSiteVisitIntent(text)) return null;

  // 1. Extract Plot Code: e.g. P17, Plot 17, Plot P17, etc.
  let plotCode = '';
  const plotMatch = text.match(/\b(?:plot|unit|site)?\s*#?\s*(P\s*\d{1,4})\b/i) ||
                    text.match(/\bplot\s*(?:no\.?|number|#)?\s*(\d{1,4})\b/i);
  if (plotMatch) {
    const raw = plotMatch[1].trim().replace(/\s+/g, '');
    plotCode = raw.toUpperCase().startsWith('P') ? raw.toUpperCase() : `P${raw}`;
  }

  // 2. Extract Project Name
  let projectName = 'VR Green Meadows';
  if (/silicon\s*valley|luxury\s*villas/i.test(text)) projectName = 'VR Luxury Villas';
  else if (/elite\s*towers|high\s*rise|apartment/i.test(text)) projectName = 'VR Elite Towers';
  else if (/agro\s*lands|green\s*acres|nature/i.test(text)) projectName = "Nature's Nest";
  else if (/prime\s*meadows/i.test(text)) projectName = 'VR Prime Meadows';
  else if (/green\s*meadows|amodha/i.test(text)) projectName = 'VR Green Meadows';

  // 3. Extract Date
  let dateStr = '';
  const now = new Date();
  const dateRegex = /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|October|Oct|Nov|Dec)[a-z]*(?:\s+\d{2,4})?)\b/i;
  const isoRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
  const relativeRegex = /\b(tomorrow|day after tomorrow|today|this sunday|this saturday|next sunday|next saturday)\b/i;

  const dMatch = text.match(dateRegex) || text.match(isoRegex) || text.match(relativeRegex);
  if (dMatch) {
    const rawDate = dMatch[1].toLowerCase();
    if (rawDate === 'tomorrow') {
      const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      dateStr = tmrw.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (rawDate === 'day after tomorrow') {
      const dat = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      dateStr = dat.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (rawDate === 'today') {
      dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
      dateStr = dMatch[1];
    }
  } else {
    const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    dateStr = tmrw.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // 4. Extract Time Slot
  let timeStr = '11:00 AM';
  const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i) ||
                    text.match(/\b(morning|afternoon|evening)\b/i);
  if (timeMatch) {
    timeStr = timeMatch[1].toUpperCase();
  }

  return {
    projectName,
    plotCode: plotCode || 'P17',
    date: dateStr,
    time: timeStr
  };
}

async function graphSendText(to, body) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
  if (!token || !phoneId) throw new Error('WhatsApp Cloud API is not configured.');
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    let parsed;
    try { parsed = JSON.parse(errorBody); } catch (_) {}
    if (response.status === 401 || parsed?.error?.code === 190) {
      throw new Error(`WhatsApp authentication failed (Code 190). Your WHATSAPP_ACCESS_TOKEN in .env has expired or is invalid: ${errorBody}`);
    }
    throw new Error(`WhatsApp send failed: ${response.status} ${errorBody}`);
  }
  return response.json();
}

function verifySignature(req) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true;
  const signature = req.headers['x-hub-signature-256'] || '';
  const rawBody = Buffer.isBuffer(req.rawBody)
    ? req.rawBody
    : Buffer.from(
      typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body || {}),
      'utf8'
    );
  if (!signature.startsWith('sha256=')) return false;
  const expected = `sha256=${crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function findOrCreateLead(phone, profileName) {
  const existing = await supabaseAdminGet('leads', { select: 'id,name,phone,email,source,status,notes', phone: `eq.${phone}`, limit: '1' });
  if (existing[0]) {
    if (!existing[0].name && profileName) {
      return (await supabaseAdminPatch('leads', { id: `eq.${existing[0].id}` }, { name: profileName, updated_at: new Date().toISOString() }))[0];
    }
    return existing[0];
  }
  return (await supabaseAdminPost('leads', {
    name: profileName || null,
    phone,
    source: 'whatsapp',
    status: 'new',
    notes: 'Created automatically from WhatsApp.'
  }))[0];
}

async function findOrCreateConversation(phone, leadId) {
  const existing = await supabaseAdminGet('whatsapp_conversations', { select: 'id,lead_id,phone,status,ai_enabled', phone: `eq.${phone}`, limit: '1' });
  if (existing[0]) return existing[0];
  return (await supabaseAdminPost('whatsapp_conversations', { phone, lead_id: leadId, status: 'open', ai_enabled: true }))[0];
}

async function conversationHistory(conversationId) {
  const rows = await supabaseAdminGet('whatsapp_messages', {
    select: 'direction,body,created_at',
    conversation_id: `eq.${conversationId}`,
    order: 'created_at.desc',
    limit: '12'
  });
  return rows.reverse().filter((row) => row.body).map((row) => ({ role: row.direction === 'outbound' ? 'assistant' : 'user', content: row.body }));
}

async function recordPlotInterest(leadId, text) {
  const numbers = plotNumbers(text);
  if (!numbers.length) return;
  const details = await supabaseAdminGet('plot_details', {
    select: 'property_id,plot_number',
    plot_number: `in.(${numbers.join(',')})`,
    limit: String(numbers.length * 2)
  });
  for (const detail of details) {
    const existing = await supabaseAdminGet('lead_properties', {
      select: 'lead_id,property_id,interest_type',
      lead_id: `eq.${leadId}`,
      property_id: `eq.${detail.property_id}`,
      limit: '1'
    });
    if (existing[0]) continue;
    await supabaseAdminPost('lead_properties', {
      lead_id: leadId,
      property_id: detail.property_id,
      interest_type: 'whatsapp_interest',
      notes: `Customer mentioned plot ${detail.plot_number} on WhatsApp.`
    });
  }
}

async function updateLeadFromMessage(lead, text) {
  const now = new Date().toISOString();
  const update = { updated_at: now };
  if (isSiteVisitIntent(text)) update.status = 'site_visit';
  else if (isBuyingIntent(text) && ['new', 'contacted'].includes(lead.status || 'new')) update.status = 'qualified';
  else if ((lead.status || 'new') === 'new') update.status = 'contacted';
  await supabaseAdminPatch('leads', { id: `eq.${lead.id}` }, update);
}

export async function handleWhatsApp(req, pathParts, searchParams, body = {}) {
  // 1. Meta Webhook Verification (GET)
  if (req.method === 'GET' && pathParts[2] === 'webhook') {
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('[whatsapp] webhook verification successful, returning hub challenge');
      return { status: 200, raw: challenge || '' };
    }
    console.warn('[whatsapp] webhook verification failed. Token mismatch.');
    return { status: 403, error: { code: 'WEBHOOK_VERIFY_FAILED', message: 'Webhook verification failed.' } };
  }

  if (req.method !== 'POST' || pathParts[2] !== 'webhook') return null;

  console.log('[whatsapp] POST webhook received');

  // 2. Signature verification
  if (!verifySignature(req)) {
    console.error('[whatsapp] signature verification FAILED');
    return { status: 403, error: { code: 'WEBHOOK_SIGNATURE_INVALID', message: 'Webhook signature is invalid.' } };
  }

  const entries = Array.isArray(body.entry) ? body.entry : [];
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      if (change.field !== 'messages' && !value.messages) continue;
      for (const message of value.messages || []) {
        const phone = normalizePhone(message.from);
        const text = textMessage(message);
        if (!phone || !text || !message.id) continue;

        // Persistent Deduplication: Skip if message ID already processed
        const duplicate = await supabaseAdminGet('whatsapp_messages', {
          select: 'id',
          whatsapp_message_id: `eq.${message.id}`,
          limit: '1'
        }).catch(() => []);
        if (duplicate[0]) {
          console.log(`[whatsapp] skipping duplicate message id ${message.id}`);
          continue;
        }

        console.log(`[whatsapp] incoming message from ${phone}: "${text}" (id: ${message.id})`);

        try {
          const profileName = value.contacts?.[0]?.profile?.name || '';
          const lead = await findOrCreateLead(phone, profileName);
          const conversation = await findOrCreateConversation(phone, lead.id);

          await supabaseAdminPost('whatsapp_messages', {
            conversation_id: conversation.id,
            whatsapp_message_id: message.id,
            direction: 'inbound',
            message_type: 'text',
            body: text,
            raw_payload: message
          });
          await supabaseAdminPatch('whatsapp_conversations', { id: `eq.${conversation.id}` }, {
            lead_id: lead.id,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          await updateLeadFromMessage(lead, text).catch((error) => console.error('[whatsapp] lead update failed:', error?.message || error));
          await recordPlotInterest(lead.id, text).catch((error) => console.error('[whatsapp] interest tracking failed:', error?.message || error));

          // 3. WHATSAPP AI SITE VISIT CREATION FLOW (Critical Fix)
          let siteVisitCreated = null;
          const visitDetails = extractSiteVisitFromMessage(text);
          if (visitDetails) {
            console.log(`[whatsapp-ai] detected site visit request:`, visitDetails);
            try {
              // Deduplicate: Check if a visit with this message ID was already created in notes
              const existingVisits = await supabaseAdminGet('site_visits', {
                select: 'id',
                lead_id: `eq.${lead.id}`,
                notes: `ilike.%${message.id}%`,
                limit: '1'
              }).catch(() => []);

              if (!existingVisits[0]) {
                const visitRecord = await createSiteVisitRecord({
                  name: profileName || lead.name || 'WhatsApp Customer',
                  phone,
                  projectName: visitDetails.projectName,
                  propertyCode: visitDetails.plotCode,
                  date: visitDetails.date,
                  time: visitDetails.time,
                  notes: `[WhatsApp AI Site Visit Request] Message ID: ${message.id} | Query: "${text}"`,
                  source: 'WhatsApp AI'
                });
                siteVisitCreated = visitRecord;
                console.log(`[whatsapp-ai] Site visit created successfully in Supabase (id: ${visitRecord?.visit?.id})`);
              } else {
                console.log(`[whatsapp-ai] duplicate site visit request detected for message id ${message.id}, skipped.`);
              }
            } catch (svErr) {
              console.error('[whatsapp-ai] Failed to create site visit record:', svErr?.message || svErr);
            }
          }

          // 4. AI Assistant Response
          if (conversation.ai_enabled !== false) {
            console.log('[whatsapp] asking AI assistant...');
            const history = await conversationHistory(conversation.id);
            const result = await answerAssistant({ message: text, conversation: history });
            let reply = result.status === 200
              ? result.data.reply
              : 'Thanks for reaching out to Real Estate Brothers group. Our team will get back to you shortly.';

            // If site visit was just created, append confirmation
            if (siteVisitCreated && siteVisitCreated.visit) {
              const confirmAddon = `\n\n📅 *Site Visit Request Recorded:*\nWe have submitted your request to visit *${visitDetails.projectName}* (${visitDetails.plotCode ? `Plot ${visitDetails.plotCode}` : 'Unit'}) on *${visitDetails.date}* at *${visitDetails.time}* for owner confirmation. You will receive an official confirmation message once reviewed! ✅`;
              if (!reply.includes('Site Visit Request Recorded')) {
                reply += confirmAddon;
              }
            }

            console.log(`[whatsapp] sending reply to ${phone}: "${reply}"`);
            const raw = await graphSendText(phone, reply);
            console.log('[whatsapp] reply sent successfully');

            await supabaseAdminPost('whatsapp_messages', {
              conversation_id: conversation.id,
              direction: 'outbound',
              message_type: 'text',
              body: reply,
              raw_payload: raw
            });
            await supabaseAdminPatch('whatsapp_conversations', { id: `eq.${conversation.id}` }, {
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        } catch (msgErr) {
          console.error('[whatsapp] error processing message:', msgErr?.message || msgErr);
        }
      }
    }
  }
  return { status: 200, data: { received: true } };
}

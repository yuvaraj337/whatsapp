import { supabaseAdminGet, supabaseAdminPatch, supabaseAdminPost } from '../lib/supabaseAdmin.js';
import { createSiteVisitRecord, parseSchedule, resolvePropertyId } from '../routes/bookings.js';

function cleanStr(val) {
  return typeof val === 'string' ? val.trim() : '';
}

function normalizePhone(val) {
  const digits = String(val || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export function extractEmail(text) {
  if (!text) return '';
  const match = String(text).match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  return match ? match[0].trim() : '';
}

export function extractPhone(text) {
  if (!text) return '';
  // Match 10-digit Indian phone, optionally with +91 or 0
  const match = String(text).match(/(?:(?:\+?91|0)?[-\s]?)?([6-9]\d{9})\b/);
  if (match) return match[1];
  const loose = String(text).match(/\b\d{10}\b/);
  return loose ? loose[0] : '';
}

export function extractPlotCode(text) {
  if (!text) return '';
  const s = String(text);
  
  // P-series: P17, Plot P17, Plot 17, P05, P-05
  const pMatch = s.match(/\b(?:plot|site|unit)?\s*#?\s*P-?\s*0*([1-9]\d?)\b/i) ||
                 s.match(/\bplot\s*(?:no\.?|number|#)?\s*0*([1-9]\d?)\b/i);
  if (pMatch) {
    const num = parseInt(pMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 200) {
      return `P${String(num).padStart(2, '0')}`;
    }
  }

  // Villa: V01, Villa V01, Villa 1
  const vMatch = s.match(/\b(?:villa|v)\s*#?\s*0*([1-9]\d?)\b/i);
  if (vMatch) {
    const num = parseInt(vMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 50) {
      return `V${String(num).padStart(2, '0')}`;
    }
  }

  // Apartments: A-101, B-202, Unit A101
  const aMatch = s.match(/\b([AB])-?0*(\d{3})\b/i);
  if (aMatch) {
    return `${aMatch[1].toUpperCase()}-${aMatch[2]}`;
  }

  // Farmlands: F-GREEN-VALLEY, Nature's Nest, Siri Agro
  if (/green[-_\s]?valley/i.test(s)) return 'F-GREEN-VALLEY';
  if (/nature/i.test(s)) return 'F-NATURES-NEST';
  if (/siri/i.test(s)) return 'F-SIRI-AGRO';
  const fMatch = s.match(/\b(F-[A-Z0-9-]+)\b/i);
  if (fMatch) return fMatch[1].toUpperCase();

  return '';
}

export function extractProject(text, plotCode = '') {
  const s = String(text || '').toLowerCase();
  if (s.includes('villa') || plotCode.startsWith('V')) return 'VR Luxury Villas';
  if (s.includes('tower') || s.includes('apartment') || s.includes('height') || plotCode.startsWith('A-') || plotCode.startsWith('B-')) return 'VR Elite Towers';
  if (s.includes('agro') || s.includes('farm') || s.includes('nature') || plotCode.startsWith('F-')) return 'VR Agro Lands';
  if (s.includes('green meadows') || s.includes('amodha') || plotCode.startsWith('P')) return 'VR Green Meadows';
  return 'VR Green Meadows';
}

export function extractName(text, previousAssistantMsg = '') {
  if (!text) return '';
  const s = String(text).trim();

  // 1. Explicit name patterns
  const explicit = s.match(/(?:my\s+name\s+is|name\s+is|name\s*:|i\s+am|i'm|this\s+is)\s+([A-Za-z][A-Za-z\s.]{1,25})/i);
  if (explicit && explicit[1]) {
    const candidate = explicit[1].trim();
    if (!/^(?:booking|interested|looking|calling|visiting|checking|inquiring|here)$/i.test(candidate)) {
      return candidate;
    }
  }

  // 2. If previous assistant message specifically asked for name
  if (previousAssistantMsg && /full\s*name|your\s*name/i.test(previousAssistantMsg)) {
    // Check if the message starts with or is simply a person's name (2-3 words, capitalized or alphabetic)
    const lines = s.split(/[\n,]/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[A-Za-z]{2,15}(?:\s+[A-Za-z]{2,15}){1,2}$/.test(trimmed)) {
        if (!/^(?:site\s*visit|book\s*visit|tomorrow|morning|evening)$/i.test(trimmed)) {
          return trimmed;
        }
      }
    }
  }

  return '';
}

export function extractSchedule(text) {
  const s = String(text || '');
  const now = new Date();

  let dateStr = '';
  const dateRegex = /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|October|Oct|Nov|Dec)[a-z]*(?:\s+\d{2,4})?)\b/i;
  const isoRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
  const relativeRegex = /\b(tomorrow|day after tomorrow|today|this sunday|this saturday|next sunday|next saturday)\b/i;

  const dMatch = s.match(dateRegex) || s.match(isoRegex) || s.match(relativeRegex);
  if (dMatch) {
    const raw = dMatch[1].toLowerCase();
    if (raw === 'tomorrow') {
      const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      dateStr = tmrw.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (raw === 'day after tomorrow') {
      const dat = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      dateStr = dat.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (raw === 'today') {
      dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
      dateStr = dMatch[1];
    }
  } else {
    // Default to tomorrow if not specified in booking request
    const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    dateStr = tmrw.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  let timeStr = '11:00 AM';
  const timeMatch = s.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i) ||
                    s.match(/\b(morning|afternoon|evening)\b/i);
  if (timeMatch) {
    timeStr = timeMatch[1].toUpperCase();
    if (timeStr === 'MORNING') timeStr = '10:00 AM';
    else if (timeStr === 'AFTERNOON') timeStr = '02:00 PM';
    else if (timeStr === 'EVENING') timeStr = '04:30 PM';
  }

  return { date: dateStr, time: timeStr };
}

export function isUpdateIntent(text) {
  const s = String(text || '').toLowerCase();
  return /\b(?:change|update|correct|modify|edit)\s+(?:my\s+)?(?:email|mail|name|phone|mobile|number|plot|visit|booking|date|time)\b/i.test(s) ||
         /\b(?:my\s+(?:email|mail)\s+is\s+actually|my\s+name\s+is\s+actually|please\s+(?:update|change))\b/i.test(s);
}

export function isSiteVisitIntent(text, previousAssistantMsg = '') {
  const s = String(text || '').toLowerCase();
  if (/\b(site\s*visit|visit|come\s+(?:to|and|see)|schedule\s+(?:a\s+)?visit|appointment|book\s+(?:a\s+)?visit|see\s+the\s+plot|view\s+plot)\b/i.test(s)) {
    return true;
  }
  if (previousAssistantMsg && /site\s*visit/i.test(previousAssistantMsg) && /(?:full\s*name|email|mobile|plot)/i.test(previousAssistantMsg)) {
    return true;
  }
  return false;
}

export function isEnquiryIntent(text, previousAssistantMsg = '') {
  const s = String(text || '').toLowerCase();
  if (/\b(enquiry|inquiry|enquire|inquire|brochure|price\s*list|payment\s*plan|cost\s*sheet|interested\s+in\s+buying|want\s+to\s+buy|call\s+me\s+back|send\s+details)\b/i.test(s)) {
    return true;
  }
  if (previousAssistantMsg && /enquiry/i.test(previousAssistantMsg) && /(?:full\s*name|email|mobile)/i.test(previousAssistantMsg)) {
    return true;
  }
  return false;
}

/**
 * Parses conversational history to aggregate already provided user information.
 */
export function aggregateConversationContext(conversation = [], currentMessage = '') {
  let name = '';
  let email = '';
  let phone = '';
  let plotCode = '';
  let projectName = '';
  let lastAssistantMsg = '';

  const messages = [...(conversation || []), { role: 'user', content: currentMessage }];

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === 'assistant' || m.role === 'model') {
      lastAssistantMsg = m.content || '';
      continue;
    }

    const content = m.content || '';
    if (!email) email = extractEmail(content);
    if (!phone) phone = extractPhone(content);
    if (!plotCode) plotCode = extractPlotCode(content);
    if (!name) name = extractName(content, lastAssistantMsg);
    if (!projectName && (plotCode || content)) projectName = extractProject(content, plotCode);
  }

  return { name, email, phone, plotCode, projectName, lastAssistantMsg };
}

/**
 * Handles detail update requests from customers (e.g. changing name, email, phone, plot, or schedule).
 * Updates Supabase `leads` and `site_visits` tables in real time so changes reflect in the CRM dashboard.
 */
export async function handleDetailUpdate({ phone, email, text, conversation = [] }) {
  const s = String(text || '');
  const newEmail = extractEmail(s);
  const newPhone = extractPhone(s);
  const newPlot = extractPlotCode(s);
  const schedule = extractSchedule(s);
  const hasDateOrTime = /\b(?:tomorrow|today|day after tomorrow|am|pm|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+)\b/i.test(s);

  // Extract new name if specified
  let newName = '';
  const nameMatch = s.match(/(?:change|update|correct|set)?\s*(?:my\s+)?name\s+(?:to|is)\s+([A-Za-z][A-Za-z\s.]{1,25})/i) ||
                    s.match(/(?:my\s+name\s+is\s+actually)\s+([A-Za-z][A-Za-z\s.]{1,25})/i);
  if (nameMatch && nameMatch[1]) {
    newName = nameMatch[1].trim();
  }

  // Identify target lead: by phone or email or conversation history
  const context = aggregateConversationContext(conversation, text);
  const targetPhone = phone || newPhone || context.phone;
  const targetEmail = email || newEmail || context.email;

  let lead = null;
  if (targetPhone) {
    const norm = normalizePhone(targetPhone);
    const rows = await supabaseAdminGet('leads', {
      select: 'id,name,phone,email,notes',
      phone: `eq.${norm}`,
      limit: '1'
    }).catch(() => []);
    if (rows[0]) lead = rows[0];
  }

  if (!lead && targetEmail) {
    const rows = await supabaseAdminGet('leads', {
      select: 'id,name,phone,email,notes',
      email: `eq.${targetEmail}`,
      limit: '1'
    }).catch(() => []);
    if (rows[0]) lead = rows[0];
  }

  if (!lead) {
    return {
      handled: true,
      reply: `I'd be happy to update your details! Could you please specify your registered **Mobile Number** along with the new name or email you'd like to set?`
    };
  }

  // Update lead in Supabase
  const leadUpdates = { updated_at: new Date().toISOString() };
  const changeSummary = [];

  if (newName && newName !== lead.name) {
    leadUpdates.name = newName;
    changeSummary.push(`👤 **Name:** ${newName}`);
  }
  if (newEmail && newEmail !== lead.email) {
    leadUpdates.email = newEmail;
    changeSummary.push(`✉️ **Email:** ${newEmail}`);
  }
  if (newPhone && newPhone !== lead.phone) {
    leadUpdates.phone = normalizePhone(newPhone);
    changeSummary.push(`📞 **Phone:** ${newPhone}`);
  }

  if (Object.keys(leadUpdates).length > 1) {
    await supabaseAdminPatch('leads', { id: `eq.${lead.id}` }, leadUpdates);
  }

  // Check if customer wants to update their site visit plot or schedule
  if (newPlot || hasDateOrTime) {
    const visits = await supabaseAdminGet('site_visits', {
      select: 'id,property_id,scheduled_at,notes',
      lead_id: `eq.${lead.id}`,
      order: 'created_at.desc',
      limit: '1'
    }).catch(() => []);

    if (visits[0]) {
      const visitUpdate = { updated_at: new Date().toISOString() };
      if (newPlot) {
        const resolvedPropId = await resolvePropertyId({
          propertyCode: newPlot,
          projectName: 'VR Green Meadows'
        });
        if (resolvedPropId) {
          visitUpdate.property_id = resolvedPropId;
          changeSummary.push(`🏡 **Plot / Property:** Plot ${newPlot}`);
        }
      }
      if (hasDateOrTime) {
        const scheduledIso = parseSchedule(schedule.date, schedule.time);
        if (scheduledIso) {
          visitUpdate.scheduled_at = scheduledIso;
          changeSummary.push(`📅 **Scheduled Time:** ${schedule.date} at ${schedule.time}`);
        }
      }
      await supabaseAdminPatch('site_visits', { id: `eq.${visits[0].id}` }, visitUpdate);
    }
  }

  if (changeSummary.length === 0) {
    return {
      handled: true,
      reply: `I received your request to update your details. Could you please specify the exact **Name** or **Email** you would like to set? (e.g., "Change my email to yourname@example.com")`
    };
  }

  return {
    handled: true,
    reply: `✅ **Details Successfully Updated!**\n\nI have updated your information in our system:\n\n${changeSummary.join('\n')}\n\nThese changes have been synchronized with our CRM dashboard immediately.`
  };
}

/**
 * Handles the complete site visit booking conversation.
 * If details are missing, politely prompts the customer.
 * Once details are complete, creates the record and notifies the customer.
 */
export async function handleSiteVisitBooking({
  text,
  conversation = [],
  phone = '',
  profileName = '',
  channel = 'website'
}) {
  const context = aggregateConversationContext(conversation, text);
  
  const customerName = context.name || profileName || '';
  const customerPhone = context.phone || phone || '';
  const customerEmail = context.email || '';
  const plotCode = context.plotCode || 'P17';
  const projectName = context.projectName || 'VR Green Meadows';
  const schedule = extractSchedule(text);

  // Check for missing required details
  const missing = [];
  if (!customerName || customerName.length < 2) missing.push('Full Name');
  if (!customerPhone || customerPhone.length < 10) missing.push('10-digit Mobile Number');
  if (!customerEmail || !customerEmail.includes('@')) missing.push('Email Address');

  if (missing.length > 0) {
    const missingStr = missing.map(m => `**${m}**`).join(', ');
    return {
      handled: true,
      needMoreInfo: true,
      reply: `I would be delighted to arrange a site visit for you to **${projectName}**${context.plotCode ? ` (Plot ${context.plotCode})` : ''}!\n\nTo confirm your appointment, could you please provide your ${missingStr}${!context.plotCode ? ', and which **Plot / Property** you would like to visit' : ''}?`
    };
  }

  // All details present -> Book the site visit!
  try {
    const visitResult = await createSiteVisitRecord({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      projectName,
      propertyCode: plotCode,
      date: schedule.date,
      time: schedule.time,
      notes: `Booked via ${channel === 'whatsapp' ? 'WhatsApp Agent' : 'Website AI Chatbot'}. Query: "${cleanStr(text)}"`,
      source: channel === 'whatsapp' ? 'WhatsApp' : 'Website AI'
    });

    return {
      handled: true,
      booked: true,
      siteVisitId: visitResult?.site_visit_id || visitResult?.visit?.id,
      reply: `📅 **Site Visit Successfully Booked!**\n\nHello **${customerName}**,\nYour site visit request has been recorded and submitted to our sales team.\n\n📍 **Project:** ${projectName}\n🏡 **Plot / Property:** Plot ${plotCode}\n📅 **Date & Time:** ${schedule.date} at ${schedule.time}\n📞 **Contact:** ${customerPhone}\n✉️ **Email:** ${customerEmail}\n\nOur site coordinator will review your request and send an official confirmation shortly. If you ever need to change your name, email, or reschedule, simply message me here anytime!`
    };
  } catch (err) {
    console.error('[crmAgentEngine] site visit booking error:', err?.message || err);
    return {
      handled: true,
      error: true,
      reply: `I encountered an issue recording your site visit: ${err.message}. Please verify your contact details and try again.`
    };
  }
}

/**
 * Handles enquiry capturing conversation.
 * Prompts for missing contact details and registers enquiry in CRM.
 */
export async function handleEnquirySubmission({
  text,
  conversation = [],
  phone = '',
  profileName = '',
  channel = 'website'
}) {
  const context = aggregateConversationContext(conversation, text);

  const customerName = context.name || profileName || '';
  const customerPhone = context.phone || phone || '';
  const customerEmail = context.email || '';
  const plotCode = context.plotCode || '';
  const projectName = context.projectName || 'VR Green Meadows';

  const missing = [];
  if (!customerName || customerName.length < 2) missing.push('Full Name');
  if (!customerPhone || customerPhone.length < 10) missing.push('10-digit Mobile Number');
  if (!customerEmail || !customerEmail.includes('@')) missing.push('Email Address');

  if (missing.length > 0) {
    const missingStr = missing.map(m => `**${m}**`).join(', ');
    return {
      handled: true,
      needMoreInfo: true,
      reply: `I'd be glad to assist you with your enquiry regarding **${projectName}**!\n\nTo connect you with our sales manager and send the complete information, could you please provide your ${missingStr}?`
    };
  }

  // Extract clean enquiry message (the actual question)
  let cleanMessage = cleanStr(text)
    .replace(/(?:my\s+name\s+is|name\s*:|email\s*:|phone\s*:|mobile\s*:)[^\n,]+/gi, '')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '')
    .replace(/(?:(?:\+?91|0)?[-\s]?)?[6-9]\d{9}\b/g, '')
    .trim();
  if (!cleanMessage || cleanMessage.length < 3) {
    cleanMessage = 'Customer requested pricing and brochure details via chat';
  }

  try {
    const normPhone = normalizePhone(customerPhone);
    const source = channel === 'whatsapp' ? 'WhatsApp' : 'Website AI';

    // Find or create lead
    let lead = (await supabaseAdminGet('leads', { select: 'id,name,phone,email', phone: `eq.${normPhone}`, limit: '1' }).catch(() => []))[0];
    if (lead) {
      const upd = { updated_at: new Date().toISOString() };
      if (customerName) upd.name = customerName;
      if (customerEmail) upd.email = customerEmail;
      await supabaseAdminPatch('leads', { id: `eq.${lead.id}` }, upd).catch(() => null);
    } else {
      const created = await supabaseAdminPost('leads', {
        name: customerName,
        phone: normPhone,
        email: customerEmail || null,
        source,
        status: 'new',
        notes: cleanMessage
      }).catch(() => []);
      lead = created[0];
    }

    // Resolve property and record enquiry in lead_properties
    const propId = await resolvePropertyId({ propertyCode: plotCode, projectName });
    if (propId && lead?.id) {
      await supabaseAdminPost('lead_properties', {
        lead_id: lead.id,
        property_id: propId,
        interest_type: 'enquiry',
        notes: cleanMessage
      }).catch(() => null);
    }

    return {
      handled: true,
      enquiryId: lead?.id,
      reply: `✉️ **Enquiry Successfully Recorded!**\n\nThank you **${customerName}**! Your enquiry regarding **${projectName}**${plotCode ? ` (${plotCode})` : ''} has been sent to our sales team.\n\n📝 **Your Note:** "${cleanMessage}"\n📞 **Contact:** ${customerPhone}\n✉️ **Email:** ${customerEmail}\n\nOur relationship manager will review your enquiry in our CRM dashboard and reach out to you shortly with full project details.`
    };
  } catch (err) {
    console.error('[crmAgentEngine] enquiry error:', err?.message || err);
    return {
      handled: true,
      error: true,
      reply: `Failed to record enquiry: ${err.message}. Please try again.`
    };
  }
}

/**
 * Master dispatcher for any incoming customer message on WhatsApp or Website AI Chatbot.
 * Evaluates update, site visit booking, and enquiry intents before falling back to general assistant.
 */
export async function processAgentMessage({
  message = '',
  conversation = [],
  phone = '',
  profileName = '',
  channel = 'website'
}) {
  const text = cleanStr(message);
  if (!text) return null;

  const lastAssistantMsg = conversation.length
    ? (conversation[conversation.length - 1].role === 'assistant' ? conversation[conversation.length - 1].content : '')
    : '';

  // 1. Check for Detail Update (name, email, phone, plot, schedule)
  if (isUpdateIntent(text)) {
    console.log(`[crmAgentEngine] detected update intent on ${channel}`);
    return handleDetailUpdate({ phone, text, conversation });
  }

  // 2. Check for Site Visit Booking intent
  if (isSiteVisitIntent(text, lastAssistantMsg)) {
    console.log(`[crmAgentEngine] detected site visit booking intent on ${channel}`);
    return handleSiteVisitBooking({
      text,
      conversation,
      phone,
      profileName,
      channel
    });
  }

  // 3. Check for Enquiry submission intent
  if (isEnquiryIntent(text, lastAssistantMsg)) {
    console.log(`[crmAgentEngine] detected enquiry intent on ${channel}`);
    return handleEnquirySubmission({
      text,
      conversation,
      phone,
      profileName,
      channel
    });
  }

  // No special workflow triggered -> return null to allow standard AI answering
  return null;
}

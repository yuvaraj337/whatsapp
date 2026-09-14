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
  // Strip email addresses first so timestamp numbers or numbers in email domains/localparts aren't mistaken for phones
  const withoutEmails = String(text).replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  
  // Match 10-digit Indian phone, optionally with +91 or 0
  const match = withoutEmails.match(/(?:(?:\+?91|0)?[-\s]?)?([6-9]\d{9})\b/);
  if (match) return match[1];
  const loose = withoutEmails.match(/\b\d{10}\b/);
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
  const explicit = s.match(/(?:my\s+name\s+is|name\s+is|name\s*:|i\s+am|i'm|this\s+is)\s+([A-Za-z][A-Za-z\s.]{1,35})/i);
  if (explicit && explicit[1]) {
    const candidate = explicit[1].replace(/\b(?:and|email|mail|phone|mobile|plot|number)\b.*$/i, '').trim();
    if (candidate && !/^(?:booking|interested|looking|calling|visiting|checking|inquiring|here)$/i.test(candidate)) {
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

export const GREETING_RESPONSE = `Hello! I am the VR Real Estate AI Assistant. I am here to help you with information regarding our projects, including:

*   **VR Green Meadows** (Open Plots)
*   **VR Agro Lands** (Farm Lands)
*   **VR Green Villas** (Luxury Villas)
*   **VR Heights** (Premium Apartments)

How can I assist you today? Would you like to know more about any of these projects or schedule a site visit?`;

export function isGreeting(text) {
  if (!text) return false;
  const s = String(text).trim().toLowerCase();
  
  // 1. Single-word or short greeting phrases
  if (/^(?:hi|hello|hey|hola|namaste|vanakkam|good\s*(?:morning|afternoon|evening|day)|greetings|start|menu|help|info|who\s*are\s*you|what\s*do\s*you\s*do|hi\s*there|hello\s*there)[.!?\s]*$/i.test(s)) {
    return true;
  }

  // 2. Generic greeting questions asking for project overview or what is available
  if (/^(?:tell\s+me\s+about\s+(?:your\s+)?projects|what\s+projects\s+(?:do\s+you\s+have|are\s+available)|list\s+(?:all\s+)?projects|show\s+projects|all\s+projects|what\s+are\s+the\s+projects|what\s+do\s+you\s+offer)[.!?\s]*$/i.test(s)) {
    return true;
  }

  return false;
}

export function isProjectInfoRequest(text) {
  if (!text) return null;
  const s = String(text).trim().toLowerCase();
  
  // Specific project queries:
  if (/^(?:tell\s+me\s+about|details\s+(?:of|for|about)|information\s+about|what\s+is|explain)\s+(?:the\s+)?(?:project\s+)?(?:vr\s+)?green\s+meadows\b/i.test(s) ||
      /\b(?:about|details)\s+vr\s+green\s+meadows\b/i.test(s) ||
      /^(?:vr\s+)?green\s+meadows[.!?\s]*$/i.test(s)) {
    return 'green-meadows';
  }

  if (/^(?:tell\s+me\s+about|details\s+(?:of|for|about)|information\s+about|what\s+is|explain)\s+(?:the\s+)?(?:project\s+)?(?:vr\s+)?agro\s+lands?\b/i.test(s) ||
      /\b(?:about|details)\s+vr\s+agro\s+lands?\b/i.test(s) ||
      /^(?:vr\s+)?agro\s+lands?[.!?\s]*$/i.test(s)) {
    return 'agro-lands';
  }

  if (/^(?:tell\s+me\s+about|details\s+(?:of|for|about)|information\s+about|what\s+is|explain)\s+(?:the\s+)?(?:project\s+)?(?:vr\s+)?(?:green\s+|luxury\s+)?villas?\b/i.test(s) ||
      /\b(?:about|details)\s+vr\s+(?:green\s+|luxury\s+)?villas?\b/i.test(s) ||
      /^(?:vr\s+)?(?:green\s+|luxury\s+)?villas?[.!?\s]*$/i.test(s)) {
    return 'green-villas';
  }

  if (/^(?:tell\s+me\s+about|details\s+(?:of|for|about)|information\s+about|what\s+is|explain)\s+(?:the\s+)?(?:project\s+)?(?:vr\s+)?heights?\b/i.test(s) ||
      /\b(?:about|details)\s+vr\s+heights?\b/i.test(s) ||
      /^(?:vr\s+)?heights?[.!?\s]*$/i.test(s)) {
    return 'heights';
  }

  return null;
}

export function getProjectInfoResponse(type) {
  if (type === 'green-meadows') {
    return `🌿 **VR Green Meadows** (Open Plots)
• **Type:** Premium RERA-Approved Residential Plots (Amodha Plots)
• **Location:** Shadnagar / Bengaluru Highway Growth Corridor, Hyderabad
• **Plot Sizes:** 200, 220, and 250 sq. yds (East, West & North facing)
• **Price:** Starting from ₹32 Lakhs (₹16,000 / sq.yd)
• **Features:** 40ft & 60ft blacktop roads, underground drainage, electricity, 24/7 security, lush parks & children's play area.
• **Status:** Clear title, ready for immediate registration.

Would you like more details about available plots, or would you like to schedule a site visit?`;
  }
  if (type === 'agro-lands') {
    return `🌾 **VR Agro Lands** (Farm Lands)
• **Type:** Premium Managed Farmlands & Weekend Agro Estates
• **Location:** Nature's Nest / Green Valley Corridor, near Hyderabad
• **Land Sizes:** 0.5 Acre (20 Guntas), 1 Acre, and 2 Acres
• **Price:** Starting from ₹25 Lakhs per half-acre
• **Features:** Managed organic fruit plantation (Mango, Guava, Teak), drip irrigation, 24/7 water supply, clubhouse access & fencing.
• **Status:** Clear title with spot registration.

Would you like more details about farmland units, or would you like to schedule a site visit?`;
  }
  if (type === 'green-villas') {
    return `🏡 **VR Green Villas** (Luxury Villas)
• **Type:** Ultra-Luxury 4 BHK & 5 BHK Triplex Gated Community Villas
• **Location:** Silicon Valley / Tech Growth Corridor, Hyderabad
• **Villa Sizes:** 3,400 to 4,500 sq.ft built-up area (East & West facing)
• **Price:** Starting from ₹1.75 Cr to ₹2.20 Cr
• **Features:** Private terrace garden, home theatre, private elevator, grand 30,000 sq.ft clubhouse, swimming pool, and 3-tier security.
• **Status:** Available for booking.

Would you like more details on floor plans, or would you like to schedule a site visit?`;
  }
  if (type === 'heights') {
    return `🏢 **VR Heights** (Premium Apartments)
• **Type:** Premium 2 BHK & 3 BHK High-Rise Residential Apartments
• **Location:** Financial District / IT Hub Corridor, Hyderabad
• **Unit Sizes:** 1,250 sq.ft (2 BHK) to 1,950 sq.ft (3 BHK)
• **Price:** Starting from ₹85 Lakhs (₹6,800 / sq.ft)
• **Features:** Sky deck, panoramic views, EV charging stations, modern clubhouse, infinity pool, and 100% power backup.
• **Status:** Tower A & Tower B available for booking.

Would you like more details on floor plans, or would you like to schedule a site visit?`;
  }
  return GREETING_RESPONSE;
}

export function isUpdateIntent(text) {
  const s = String(text || '').toLowerCase();
  return /\b(?:change|update|correct|modify|edit)\s+(?:my\s+)?(?:email|mail|name|phone|mobile|number|plot|visit|booking|date|time)\b/i.test(s) ||
         /\b(?:my\s+(?:email|mail)\s+is\s+actually|my\s+name\s+is\s+actually|please\s+(?:update|change))\b/i.test(s);
}

export function isSiteVisitIntent(text, conversationOrPreviousMsg = '') {
  if (!text) return false;
  const s = String(text || '').trim().toLowerCase();

  // If the message is a greeting or general project request, it is NEVER a site visit intent
  if (isGreeting(s) || isProjectInfoRequest(s)) {
    return false;
  }

  // 1. Explicit site visit phrases in current message
  if (/\b(?:want\s+to|like\s+to|planning\s+to|can\s+you|please|can\s+i)\s+(?:book|schedule|arrange|fix|plan)\s+(?:a\s+)?(?:free\s+)?site\s*visit\b/i.test(s) ||
      /\b(?:book|schedule|arrange|plan)\s+(?:a\s+)?(?:free\s+)?site\s*visit\b/i.test(s) ||
      /\bsite\s*visit\b/i.test(s) && !/\b(?:what\s+is|cancel|about)\s+site\s*visit\b/i.test(s) ||
      /\b(?:want\s+to|like\s+to|can\s+i|planning\s+to)\s+visit\s+(?:the\s+)?(?:plot|property|villa|apartment|site)\b/i.test(s) ||
      /\b(?:see|view)\s+(?:the\s+)?(?:plot|site|villa|apartment)\b/i.test(s)) {
    return true;
  }

  // 2. Follow-up response in an ACTIVE site visit booking flow:
  // ONLY if the immediately previous assistant message was actively asking for missing site visit details
  let lastAssistantMsg = '';
  if (Array.isArray(conversationOrPreviousMsg)) {
    const lastAssistant = [...conversationOrPreviousMsg].reverse().find(m => m.role === 'assistant' || m.role === 'model');
    lastAssistantMsg = lastAssistant?.content || '';
  } else {
    lastAssistantMsg = String(conversationOrPreviousMsg || '');
  }

  // If the last assistant message already confirmed the booking, the booking flow is complete!
  if (/Site Visit Successfully Booked/i.test(lastAssistantMsg)) {
    return false;
  }

  // If the assistant was asking for booking appointment details:
  if (/delighted to arrange a site visit|confirm your appointment|provide your \*\*full name\*\*|provide your \*\*email/i.test(lastAssistantMsg)) {
    // Check if user is answering with contact details, plot, or schedule
    if (extractEmail(text) || extractPhone(text) || extractPlotCode(text) || extractName(text, lastAssistantMsg) ||
        /\b(?:tomorrow|today|morning|afternoon|evening|\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i.test(s) ||
        /(?:my\s+name|my\s+email|my\s+phone)/i.test(s)) {
      return true;
    }
  }

  return false;
}

export function isEnquiryIntent(text, conversationOrPreviousMsg = '') {
  if (!text) return false;
  const s = String(text || '').trim().toLowerCase();

  // If message is a greeting, it is NEVER an enquiry intent
  if (isGreeting(s) || isProjectInfoRequest(s)) {
    return false;
  }

  // 1. Explicit enquiry phrases in current message
  if (/\b(?:enquiry|inquiry|enquire|inquire|brochure|price\s*list|payment\s*plan|cost\s*sheet|send\s+details)\b/i.test(s) ||
      /\b(?:i\s+want\s+to|like\s+to)\s+(?:enquire|inquire|send\s+enquiry)\b/i.test(s)) {
    return true;
  }

  // 2. Follow-up response in an ACTIVE enquiry flow
  let lastAssistantMsg = '';
  if (Array.isArray(conversationOrPreviousMsg)) {
    const lastAssistant = [...conversationOrPreviousMsg].reverse().find(m => m.role === 'assistant' || m.role === 'model');
    lastAssistantMsg = lastAssistant?.content || '';
  } else {
    lastAssistantMsg = String(conversationOrPreviousMsg || '');
  }

  if (/Enquiry Successfully Recorded/i.test(lastAssistantMsg)) {
    return false;
  }

  if (/submit your enquiry|record your enquiry|provide your \*\*full name\*\*/i.test(lastAssistantMsg)) {
    if (extractEmail(text) || extractPhone(text) || extractName(text, lastAssistantMsg)) {
      return true;
    }
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
  const nameMatch = s.match(/(?:change|update|correct|set)?\s*(?:my\s+)?name\s+(?:to|is)\s+([A-Za-z.][A-Za-z\s.]{1,30})/i) ||
                    s.match(/(?:my\s+name\s+is\s+actually)\s+([A-Za-z.][A-Za-z\s.]{1,30})/i);
  if (nameMatch && nameMatch[1]) {
    newName = nameMatch[1].replace(/\b(?:and|please|email|phone|mobile|date|time)\b.*$/i, '').trim();
  }

  // Identify target lead: by channel phone, previous conversation phone, or previous conversation email
  const context = aggregateConversationContext(conversation, '');
  const isPhoneChange = /\b(?:change|update|correct|set)?\s*(?:my\s+)?(?:phone|mobile|number)\s+(?:to|is)\b/i.test(s);
  const lookupPhone = phone || context.phone || (isPhoneChange ? '' : newPhone);
  const lookupEmail = context.email || email;

  let lead = null;
  if (lookupPhone) {
    const norm = normalizePhone(lookupPhone);
    const rows = await supabaseAdminGet('leads', {
      select: 'id,name,phone,email,notes',
      phone: `eq.${norm}`,
      order: 'created_at.desc',
      limit: '1'
    }).catch(() => []);
    if (rows[0]) lead = rows[0];
    if (!lead && norm.length === 12 && norm.startsWith('91')) {
      const rows10 = await supabaseAdminGet('leads', {
        select: 'id,name,phone,email,notes',
        phone: `eq.${norm.slice(2)}`,
        order: 'created_at.desc',
        limit: '1'
      }).catch(() => []);
      if (rows10[0]) lead = rows10[0];
    }
  }

  if (!lead && lookupEmail) {
    const rows = await supabaseAdminGet('leads', {
      select: 'id,name,phone,email,notes',
      email: `eq.${lookupEmail}`,
      order: 'created_at.desc',
      limit: '1'
    }).catch(() => []);
    if (rows[0]) lead = rows[0];
  }

  if (!lead && newPhone) {
    const norm = normalizePhone(newPhone);
    const rows = await supabaseAdminGet('leads', {
      select: 'id,name,phone,email,notes',
      phone: `eq.${norm}`,
      order: 'created_at.desc',
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

  const lastAssistant = [...conversation].reverse().find(m => m.role === 'assistant' || m.role === 'model');
  const lastAssistantMsg = lastAssistant?.content || '';

  // 1. Check for Detail Update (name, email, phone, plot, schedule)
  if (isUpdateIntent(text)) {
    console.log(`[crmAgentEngine] detected update intent on ${channel}`);
    return handleDetailUpdate({ phone, text, conversation });
  }

  // 2. Check for Site Visit Booking intent
  if (isSiteVisitIntent(text, conversation)) {
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
  if (isEnquiryIntent(text, conversation)) {
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

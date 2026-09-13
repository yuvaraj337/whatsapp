import { supabaseAdminGet, supabaseAdminPost, supabaseAdminPatch } from '../lib/supabaseAdmin.js';
import {
  normalizePhone,
  sendBookingNotificationToOwner
} from '../services/whatsappService.js';

// In-memory cache to prevent accidental double-clicks within 30 seconds
const recentSubmissionsCache = new Map();

function cleanStr(val) {
  return typeof val === 'string' ? val.trim() : '';
}

/**
 * Attempts to parse date into ISO string or null.
 */
export function parseSchedule(dateStr, timeStr) {
  if (!dateStr) return null;
  // If date contains non-date strings like "Immediate Enquiry", return null
  if (/enquiry|inquiry|preferred|immediate/i.test(dateStr)) return null;
  try {
    const timePart = timeStr && !/anytime|preferred|slot/i.test(timeStr)
      ? timeStr.split('-')[0].trim()
      : '10:00 AM';
    const combined = `${dateStr} ${timePart}`;
    const d = new Date(combined);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
    const dOnly = new Date(dateStr);
    return Number.isNaN(dOnly.getTime()) ? null : dOnly.toISOString();
  } catch {
    return null;
  }
}

/**
 * Resolves a valid property ID from the database using given clues.
 * Fallbacks to the first available property to satisfy DB foreign keys.
 */
export async function resolvePropertyId(hints = {}) {
  const { propertyId, propertyCode, propertyTitle, projectName } = hints;

  if (propertyId) {
    const byId = await supabaseAdminGet('properties', {
      select: 'id',
      id: `eq.${propertyId}`,
      limit: '1'
    }).catch(() => []);
    if (byId[0]?.id) return byId[0].id;
  }

  if (propertyCode) {
    const byCode = await supabaseAdminGet('properties', {
      select: 'id',
      property_code: `eq.${propertyCode.toUpperCase()}`,
      limit: '1'
    }).catch(() => []);
    if (byCode[0]?.id) return byCode[0].id;
  }

  if (propertyTitle) {
    const byTitle = await supabaseAdminGet('properties', {
      select: 'id',
      title: `ilike.%${propertyTitle}%`,
      limit: '1'
    }).catch(() => []);
    if (byTitle[0]?.id) return byTitle[0].id;
  }

  // Look for any property belonging to the project
  if (projectName) {
    const cleanProject = projectName.replace(/\(.*\)/, '').trim();
    const projects = await supabaseAdminGet('projects', {
      select: 'id',
      name: `ilike.%${cleanProject}%`,
      limit: '1'
    }).catch(() => []);

    if (projects[0]?.id) {
      const byProject = await supabaseAdminGet('properties', {
        select: 'id',
        project_id: `eq.${projects[0].id}`,
        limit: '1'
      }).catch(() => []);
      if (byProject[0]?.id) return byProject[0].id;
    }
  }

  // Safe fallback to first property in database
  const first = await supabaseAdminGet('properties', { select: 'id', limit: '1' }).catch(() => []);
  return first[0]?.id || null;
}

/**
 * Finds or creates a customer lead in the database.
 * Normalizes Indian phone numbers and preserves customer details.
 */
export async function findOrCreateLead(name, rawPhone, email, notes, source = 'Website', status = 'new') {
  const normalizedPhone = normalizePhone(rawPhone);
  if (!normalizedPhone) throw new Error('Valid phone number is required.');

  const existing = await supabaseAdminGet('leads', {
    select: 'id,name,phone,email,source,status,notes',
    phone: `eq.${normalizedPhone}`,
    limit: '1'
  }).catch(() => []);

  if (existing[0]) {
    const lead = existing[0];
    const update = { updated_at: new Date().toISOString() };
    if (!lead.name && name) update.name = name;
    if (!lead.email && email) update.email = email;
    if (notes) {
      update.notes = lead.notes ? `${lead.notes}\n---\n${notes}` : notes;
    }
    // Only upgrade status if not already advanced
    if ((!lead.status || lead.status === 'new') && status !== 'new') {
      update.status = status;
    }
    await supabaseAdminPatch('leads', { id: `eq.${lead.id}` }, update).catch(() => null);
    return { ...lead, ...update };
  }

  const created = await supabaseAdminPost('leads', {
    name: name || null,
    phone: normalizedPhone,
    email: email || null,
    source: source || 'Website',
    status: status || 'new',
    notes: notes || 'Created from website enquiry form.'
  }).catch((err) => {
    console.error('[lead] Failed to insert lead:', err.message || err);
    throw err;
  });

  return created[0] || null;
}

/**
 * Common Site Visit Creation Service.
 * Used by BOTH website site-visit submissions AND WhatsApp AI assistant.
 * Idempotent, deduplicated, and strictly keeps plot inventory AVAILABLE.
 */
export async function createSiteVisitRecord(params = {}) {
  const name = cleanStr(params.name || params.customer_name);
  const rawPhone = cleanStr(params.phone || params.customer_phone);
  const email = cleanStr(params.email || params.customer_email || '');
  const projectName = cleanStr(params.projectName || params.project_name || 'VR Green Meadows');
  const propertyCode = cleanStr(params.propertyCode || params.property_code || '');
  const propertyId = params.propertyId || params.property_id || null;
  const date = cleanStr(params.date || params.scheduled_at || '');
  const time = cleanStr(params.time || 'Anytime');
  const notes = cleanStr(params.notes || '');
  const source = cleanStr(params.source || 'Website');
  const whatsapp_message_id = cleanStr(params.whatsapp_message_id || '');

  if (whatsapp_message_id && recentSubmissionsCache.has(whatsapp_message_id)) {
    return {
      success: true,
      duplicate: true,
      duplicatePrevented: true,
      site_visit_id: recentSubmissionsCache.get(whatsapp_message_id),
      message: 'Duplicate site visit request filtered.'
    };
  }

  const normalizedPhone = normalizePhone(rawPhone);
  if (!normalizedPhone || normalizedPhone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  const scheduledIso = parseSchedule(date, time);
  const resolvedPropId = await resolvePropertyId({
    propertyId,
    propertyCode,
    projectName,
    propertyTitle: propertyCode ? `Plot ${propertyCode}` : projectName
  });

  // 1. Find or create Lead
  const visitNotes = `[${source} Site Visit] Project: ${projectName}${propertyCode ? `, Unit: ${propertyCode}` : ''} | Requested Date: ${date} (${time})${notes ? ` | Notes: ${notes}` : ''}`;
  const lead = await findOrCreateLead(
    name,
    normalizedPhone,
    email,
    visitNotes,
    source,
    'site_visit'
  );

  if (!lead?.id) {
    throw new Error('Failed to resolve or create customer lead for site visit.');
  }

  // 2. Prevent duplicate site visit within same day for same phone & property
  if (resolvedPropId) {
    const existingVisits = await supabaseAdminGet('site_visits', {
      select: 'id,status,scheduled_at,requested_at',
      lead_id: `eq.${lead.id}`,
      property_id: `eq.${resolvedPropId}`,
      status: `in.(REQUESTED,CONFIRMED)`,
      order: 'requested_at.desc',
      limit: '1'
    }).catch(() => []);

    if (existingVisits[0]) {
      console.log(`[site-visit] Existing pending/confirmed visit found for lead ${lead.id} on property ${resolvedPropId}, returning existing record.`);
      if (whatsapp_message_id) {
        recentSubmissionsCache.set(whatsapp_message_id, existingVisits[0].id);
      }
      return {
        visit: existingVisits[0],
        lead,
        site_visit_id: existingVisits[0].id,
        success: true,
        duplicatePrevented: true,
        duplicate: true
      };
    }
  }

  // 3. Save site visit request (Status is REQUESTED / PENDING, inventory remains AVAILABLE)
  const visitRows = await supabaseAdminPost('site_visits', {
    lead_id: lead.id,
    property_id: resolvedPropId,
    requested_at: new Date().toISOString(),
    scheduled_at: scheduledIso,
    status: 'REQUESTED',
    notes: `${source} Site Visit: ${projectName}${propertyCode ? ` (${propertyCode})` : ''} - Date: ${date}, Time: ${time}${whatsapp_message_id ? ` | Message ID: ${whatsapp_message_id}` : ''}${notes ? ` | Notes: ${notes}` : ''}`
  });

  const siteVisit = visitRows[0] || null;

  if (whatsapp_message_id && siteVisit?.id) {
    recentSubmissionsCache.set(whatsapp_message_id, siteVisit.id);
  }

  // 4. Record in lead_properties
  if (resolvedPropId) {
    await supabaseAdminPost('lead_properties', {
      lead_id: lead.id,
      property_id: resolvedPropId,
      interest_type: 'site_visit',
      notes: `Site visit scheduled for ${date} (${time})`
    }).catch(() => null);
  }

  // 5. Ensure WhatsApp conversation exists for lead
  try {
    const convs = await supabaseAdminGet('whatsapp_conversations', {
      select: 'id',
      phone: `eq.${normalizedPhone}`,
      limit: '1'
    });
    if (!convs[0]?.id) {
      await supabaseAdminPost('whatsapp_conversations', {
        phone: normalizedPhone,
        lead_id: lead.id,
        status: 'open',
        ai_enabled: true
      });
    }
  } catch (convErr) {
    console.warn('[whatsapp] conversation init warning:', convErr.message || convErr);
  }

  return {
    visit: siteVisit,
    lead,
    site_visit_id: siteVisit?.id,
    success: true,
    duplicatePrevented: false,
    duplicate: false
  };
}

/**
 * Handles POST /api/bookings
 * Serves both Enquiries and Site Visits from website forms.
 */
export async function handleBookings(req, pathParts, body = {}) {
  if (req.method !== 'POST') {
    return {
      status: 405,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST is supported for bookings.' }
    };
  }

  console.log('[booking] received request body:', JSON.stringify(body));

  const name = cleanStr(body.name || body.fullName || body.customerName);
  const rawPhone = cleanStr(body.phone || body.mobile || body.customerPhone || body.mobileNumber);
  const email = cleanStr(body.email || body.customerEmail);
  const date = cleanStr(body.date || body.preferredDate || body.visitDate || body.timeline);
  const time = cleanStr(body.time || body.preferredTime || body.visitTime || body.timeSlot || 'Anytime');
  const propertyCode = cleanStr(body.propertyCode || body.unitName || body.plotNumber || body.property || '');
  const projectName = cleanStr(
    body.projectName ||
    body.propertyTitle ||
    body.project ||
    'VR Real Estates Property'
  );
  const propertyType = cleanStr(body.propertyType || body.category || '');
  const message = cleanStr(body.message || body.notes || body.requirement || body.pickup || '');

  // 1. Validation
  if (!name || name.length < 2) {
    return {
      status: 400,
      error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid full name.' }
    };
  }

  const normalizedPhone = normalizePhone(rawPhone);
  if (!normalizedPhone || normalizedPhone.length < 10) {
    return {
      status: 400,
      error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid 10-digit mobile number.' }
    };
  }

  // 2. Identify whether this is an ENQUIRY or a SITE VISIT
  const isEnquiry =
    body.type === 'enquiry' ||
    body.isEnquiry === true ||
    date === 'Immediate Enquiry' ||
    date === 'Contact Page Inquiry' ||
    !date ||
    /enquiry|inquiry|preferred\s*slot/i.test(date) ||
    /preferred\s*slot/i.test(time);

  // 3. Deduplication Check (30-second window for same phone and project)
  const dedupeKey = `${normalizedPhone}_${projectName}_${isEnquiry ? 'enquiry' : date}`;
  const now = Date.now();
  if (recentSubmissionsCache.has(dedupeKey)) {
    const cached = recentSubmissionsCache.get(dedupeKey);
    if (now - cached.timestamp < 30000) {
      console.log(`[submission] duplicate request detected within 30s for ${dedupeKey}, returning existing record.`);
      return {
        status: 200,
        data: {
          ...cached.response,
          duplicatePrevented: true
        }
      };
    }
  }

  // 4. Handle Flow: ENQUIRY vs SITE VISIT
  if (isEnquiry) {
    console.log(`[enquiry] Processing customer enquiry for "${name}" (${normalizedPhone}) - Project: ${projectName}`);
    
    const formattedNotes = `[Website Enquiry] Project: ${projectName}${propertyCode ? ` | Property/Plot: ${propertyCode}` : ''}${propertyType ? ` | Type: ${propertyType}` : ''}\nMessage: ${message || 'Customer requested project details and pricing.'}`;
    
    let lead = null;
    try {
      lead = await findOrCreateLead(
        name,
        normalizedPhone,
        email,
        formattedNotes,
        'Website',
        'new'
      );

      // Resolve property to link interest
      const propertyId = await resolvePropertyId({
        propertyId: body.propertyId,
        propertyCode,
        projectName,
        propertyTitle: projectName
      });

      if (propertyId && lead?.id) {
        await supabaseAdminPost('lead_properties', {
          lead_id: lead.id,
          property_id: propertyId,
          interest_type: 'enquiry',
          notes: message || `Enquiry for ${projectName} ${propertyCode}`
        }).catch((e) => console.warn('[enquiry] lead_properties warning:', e?.message || e));
      }
    } catch (dbErr) {
      console.error('[enquiry] Database insert failed:', dbErr?.message || dbErr);
      return {
        status: 500,
        error: { code: 'DATABASE_ERROR', message: 'Failed to record enquiry. Please try again.' }
      };
    }

    // Owner WhatsApp Notification
    let ownerNotificationSent = false;
    try {
      const ownerResult = await sendBookingNotificationToOwner({
        customerName: name,
        customerPhone: normalizedPhone,
        customerEmail: email,
        projectName: `${projectName} (Enquiry)`,
        date: 'Immediate Enquiry',
        time: 'Flexible',
        notes: message
      });
      ownerNotificationSent = Boolean(ownerResult?.success);
    } catch (err) {
      console.warn('[whatsapp] owner notification warning:', err?.message || err);
    }

    const responseData = {
      success: true,
      type: 'enquiry',
      leadId: lead?.id || null,
      customerName: name,
      projectName,
      customerNotification: {
        sent: false,
        method: 'whatsapp'
      },
      ownerNotification: {
        sent: ownerNotificationSent
      },
      message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.'
    };

    recentSubmissionsCache.set(dedupeKey, { timestamp: now, response: responseData });
    return { status: 201, data: responseData };
  }

  // SITE VISIT FLOW
  console.log(`[site-visit] Processing site visit request for "${name}" (${normalizedPhone}) on ${date} (${time})`);

  let visitResult = null;
  try {
    visitResult = await createSiteVisitRecord({
      name,
      phone: normalizedPhone,
      email,
      projectName,
      propertyCode,
      propertyId: body.propertyId,
      date,
      time,
      notes: message,
      source: body.source || 'Website'
    });
  } catch (err) {
    console.error('[site-visit] Failed to create site visit record:', err?.message || err);
    return {
      status: 500,
      error: { code: 'DATABASE_ERROR', message: err?.message || 'Failed to save site visit request.' }
    };
  }

  // Notify Owner
  let ownerNotificationSent = false;
  try {
    const ownerResult = await sendBookingNotificationToOwner({
      customerName: name,
      customerPhone: normalizedPhone,
      customerEmail: email,
      projectName,
      date,
      time,
      notes: message
    });
    ownerNotificationSent = Boolean(ownerResult?.success);
  } catch (err) {
    console.warn('[whatsapp] owner notification warning:', err?.message || err);
  }

  const responseData = {
    success: true,
    type: 'site_visit',
    siteVisitId: visitResult?.visit?.id || null,
    leadId: visitResult?.lead?.id || null,
    customerNotification: {
      sent: false,
      pendingOwnerConfirmation: true
    },
    ownerNotification: {
      sent: ownerNotificationSent
    },
    message: 'Your site visit request has been received. Our team will review and send a WhatsApp confirmation once approved.'
  };

  recentSubmissionsCache.set(dedupeKey, { timestamp: now, response: responseData });
  return { status: 201, data: responseData };
}

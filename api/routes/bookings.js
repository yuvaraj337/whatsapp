import { supabaseAdminGet, supabaseAdminPost, supabaseAdminPatch } from '../lib/supabaseAdmin.js';
import {
  normalizePhone,
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToOwner
} from '../services/whatsappService.js';

// In-memory cache to prevent accidental double-clicks within 30 seconds
const recentBookingsCache = new Map();

function cleanStr(val) {
  return typeof val === 'string' ? val.trim() : '';
}

/**
 * Attempts to parse date into ISO string or null.
 */
function parseSchedule(dateStr, timeStr) {
  if (!dateStr) return null;
  try {
    const combined = timeStr ? `${dateStr} ${timeStr.split('-')[0].trim()}` : dateStr;
    const d = new Date(combined);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

/**
 * Resolves a valid property ID from the database using given clues.
 * Fallbacks to the first available property to satisfy DB foreign keys.
 */
async function resolvePropertyId(hints = {}) {
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
      property_code: `eq.${propertyCode}`,
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
    const projects = await supabaseAdminGet('projects', {
      select: 'id',
      name: `ilike.%${projectName}%`,
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
 */
async function findOrCreateLead(name, normalizedPhone, email, notes) {
  const existing = await supabaseAdminGet('leads', {
    select: 'id,name,phone,email,source,status',
    phone: `eq.${normalizedPhone}`,
    limit: '1'
  }).catch(() => []);

  if (existing[0]) {
    const update = { status: 'site_visit', updated_at: new Date().toISOString() };
    if (!existing[0].name && name) update.name = name;
    if (!existing[0].email && email) update.email = email;
    await supabaseAdminPatch('leads', { id: `eq.${existing[0].id}` }, update).catch(() => null);
    return existing[0];
  }

  const created = await supabaseAdminPost('leads', {
    name: name || null,
    phone: normalizedPhone,
    email: email || null,
    source: 'website_booking',
    status: 'site_visit',
    notes: notes || 'Created from website booking form.'
  }).catch((err) => {
    console.error('[booking] Failed to insert lead:', err.message || err);
    throw err;
  });

  return created[0] || null;
}

/**
 * Handles POST /api/bookings
 */
export async function handleBookings(req, pathParts, body = {}) {
  if (req.method !== 'POST') {
    return {
      status: 405,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST is supported for bookings.' }
    };
  }

  console.log('[booking] received booking request');

  const name = cleanStr(body.name || body.fullName || body.customerName);
  const rawPhone = cleanStr(body.phone || body.mobile || body.customerPhone || body.mobileNumber);
  const email = cleanStr(body.email || body.customerEmail);
  const date = cleanStr(body.date || body.preferredDate || body.visitDate || body.timeSlot);
  const time = cleanStr(body.time || body.preferredTime || body.visitTime || body.timeSlot || 'Anytime');
  const projectName = cleanStr(
    body.projectName ||
    body.propertyTitle ||
    body.unitName ||
    body.project ||
    body.property ||
    'VR Real Estate Property'
  );
  const notes = cleanStr(body.message || body.notes || body.pickup || '');

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
      error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid phone number with at least 10 digits.' }
    };
  }

  if (!date) {
    return {
      status: 400,
      error: { code: 'VALIDATION_ERROR', message: 'Please select a preferred booking date.' }
    };
  }

  console.log(`[booking] validation passed for customer: "${name}", phone: "${normalizedPhone}"`);

  // 2. Duplicate Prevention (30-second window for same phone and project)
  const dedupeKey = `${normalizedPhone}_${projectName}_${date}`;
  const now = Date.now();
  if (recentBookingsCache.has(dedupeKey)) {
    const cached = recentBookingsCache.get(dedupeKey);
    if (now - cached.timestamp < 30000) {
      console.log(`[booking] duplicate request detected within 30s for ${dedupeKey}, returning existing record.`);
      return {
        status: 200,
        data: {
          ...cached.response,
          duplicatePrevented: true
        }
      };
    }
  }

  // 3. Resolve property ID for relational foreign key
  const propertyId = await resolvePropertyId({
    propertyId: body.propertyId,
    propertyCode: body.propertyCode,
    propertyTitle: projectName,
    projectName
  });

  if (!propertyId) {
    console.error('[booking] No properties found in database to link booking to.');
    return {
      status: 500,
      error: { code: 'DATABASE_ERROR', message: 'Unable to link booking to property inventory.' }
    };
  }

  // 4. Save to Database
  let lead = null;
  let siteVisit = null;
  let booking = null;
  const bookingRef = `VR-BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  try {
    lead = await findOrCreateLead(
      name,
      normalizedPhone,
      email,
      `Site visit requested for ${projectName} on ${date} (${time})`
    );

    if (!lead?.id) {
      throw new Error('Failed to resolve or create customer lead.');
    }

    const scheduledIso = parseSchedule(date, time);

    // Save site visit request
    const visitRows = await supabaseAdminPost('site_visits', {
      lead_id: lead.id,
      property_id: propertyId,
      requested_at: new Date().toISOString(),
      scheduled_at: scheduledIso,
      status: 'REQUESTED',
      notes: `Website booking: ${projectName} - Date: ${date}, Time: ${time}${notes ? ` | Notes: ${notes}` : ''}`
    });
    siteVisit = visitRows[0] || null;

    // Save booking record
    const bookingRows = await supabaseAdminPost('bookings', {
      lead_id: lead.id,
      property_id: propertyId,
      status: 'PENDING',
      booking_reference: bookingRef,
      notes: `Booking for ${projectName} on ${date} (${time})`
    });
    booking = bookingRows[0] || null;

    console.log(`[booking] saved successfully: id=${booking?.id || siteVisit?.id}, reference=${bookingRef}`);
  } catch (dbError) {
    console.error('[booking] Database insert failed:', dbError?.message || dbError);
    return {
      status: 500,
      error: { code: 'DATABASE_ERROR', message: 'Failed to save booking in database. Please try again.' }
    };
  }

  // 5. Initialize or verify WhatsApp conversation record for customer lead (ready for CRM)
  let customerNotificationSent = false;
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

  // 6. Owner WhatsApp Notification
  let ownerNotificationSent = false;
  try {
    const ownerPhone = process.env.WHATSAPP_OWNER_PHONE;
    if (ownerPhone) {
      console.log(`[whatsapp] sending owner notification to ${ownerPhone}...`);
      const ownerResult = await sendBookingNotificationToOwner({
        customerName: name,
        customerPhone: normalizedPhone,
        customerEmail: email,
        projectName,
        date,
        time,
        notes
      });

      if (ownerResult.success) {
        ownerNotificationSent = true;
        console.log(`[whatsapp] owner notification sent (msg id: ${ownerResult.messageId || 'ok'})`);
      } else {
        console.warn(`[whatsapp] owner notification failed: ${ownerResult.error}`);
      }
    } else {
      console.log('[whatsapp] WHATSAPP_OWNER_PHONE not configured, skipped owner notification.');
    }
  } catch (err) {
    console.error(`[whatsapp] owner notification error: ${err.message || err}`);
  }

  // 7. Prepare response and store in deduplication cache
  const responseData = {
    bookingId: booking?.id || siteVisit?.id || null,
    reference: bookingRef,
    customerNotification: {
      sent: false,
      pendingOwnerConfirmation: true
    },
    ownerNotification: {
      sent: ownerNotificationSent
    },
    message: 'Your site visit request has been received. Our team will review and send a WhatsApp confirmation once approved.'
  };

  recentBookingsCache.set(dedupeKey, {
    timestamp: now,
    response: responseData
  });

  // Clean old cache entries
  if (recentBookingsCache.size > 500) {
    for (const [k, v] of recentBookingsCache.entries()) {
      if (now - v.timestamp > 60000) recentBookingsCache.delete(k);
    }
  }

  return {
    status: 201,
    data: responseData
  };
}

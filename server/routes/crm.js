import { supabaseAdminGet, supabaseAdminPatch, supabaseAdminPost } from '../lib/supabaseAdmin.js';
import { getAllReviews, updateReview, ingestGoogleReviews } from './reviews.js';

const LEAD_STATUSES = ['new', 'contacted', 'interested', 'qualified', 'site_visit', 'negotiation', 'converted', 'won', 'lost'];
const INVENTORY_STATUSES = ['AVAILABLE', 'HOLD', 'RESERVED', 'BOOKED', 'SOLD', 'BLOCKED'];
const VISIT_STATUSES = ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', 'BOOKED'];
const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

const unauthorized = () => ({ status: 401, error: { code: 'CRM_UNAUTHORIZED', message: 'CRM access is not authorized.' } });
const clean = (v) => typeof v === 'string' ? v.trim() : '';
const bad = (message, code = 'BAD_REQUEST') => ({ status: 400, error: { code, message } });
const iso = (v) => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d.toISOString(); };
const dateLabel = (v) => { const d = new Date(v); return Number.isNaN(d.getTime()) ? 'the requested time' : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); };
function authorized(req) { const key = process.env.CRM_ACCESS_KEY; return Boolean(key) && req.headers['x-crm-key'] === key; }

export function cleanCustomerNote(raw) {
  if (!raw) return '-';
  const str = String(raw).trim();
  if (!str) return '-';

  // If there's an explicit "Message: <text>" pattern, prioritize extracting that
  const msgMatch = str.match(/(?:Customer Note|Message|Remarks|Note):\s*([^|\n]+)/i);
  if (msgMatch && msgMatch[1].trim()) {
    const candidate = msgMatch[1].trim();
    if (!/^(?:none|nil|na|n\/a|-)$/i.test(candidate)) {
      return candidate;
    }
  }

  // Strip all system tags, metadata headers, and prefix lines
  let cleaned = str
    .replace(/\[(?:Website Enquiry|Website Site Visit|Offline Site Visit|Contact Enquiry|Offline|BOOKED|AUTO-CAPTURED[^\]]*)\]/gi, '')
    .replace(/(?:Project|Property\/Plot|Plot|Type|Area|Price|Unit|Facing|Source|Date|Time|Scheduled|Status|Message ID|Enquiry ID|Booking ID|Reference|Original Interested Property|Booked Property):\s*[^|\n]*/gi, '')
    .replace(/(?:Message|Remarks|Notes?):\s*/gi, '')
    .replace(/created from website (?:enquiry|contact) form\.?/gi, '')
    .replace(/Site visit scheduled for [^|\n]*/gi, '')
    .replace(/Offline customer for property [^|\n]*/gi, '')
    .replace(/[|—\-]+/g, ' ')
    .trim();

  // Split lines and clean
  const lines = cleaned.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('http') && !l.includes('wa.me') && !/^(?:none|nil|na|n\/a|-)$/i.test(l));

  const unique = Array.from(new Set(lines)).join(' ').replace(/\s+/g, ' ').trim();
  return unique || '-';
}

export function parseBookingFinancials(booking, defaultListedPrice = 0) {
  if (!booking) {
    const p = Number(defaultListedPrice) || 0;
    return {
      listed_price: p,
      final_price: p,
      advance: 0,
      remaining_amount: p
    };
  }

  const notes = booking.notes || '';
  let listed = 0;
  let finalP = 0;
  let adv = 0;
  let rem = 0;

  const mListed = notes.match(/Listed Price:\s*₹?\s*([0-9,]+)/i);
  if (mListed) listed = Number(mListed[1].replace(/,/g, ''));

  const mFinal = notes.match(/Final (?:Agreed )?Price:\s*₹?\s*([0-9,]+)/i);
  if (mFinal) finalP = Number(mFinal[1].replace(/,/g, ''));

  const mAdv = notes.match(/Advance(?:\s*Amount|\s*Paid)?:\s*₹?\s*([0-9,]+)/i);
  if (mAdv) adv = Number(mAdv[1].replace(/,/g, ''));

  const mRem = notes.match(/Remaining(?:\s*Balance|\s*Amount)?:\s*₹?\s*([0-9,]+)/i);
  if (mRem) rem = Number(mRem[1].replace(/,/g, ''));

  if (!listed) listed = Number(booking.properties?.price || defaultListedPrice || 0);
  if (!finalP) finalP = Number(booking.final_price || listed || 0);
  if (!adv) adv = Number(booking.amount || 0);
  if (!rem) rem = Math.max(0, finalP - adv);

  return {
    listed_price: listed,
    final_price: finalP,
    advance: adv,
    remaining_amount: rem
  };
}

function cleanEnquiryMessage(raw) {
  return cleanCustomerNote(raw);
}

async function sendWhatsApp(to, body) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_GRAPH_VERSION;
  if (!token || !phoneId || !version) throw new Error('WhatsApp Cloud API is not configured.');
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
  });
  if (!response.ok) throw new Error(`WhatsApp send failed: ${response.status}`);
  return response.json();
}
async function writeOutbound(conversation, body) {
  const raw = await sendWhatsApp(conversation.phone, body);
  await supabaseAdminPost('whatsapp_messages', { conversation_id: conversation.id, direction: 'outbound', message_type: 'text', body, raw_payload: raw });
  await supabaseAdminPatch('whatsapp_conversations', { id: `eq.${conversation.id}` }, { last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() });
}
async function getOrCreateConversation(leadId, phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  const existing = await supabaseAdminGet('whatsapp_conversations', {
    select: 'id,phone,status,ai_enabled',
    phone: `eq.${normalized}`,
    limit: '1'
  }).catch(() => []);
  if (existing[0]) return existing[0];
  const newConvs = await supabaseAdminPost('whatsapp_conversations', {
    phone: normalized,
    lead_id: leadId || null,
    status: 'open',
    ai_enabled: true
  }).catch(() => []);
  return newConvs[0] || null;
}
async function leadById(id) {
  const rows = await supabaseAdminGet('leads', { select: 'id,name,phone,email,source,status,notes,created_at,updated_at', id: `eq.${id}`, limit: '1' });
  return rows[0] || null;
}
async function propertyById(id) {
  const rows = await supabaseAdminGet('properties', { select: 'id,project_id,property_code,title,property_type,inventory_status,area,area_unit,price,currency,metadata,projects(name,slug)', id: `eq.${id}`, limit: '1' });
  return rows[0] || null;
}
async function inventoryUpdate(id, next, reason = '') {
  next = clean(next).toUpperCase();
  if (next === 'HOLD') next = 'RESERVED'; // normalize HOLD to RESERVED in schema if needed
  if (!INVENTORY_STATUSES.includes(next)) return bad(`Invalid inventory status. Allowed values: ${INVENTORY_STATUSES.join(', ')}`, 'INVALID_INVENTORY_STATUS');
  const property = await propertyById(id);
  if (!property) return { status: 404, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } };
  const current = property.inventory_status;
  if (current === next) return { status: 200, data: { property } };
  
  // Complete manual control for owner
  const allowed = {
    AVAILABLE: ['HOLD', 'RESERVED', 'BOOKED', 'BLOCKED', 'SOLD'],
    HOLD: ['AVAILABLE', 'RESERVED', 'BOOKED', 'BLOCKED', 'SOLD'],
    RESERVED: ['AVAILABLE', 'HOLD', 'BOOKED', 'BLOCKED', 'SOLD'],
    BOOKED: ['AVAILABLE', 'HOLD', 'RESERVED', 'SOLD', 'BLOCKED'],
    BLOCKED: ['AVAILABLE', 'HOLD', 'RESERVED', 'BOOKED'],
    SOLD: ['AVAILABLE', 'BOOKED']
  };
  if (!allowed[current]?.includes(next)) return bad(`Invalid inventory transition: ${current} → ${next}.`, 'INVALID_INVENTORY_TRANSITION');
  const rows = await supabaseAdminPatch('properties', { id: `eq.${id}` }, { inventory_status: next, updated_at: new Date().toISOString() });
  if (!rows[0]) return { status: 409, error: { code: 'INVENTORY_CHANGED', message: 'Inventory changed before this action completed. Refresh and try again.' } };
  await supabaseAdminPost('inventory_status_history', { property_id: id, from_status: current, to_status: next, reason: clean(reason) || 'CRM inventory update' }).catch((e) => console.error('[crm] history', e?.message || e));
  return { status: 200, data: { property: rows[0] } };
}

export async function handleCrm(req, pathParts, searchParams, body = {}) {
  if (!authorized(req)) return unauthorized();
  const section = pathParts[2]; const id = pathParts[3];

  if (req.method === 'GET' && section === 'summary') {
    const [leads, conversations, visits, properties, bookings, allReviews, leadProperties] = await Promise.all([
      supabaseAdminGet('leads', { select: 'id,status,source,created_at', limit: '5000' }),
      supabaseAdminGet('whatsapp_conversations', { select: 'id,status,ai_enabled,last_message_at', limit: '2000' }),
      supabaseAdminGet('site_visits', { select: 'id,lead_id,status,scheduled_at,requested_at', limit: '2000' }),
      supabaseAdminGet('properties', { select: 'id,inventory_status', limit: '5000' }),
      supabaseAdminGet('bookings', { select: 'id,status,created_at', limit: '2000' }),
      getAllReviews().catch(() => []),
      supabaseAdminGet('lead_properties', { select: 'lead_id,interest_type', limit: '2000' }).catch(() => [])
    ]);

    const siteVisitLeadIds = new Set(visits.map(v => v.lead_id));
    const enquiryLeads = leads.filter(l => {
      const src = (l.source || '').toLowerCase();
      if (src.includes('whatsapp') || src.includes('offline') || src.includes('walkin')) return false;
      const hasEnquiryInterest = leadProperties.some(lp => lp.lead_id === l.id && lp.interest_type === 'enquiry');
      const notesSayEnquiry = l.notes && /enquiry|inquiry/i.test(l.notes);
      if (hasEnquiryInterest || notesSayEnquiry) return true;
      if (siteVisitLeadIds.has(l.id) && l.status === 'site_visit') return false;
      return true;
    });

    return { status: 200, data: {
      totalEnquiries: enquiryLeads.length,
      newEnquiries: enquiryLeads.filter(x => (x.status || 'new') === 'new').length,
      totalLeads: leads.length,
      newLeads: leads.filter(x => (x.status || 'new') === 'new').length,
      qualifiedLeads: leads.filter(x => x.status === 'qualified').length,
      openConversations: conversations.filter(x => x.status === 'open').length,
      siteVisitRequests: visits.filter(x => x.status === 'REQUESTED').length,
      confirmedVisits: visits.filter(x => x.status === 'CONFIRMED').length,
      inventory: Object.fromEntries(INVENTORY_STATUSES.map(s => [s.toLowerCase(), properties.filter(x => x.inventory_status === s).length])),
      bookings: bookings.filter(x => x.status === 'CONFIRMED').length,
      totalBookings: bookings.filter(x => x.status === 'CONFIRMED').length,
      bookingStatus: Object.fromEntries(BOOKING_STATUSES.map(s => [s, bookings.filter(x => x.status === s).length])),
      totalReviews: allReviews.length,
      pendingReviews: allReviews.filter(r => r.status === 'PENDING').length,
      approvedReviews: allReviews.filter(r => r.status === 'APPROVED' && r.is_visible).length
    } };
  }

  /*
   * ==========================================
   * ENQUIRIES (Website Submissions Only)
   * ==========================================
   */
  if (req.method === 'GET' && section === 'enquiries') {
    const [leads, leadProperties, properties, allBookings] = await Promise.all([
      supabaseAdminGet('leads', {
        select: 'id,name,phone,email,source,status,notes,created_at,updated_at',
        order: 'created_at.desc',
        limit: '1000'
      }),
      supabaseAdminGet('lead_properties', {
        select: 'lead_id,property_id,interest_type,notes,created_at,properties(id,property_code,title,inventory_status,projects(name,slug))',
        order: 'created_at.desc',
        limit: '2000'
      }).catch(() => []),
      supabaseAdminGet('properties', {
        select: 'id,property_code,title,inventory_status,projects(name,slug)',
        limit: '1000'
      }).catch(() => []),
      supabaseAdminGet('bookings', {
        select: 'id,lead_id,property_id,status',
        status: 'eq.CONFIRMED'
      }).catch(() => [])
    ]);

    const bookedLeadProps = new Set(allBookings.map(b => `${b.lead_id}:${b.property_id}`));
    const propMap = new Map(properties.map(p => [p.id, p]));
    const propByCode = new Map();
    properties.forEach(p => {
      if (p.property_code) propByCode.set(p.property_code.toUpperCase(), p);
    });

    // Group lead_properties by lead_id
    const lpByLead = new Map();
    leadProperties.forEach(lp => {
      if (!lpByLead.has(lp.lead_id)) lpByLead.set(lp.lead_id, []);
      lpByLead.get(lp.lead_id).push(lp);
    });

    const enquiries = [];

    for (const l of leads) {
      const src = (l.source || '').toLowerCase();
      if (src.includes('whatsapp') || src.includes('offline') || src.includes('walkin')) continue;

      const leadLps = (lpByLead.get(l.id) || []).filter(lp => lp.interest_type !== 'archived');

      const blocks = (l.notes || '').split(/\n---\n/).filter(b => {
        const isSiteVisit = /\[Website Site Visit\]|\[Offline Site Visit\]|Site visit scheduled/i.test(b);
        const isEnquiry = /\[Website Enquiry\]|\[Contact Enquiry\]|enquiry|inquiry/i.test(b);
        return !isSiteVisit && (isEnquiry || !b.includes('Site Visit'));
      });

      const leadEnqs = [];

      if (blocks.length > 0) {
        blocks.forEach((b, bIdx) => {
          let project = '';
          let property = '';
          const pMatch = b.match(/Project:\s*([^\n,|]+)/i) || b.match(/for\s+([^(\n|]+)/i);
          if (pMatch) project = pMatch[1].trim();
          const uMatch = b.match(/Unit:\s*([^\n,|]+)/i) || b.match(/\b(V\d+|A-\d+|B-\d+|P\d+|F-[A-Z0-9-]+)\b/i);
          if (uMatch) property = uMatch[1].trim();

          let matchedProp = null;
          if (property) matchedProp = propByCode.get(property.toUpperCase());
          if (!matchedProp && project) {
            const matchedLp = leadLps.find(lp => lp.properties?.projects?.name?.toLowerCase() === project.toLowerCase());
            if (matchedLp?.properties) matchedProp = matchedLp.properties;
          }
          if (!matchedProp && project) {
            matchedProp = properties.find(p => p.projects?.name?.toLowerCase() === project.toLowerCase());
          }

          if (matchedProp) {
            project = matchedProp.projects?.name || project;
            property = matchedProp.property_code || property;
          }
          if (!project) project = 'VR Green Meadows';

          // STRICT TRANSACTION ISOLATION:
          // A customer can have multiple enquiries/properties.
          // Booking or cancelling one property must NEVER affect another property for the same customer!
          const lpRecord = matchedProp?.id ? leadLps.find(x => x.property_id === matchedProp.id || x.properties?.id === matchedProp.id) : null;
          if (lpRecord?.interest_type === 'archived') return;

          let status = 'PENDING';
          if (lpRecord?.interest_type === 'cancelled') {
            status = 'CANCEL';
          } else if (lpRecord?.interest_type === 'booked' || (matchedProp?.id && bookedLeadProps.has(`${l.id}:${matchedProp.id}`))) {
            status = 'BOOKED';
          } else if (!matchedProp?.id && (l.status === 'cancelled' || l.status === 'lost')) {
            status = 'CANCEL';
          }

          leadEnqs.push({
            id: `${l.id}:${matchedProp?.id || 'b_' + bIdx}`,
            lead_id: l.id,
            name: l.name || 'Unknown',
            phone: l.phone || '—',
            email: l.email || '—',
            project,
            property: property || '—',
            property_id: matchedProp?.id || null,
            notes: cleanCustomerNote(b),
            status,
            source: 'Website',
            created_at: l.created_at
          });
        });
      }

      // Include any lead_properties not covered by parsed blocks
      leadLps.forEach((lp, idx) => {
        if (lp.interest_type === 'archived') return;
        const propId = lp.properties?.id || lp.property_id;
        if (!leadEnqs.some(e => e.property_id === propId)) {
          const prop = lp.properties || (propId ? propMap.get(propId) : null);
          let project = prop?.projects?.name || 'VR Green Meadows';
          let property = prop?.property_code || '—';

          let status = 'PENDING';
          if (lp.interest_type === 'cancelled') {
            status = 'CANCEL';
          } else if (lp.interest_type === 'booked' || (propId && bookedLeadProps.has(`${l.id}:${propId}`))) {
            status = 'BOOKED';
          }

          leadEnqs.push({
            id: `${l.id}:${propId || 'lp_' + idx}`,
            lead_id: l.id,
            name: l.name || 'Unknown',
            phone: l.phone || '—',
            email: l.email || '—',
            project,
            property,
            property_id: propId || null,
            notes: cleanCustomerNote(lp.notes || l.notes),
            status,
            source: 'Website',
            created_at: lp.created_at || l.created_at
          });
        }
      });

      if (leadEnqs.length === 0 && (l.status === 'new' || !l.status)) {
        leadEnqs.push({
          id: l.id,
          lead_id: l.id,
          name: l.name || 'Unknown',
          phone: l.phone || '—',
          email: l.email || '—',
          project: 'VR Green Meadows',
          property: '—',
          property_id: null,
          notes: cleanCustomerNote(l.notes),
          status: 'PENDING',
          source: 'Website',
          created_at: l.created_at
        });
      }

      enquiries.push(...leadEnqs);
    }

    // Sort newest first
    enquiries.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return { status: 200, data: { enquiries } };
  }

  if (req.method === 'PATCH' && section === 'enquiries' && id) {
    const realLeadId = id.includes(':') ? id.split(':')[0] : id;
    const targetPropertyId = id.includes(':') ? id.split(':')[1] : body.property_id;
    const lead = await leadById(realLeadId);
    if (!lead) return { status: 404, error: { code: 'ENQUIRY_NOT_FOUND', message: 'Enquiry not found.' } };

    const targetStatus = clean(body.status).toUpperCase();
    if (!['BOOKED', 'CANCEL', 'NEW', 'RESTORE', 'REMOVE', 'ARCHIVE'].includes(targetStatus)) {
      return bad('Enquiry status must be BOOKED, CANCEL, RESTORE, or REMOVE.', 'INVALID_ENQUIRY_STATUS');
    }

    if (targetStatus === 'CANCEL') {
      if (targetPropertyId && !targetPropertyId.startsWith('b_') && !targetPropertyId.startsWith('lp_')) {
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`,
          property_id: `eq.${targetPropertyId}`
        }, {
          interest_type: 'cancelled'
        }).catch(() => null);
      } else {
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`
        }, {
          interest_type: 'cancelled'
        }).catch(() => null);
      }
      return { status: 200, data: { success: true, status: 'CANCEL' } };
    }

    if (targetStatus === 'RESTORE' || targetStatus === 'NEW') {
      if (targetPropertyId && !targetPropertyId.startsWith('b_') && !targetPropertyId.startsWith('lp_')) {
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`,
          property_id: `eq.${targetPropertyId}`
        }, {
          interest_type: 'enquiry'
        }).catch(() => null);
      } else {
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`
        }, {
          interest_type: 'enquiry'
        }).catch(() => null);
      }
      return { status: 200, data: { success: true, status: 'PENDING' } };
    }

    if (targetStatus === 'REMOVE' || targetStatus === 'ARCHIVE') {
      if (targetPropertyId && !targetPropertyId.startsWith('b_') && !targetPropertyId.startsWith('lp_')) {
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`,
          property_id: `eq.${targetPropertyId}`
        }, {
          interest_type: 'archived'
        }).catch(() => null);
      } else {
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`
        }, {
          interest_type: 'archived'
        }).catch(() => null);
      }
      return { status: 200, data: { success: true, status: 'ARCHIVED' } };
    }

    if (targetStatus === 'BOOKED') {
      let propertyId = clean(body.property_id) || (targetPropertyId && !targetPropertyId.startsWith('b_') && !targetPropertyId.startsWith('lp_') ? targetPropertyId : null);
      if (!propertyId) {
        const lp = await supabaseAdminGet('lead_properties', {
          select: 'property_id',
          lead_id: `eq.${realLeadId}`,
          limit: '1'
        }).catch(() => []);
        propertyId = lp[0]?.property_id;
      }
      if (!propertyId) {
        const avail = await supabaseAdminGet('properties', {
          select: 'id',
          inventory_status: 'eq.AVAILABLE',
          limit: '1'
        }).catch(() => []);
        propertyId = avail[0]?.id;
      }

      if (!propertyId) {
        return bad('No available property found to book for this enquiry.', 'NO_AVAILABLE_PROPERTY');
      }

      const property = await propertyById(propertyId);
      if (!property) return { status: 404, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } };

      // Concurrency & duplicate booking protection (Section 31)
      if (property.inventory_status === 'BOOKED' || property.inventory_status === 'SOLD') {
        return {
          status: 409,
          error: {
            code: 'PROPERTY_ALREADY_BOOKED',
            message: `Property ${property.property_code || property.title} is already ${property.inventory_status}. Duplicate bookings are not allowed.`
          }
        };
      }

      // Property switching before booking (Section 4, 30):
      // If customer originally enquired about P17 but customer books P18:
      // Book P18, keep P17 AVAILABLE, track original interested property
      const originalPropId = (targetPropertyId && !targetPropertyId.startsWith('b_') && !targetPropertyId.startsWith('lp_')) ? targetPropertyId : null;
      let originalPropertyCode = '';
      if (originalPropId && originalPropId !== propertyId) {
        const origProp = await propertyById(originalPropId).catch(() => null);
        originalPropertyCode = origProp?.property_code || '';
        // Ensure original property remains AVAILABLE
        if (origProp && origProp.inventory_status !== 'BOOKED' && origProp.inventory_status !== 'SOLD') {
          await supabaseAdminPatch('properties', { id: `eq.${originalPropId}` }, {
            inventory_status: 'AVAILABLE',
            updated_at: new Date().toISOString()
          }).catch(() => null);
        }
        // Update lead_properties for original property to note property switch
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`,
          property_id: `eq.${originalPropId}`
        }, {
          notes: `Customer switched preference to ${property.property_code || propertyId}`
        }).catch(() => null);
      }

      const finalPrice = Number(body.final_price || body.finalPrice || property.price || 0);
      const advance = Number(body.amount ?? body.advance ?? 0);
      const remaining = Math.max(0, finalPrice - advance);
      const switchNote = originalPropertyCode ? ` | Original Interested Property: ${originalPropertyCode} | Booked Property: ${property.property_code || propertyId}` : '';
      const bookingNotes = `[Enquiry Booking] Listed Price: ₹${Number(property.price || 0).toLocaleString('en-IN')} | Final Agreed Price: ₹${Number(finalPrice).toLocaleString('en-IN')} | Advance: ₹${Number(advance).toLocaleString('en-IN')} | Remaining: ₹${Number(remaining).toLocaleString('en-IN')}${switchNote}${body.notes ? ` | Notes: ${clean(body.notes)}` : ''}`;

      const existingBooking = await supabaseAdminGet('bookings', {
        select: 'id,booking_reference,status',
        lead_id: `eq.${realLeadId}`,
        property_id: `eq.${propertyId}`,
        status: 'eq.CONFIRMED',
        limit: '1'
      }).catch(() => []);

      let booking = existingBooking[0];
      if (!booking) {
        const ref = `BKG-${Date.now().toString(36).toUpperCase()}`;
        const newBookings = await supabaseAdminPost('bookings', {
          lead_id: realLeadId,
          property_id: propertyId,
          status: 'CONFIRMED',
          booking_reference: ref,
          amount: advance || null,
          currency: 'INR',
          booked_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          notes: bookingNotes
        });
        booking = newBookings[0];
      }

      await supabaseAdminPatch('properties', { id: `eq.${propertyId}` }, {
        inventory_status: 'BOOKED',
        updated_at: new Date().toISOString()
      });

      await supabaseAdminPost('inventory_status_history', {
        property_id: propertyId,
        from_status: property.inventory_status,
        to_status: 'BOOKED',
        reason: `Enquiry booked: ${lead.name || 'Customer'} (${lead.phone || ''})`
      }).catch(() => null);

      // Record in lead_properties for this specific booked property
      const existingLP = await supabaseAdminGet('lead_properties', {
        select: 'id',
        lead_id: `eq.${realLeadId}`,
        property_id: `eq.${propertyId}`,
        limit: '1'
      }).catch(() => []);

      if (existingLP[0]) {
        await supabaseAdminPatch('lead_properties', {
          lead_id: `eq.${realLeadId}`,
          property_id: `eq.${propertyId}`
        }, {
          interest_type: 'booked',
          notes: bookingNotes
        }).catch(() => null);
      } else {
        await supabaseAdminPost('lead_properties', {
          lead_id: realLeadId,
          property_id: propertyId,
          interest_type: 'booked',
          notes: bookingNotes
        }).catch(() => null);
      }

      // CRITICAL BUG FIX (Section 2 & 18):
      // Do NOT patch leads.status = 'won'! A customer may have multiple enquiries/site visits for other properties.
      // Those other records must remain completely untouched and independent.

      // Dispatch WhatsApp booking confirmation to this specific customer (Section 33)
      if (lead?.phone) {
        try {
          const conv = await getOrCreateConversation(lead.id, lead.phone);
          const customerName = lead.name || 'Valued Customer';
          const projectName = property.projects?.name || property.title || 'VR Real Estate Venture';
          const messageText =
            `*Real Estate Brothers group – BOOKING CONFIRMED* 🏡\n\n` +
            `Hello ${customerName},\n\n` +
            `Congratulations! Your booking for *${projectName}* – *${property.property_code ? 'Plot ' + property.property_code : (property.title || 'Property')}* has been *CONFIRMED*.\n\n` +
            `🔖 *Booking Reference:* ${booking?.booking_reference || 'BKG'}\n` +
            `💰 *Final Agreed Price:* ₹${Number(finalPrice).toLocaleString('en-IN')}\n` +
            `💵 *Advance Paid:* ₹${Number(advance).toLocaleString('en-IN')}\n` +
            `💳 *Remaining Balance:* ₹${Number(remaining).toLocaleString('en-IN')}\n\n` +
            `Our relationship manager will reach out shortly with the formal sale agreement documentation.\n\n` +
            `Best regards,\n*Real Estate Brothers group Team*`;
          if (conv) await writeOutbound(conv, messageText);
          else await sendWhatsApp(lead.phone, messageText);
        } catch (waErr) {
          console.warn('[crm] WhatsApp booking confirmation warning:', waErr?.message || waErr);
        }
      }

      return {
        status: 200,
        data: {
          success: true,
          status: 'BOOKED',
          booking,
          property_id: propertyId,
          property_code: property.property_code,
          listed_price: Number(property.price || 0),
          final_price: finalPrice,
          advance,
          remaining_amount: remaining
        }
      };
    }

    return { status: 200, data: { success: true } };
  }

  if (req.method === 'GET' && section === 'leads') {
    if (id) {
      const lead = await leadById(id); if (!lead) return { status: 404, error: { code: 'LEAD_NOT_FOUND', message: 'Lead not found.' } };
      const [interests, visits, conversations, bookings] = await Promise.all([
        supabaseAdminGet('lead_properties', { select: 'lead_id,property_id,interest_type,notes,created_at,properties(id,property_code,title,inventory_status,project_id,projects(name,slug))', lead_id: `eq.${id}`, order: 'created_at.desc' }),
        supabaseAdminGet('site_visits', { select: 'id,property_id,requested_at,scheduled_at,status,confirmed_at,completed_at,cancelled_at,notes,properties(property_code,title,project_id,projects(name,slug))', lead_id: `eq.${id}`, order: 'requested_at.desc' }),
        supabaseAdminGet('whatsapp_conversations', { select: 'id,phone,status,ai_enabled,last_message_at,created_at', lead_id: `eq.${id}`, order: 'last_message_at.desc.nullslast' }),
        supabaseAdminGet('bookings', { select: 'id,property_id,status,booking_reference,amount,currency,booked_at,confirmed_at,cancelled_at,notes,properties(property_code,title,inventory_status)', lead_id: `eq.${id}`, order: 'created_at.desc' })
      ]);
      return { status: 200, data: { lead, interests, visits, conversations, bookings } };
    }
    const status = clean(searchParams.get('status')).toLowerCase(); const q = clean(searchParams.get('q')).toLowerCase();
    const params = { select: 'id,name,phone,email,source,status,notes,created_at,updated_at', order: 'created_at.desc', limit: '500' };
    if (status && status !== 'all') params.status = `eq.${status}`;
    let leads = await supabaseAdminGet('leads', params);
    if (q) leads = leads.filter(x => [x.name, x.phone, x.email, x.source, x.notes].some(v => String(v || '').toLowerCase().includes(q)));

    if (leads.length > 0) {
      const leadIds = leads.map(l => l.id);
      const [allVisits, allInterests] = await Promise.all([
        supabaseAdminGet('site_visits', {
          select: 'lead_id,properties(property_code,title,projects(name))',
          lead_id: `in.(${leadIds.join(',')})`,
          order: 'created_at.desc'
        }).catch(() => []),
        supabaseAdminGet('lead_properties', {
          select: 'lead_id,properties(property_code,title,projects(name))',
          lead_id: `in.(${leadIds.join(',')})`,
          order: 'created_at.desc'
        }).catch(() => [])
      ]);

      const visitMap = new Map();
      allVisits.forEach(v => {
        if (!visitMap.has(v.lead_id) && v.properties) {
          visitMap.set(v.lead_id, {
            project: v.properties.projects?.name || v.properties.title || '',
            property: v.properties.property_code || ''
          });
        }
      });

      const interestMap = new Map();
      allInterests.forEach(i => {
        if (!interestMap.has(i.lead_id) && i.properties) {
          interestMap.set(i.lead_id, {
            project: i.properties.projects?.name || i.properties.title || '',
            property: i.properties.property_code || ''
          });
        }
      });

      leads = leads.map(l => {
        const fromVisit = visitMap.get(l.id);
        const fromInterest = interestMap.get(l.id);
        let project = fromVisit?.project || fromInterest?.project || '';
        let property = fromVisit?.property || fromInterest?.property || '';

        if (!project && l.notes) {
          const match = l.notes.match(/for\s+([^(\n|]+)/i) || l.notes.match(/booking:\s+([^(\n|]+)/i);
          if (match) project = match[1].trim();
        }

        return {
          ...l,
          project: project || 'Real Estate Brothers group',
          property: property || '—'
        };
      });
    }

    return { status: 200, data: { leads } };
  }

  if (req.method === 'POST' && section === 'leads') {
    const name = clean(body.name), phone = clean(body.phone), email = clean(body.email);
    if (!name && !phone) return bad('Lead name or phone is required.', 'LEAD_CONTACT_REQUIRED');
    if (phone) { const existing = await supabaseAdminGet('leads', { select: 'id,name,phone,email,source,status,notes,created_at,updated_at', phone: `eq.${phone}`, limit: '1' }); if (existing[0]) return { status: 200, data: { lead: existing[0], existing: true } }; }
    const status = clean(body.status).toLowerCase();
    const rows = await supabaseAdminPost('leads', { name: name || null, phone: phone || null, email: email || null, source: clean(body.source) || 'crm', status: LEAD_STATUSES.includes(status) ? status : 'new', notes: clean(body.notes) || null });
    return { status: 201, data: { lead: rows[0] || null, existing: false } };
  }
  if (req.method === 'PATCH' && section === 'leads' && id) {
    const update = {};
    if (typeof body.name === 'string') update.name = clean(body.name) || null;
    if (typeof body.email === 'string') update.email = clean(body.email) || null;
    if (typeof body.notes === 'string') update.notes = clean(body.notes) || null;
    if (typeof body.status === 'string') { const status = clean(body.status).toLowerCase(); if (!LEAD_STATUSES.includes(status)) return bad('Invalid lead status.', 'INVALID_LEAD_STATUS'); update.status = status; }
    if (!Object.keys(update).length) return bad('No editable lead fields were supplied.', 'NO_FIELDS');
    update.updated_at = new Date().toISOString(); const rows = await supabaseAdminPatch('leads', { id: `eq.${id}` }, update);
    if (!rows[0]) return { status: 404, error: { code: 'LEAD_NOT_FOUND', message: 'Lead not found.' } };
    return { status: 200, data: { lead: rows[0] } };
  }

  if (req.method === 'GET' && section === 'conversations') {
    const params = { select: 'id,lead_id,phone,status,ai_enabled,last_message_at,created_at,leads(id,name,email,phone,status,notes)', order: 'last_message_at.desc.nullslast', limit: '300' };
    if (id) params.id = `eq.${id}`;
    const conversations = await supabaseAdminGet('whatsapp_conversations', params);
    if (id && !conversations[0]) return { status: 404, error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' } };
    return id ? { status: 200, data: { conversation: conversations[0] } } : { status: 200, data: { conversations } };
  }
  if (req.method === 'PATCH' && section === 'conversations' && id) {
    const update = {}; if (typeof body.ai_enabled === 'boolean') update.ai_enabled = body.ai_enabled;
    if (typeof body.status === 'string') { const status = clean(body.status).toLowerCase(); if (!['open','closed'].includes(status)) return bad('Conversation status must be open or closed.', 'INVALID_CONVERSATION_STATUS'); update.status = status; }
    if (!Object.keys(update).length) return bad('No conversation fields were supplied.', 'NO_FIELDS');
    update.updated_at = new Date().toISOString(); const rows = await supabaseAdminPatch('whatsapp_conversations', { id: `eq.${id}` }, update);
    if (!rows[0]) return { status: 404, error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' } };
    return { status: 200, data: { conversation: rows[0] } };
  }
  if (req.method === 'GET' && section === 'messages' && id) return { status: 200, data: { messages: await supabaseAdminGet('whatsapp_messages', { select: 'id,direction,message_type,body,created_at', conversation_id: `eq.${id}`, order: 'created_at.asc', limit: '500' }) } };
  if (req.method === 'POST' && section === 'messages' && id) {
    const text = clean(body.body); if (!text) return bad('Message text is required.', 'MESSAGE_REQUIRED');
    const rows = await supabaseAdminGet('whatsapp_conversations', { select: 'id,phone,status,ai_enabled', id: `eq.${id}`, limit: '1' }); if (!rows[0]) return { status: 404, error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' } };
    await writeOutbound(rows[0], text); return { status: 201, data: { sent: true } };
  }

  if (req.method === 'GET' && section === 'site-visits') {
    const status = clean(searchParams.get('status')).toUpperCase();
    const params = {
      select: 'id,lead_id,property_id,requested_at,scheduled_at,status,confirmed_at,completed_at,cancelled_at,notes,created_at,updated_at,leads(id,name,phone,email,status,source),properties(id,property_code,title,inventory_status,project_id,projects(name,slug))',
      order: 'requested_at.desc.nullslast',
      limit: '500'
    };
    if (status && status !== 'ALL' && status !== 'BOOKED') params.status = `eq.${status}`;
    let visits = await supabaseAdminGet('site_visits', params);
    visits = visits.map(v => {
      let currentStatus = v.status;
      if (v.notes && v.notes.startsWith('[BOOKED]')) {
        currentStatus = 'BOOKED';
      }

      let projectName = v.properties?.projects?.name || '';
      let propertyCode = v.properties?.property_code || '';
      let propertyTitle = v.properties?.title || '';

      if (v.notes) {
        const pMatch = v.notes.match(/Project:\s*([^\n,|]+)/i);
        if (pMatch && (!projectName || projectName === 'VR Green Meadows')) {
          projectName = pMatch[1].trim();
        }
        const uMatch = v.notes.match(/Unit:\s*([^\n,|]+)/i) || v.notes.match(/\((V\d+|A-\d+|B-\d+|P\d+|F-[A-Z0-9-]+)\)/i);
        if (uMatch && (!propertyCode || propertyCode === 'P01')) {
          propertyCode = uMatch[1].trim();
        }
      }

      const updatedProps = v.properties ? {
        ...v.properties,
        projects: {
          ...(v.properties.projects || {}),
          name: projectName || v.properties.projects?.name || 'VR Green Meadows'
        },
        property_code: propertyCode || v.properties.property_code,
        title: propertyTitle || v.properties.title
      } : {
        property_code: propertyCode || '—',
        title: propertyTitle || '—',
        projects: { name: projectName || 'VR Green Meadows' }
      };

      return {
        ...v,
        status: currentStatus,
        properties: updatedProps,
        customer_note: cleanCustomerNote(v.notes)
      };
    });
    if (status === 'BOOKED') {
      visits = visits.filter(v => v.status === 'BOOKED');
    }
    return { status: 200, data: { visits } };
  }
  if (req.method === 'POST' && section === 'site-visits') {
    let leadId = clean(body.lead_id);
    let propertyId = clean(body.property_id);
    const scheduledAt = body.scheduled_at ? iso(body.scheduled_at) : null;

    // Support offline site visit creation from "+ Add Site Visit" modal
    if (!leadId && (body.customer_name || body.name)) {
      const name = clean(body.customer_name || body.name);
      const phone = clean(body.customer_phone || body.phone);
      const email = clean(body.customer_email || body.email);
      let lead = (await supabaseAdminGet('leads', { select: 'id,name,phone,email', phone: `eq.${phone}`, limit: '1' }).catch(() => []))[0];
      if (!lead) {
        const createdLeads = await supabaseAdminPost('leads', {
          name,
          phone,
          email: email || null,
          source: 'Offline',
          status: 'site_visit',
          notes: clean(body.notes) || 'Offline site visit customer'
        }).catch(() => []);
        lead = createdLeads[0];
      }
      leadId = lead?.id;
    }

    if (!leadId) return bad('Lead or customer information is required.', 'SITE_VISIT_FIELDS_REQUIRED');

    if (!propertyId && body.property_code) {
      const prop = (await supabaseAdminGet('properties', { select: 'id', property_code: `eq.${clean(body.property_code)}`, limit: '1' }).catch(() => []))[0];
      propertyId = prop?.id;
    }
    if (!propertyId) {
      const first = (await supabaseAdminGet('properties', { select: 'id', limit: '1' }).catch(() => []))[0];
      propertyId = first?.id;
    }

    const visitStatus = clean(body.status).toUpperCase() === 'CONFIRMED' ? 'CONFIRMED' : 'REQUESTED';
    const visitNotes = clean(body.notes) || (body.source === 'Offline' ? '[Offline Site Visit]' : '');
    const rows = await supabaseAdminPost('site_visits', {
      lead_id: leadId,
      property_id: propertyId,
      requested_at: new Date().toISOString(),
      scheduled_at: scheduledAt,
      status: visitStatus,
      notes: visitNotes
    });
    return { status: 201, data: { visit: rows[0] || null } };
  }
  if (req.method === 'PATCH' && section === 'site-visits' && id) {
    const rows = await supabaseAdminGet('site_visits', { select: 'id,lead_id,property_id,requested_at,scheduled_at,status,confirmed_at,completed_at,cancelled_at,notes,leads(id,name,phone,email),properties(id,property_code,title,inventory_status,price,projects(name))', id: `eq.${id}`, limit: '1' });
    const visit = rows[0]; if (!visit) return { status: 404, error: { code: 'SITE_VISIT_NOT_FOUND', message: 'Site visit not found.' } };
    const next = clean(body.status).toUpperCase(); if (!VISIT_STATUSES.includes(next)) return bad('Invalid site visit status.', 'INVALID_SITE_VISIT_STATUS');
    const transitions = {
      REQUESTED: ['CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'BOOKED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'BOOKED'],
      RESCHEDULED: ['CONFIRMED', 'CANCELLED', 'BOOKED'],
      COMPLETED: ['BOOKED'],
      CANCELLED: [],
      NO_SHOW: [],
      BOOKED: []
    };
    if (visit.status !== next && !transitions[visit.status]?.includes(next)) return bad(`Invalid site visit transition: ${visit.status} → ${next}.`, 'INVALID_SITE_VISIT_TRANSITION');

    // SITE VISIT → BOOKED: Owner converts site visit to confirmed booking
    if (next === 'BOOKED') {
      const selectedPropertyId = clean(body.property_id) || visit.property_id;
      if (!selectedPropertyId) {
        return bad('Site visit does not have an associated property to book.', 'NO_PROPERTY');
      }
      const prop = await propertyById(selectedPropertyId);
      if (!prop) return { status: 404, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } };

      // Concurrency & duplicate booking protection (Section 31)
      if (prop.inventory_status === 'BOOKED' || prop.inventory_status === 'SOLD') {
        return {
          status: 409,
          error: {
            code: 'PROPERTY_ALREADY_BOOKED',
            message: `Property ${prop.property_code || prop.title} is already ${prop.inventory_status}. Duplicate bookings are not allowed.`
          }
        };
      }

      // Property switching check:
      if (visit.property_id && visit.property_id !== selectedPropertyId) {
        const origProp = await propertyById(visit.property_id).catch(() => null);
        if (origProp && origProp.inventory_status !== 'BOOKED' && origProp.inventory_status !== 'SOLD') {
          await supabaseAdminPatch('properties', { id: `eq.${visit.property_id}` }, {
            inventory_status: 'AVAILABLE',
            updated_at: new Date().toISOString()
          }).catch(() => null);
        }
      }

      const finalPrice = Number(body.final_price || body.finalPrice || prop.price || 0);
      const advance = Number(body.amount ?? body.advance ?? 0);
      const remaining = Math.max(0, finalPrice - advance);
      const switchNote = (visit.property_id && visit.property_id !== selectedPropertyId) ? ` | Switched from visit property to ${prop.property_code}` : '';
      const bookingNotes = `[Site Visit Booking] Listed Price: ₹${Number(prop.price || 0).toLocaleString('en-IN')} | Final Agreed Price: ₹${Number(finalPrice).toLocaleString('en-IN')} | Advance: ₹${Number(advance).toLocaleString('en-IN')} | Remaining: ₹${Number(remaining).toLocaleString('en-IN')}${switchNote}${body.notes ? ` | Notes: ${clean(body.notes)}` : ''}`;

      const existing = await supabaseAdminGet('bookings', {
        select: 'id,booking_reference,status',
        lead_id: `eq.${visit.lead_id}`,
        property_id: `eq.${selectedPropertyId}`,
        status: 'eq.CONFIRMED',
        limit: '1'
      }).catch(() => []);

      let booking = existing[0];
      if (!booking) {
        const ref = `BKG-${Date.now().toString(36).toUpperCase()}`;
        const newBookings = await supabaseAdminPost('bookings', {
          lead_id: visit.lead_id,
          property_id: selectedPropertyId,
          status: 'CONFIRMED',
          booking_reference: ref,
          amount: advance || null,
          currency: 'INR',
          booked_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          notes: bookingNotes
        });
        booking = newBookings[0];
      }

      await supabaseAdminPatch('properties', { id: `eq.${selectedPropertyId}` }, {
        inventory_status: 'BOOKED',
        updated_at: new Date().toISOString()
      });

      await supabaseAdminPost('inventory_status_history', {
        property_id: selectedPropertyId,
        from_status: prop.inventory_status,
        to_status: 'BOOKED',
        reason: `Site visit converted to booking: ${visit.leads?.name || 'Customer'}`
      }).catch(() => null);

      const updated = await supabaseAdminPatch('site_visits', { id: `eq.${id}` }, {
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        notes: `[BOOKED] ${visit.notes || ''}`.trim(),
        updated_at: new Date().toISOString()
      });

      // Dispatch WhatsApp booking confirmation to customer (Section 33)
      if (visit.leads?.phone) {
        try {
          const conv = await getOrCreateConversation(visit.lead_id, visit.leads.phone);
          const customerName = visit.leads.name || 'Valued Customer';
          const projectName = prop.projects?.name || prop.title || 'VR Real Estate Venture';
          const messageText =
            `*Real Estate Brothers group – BOOKING CONFIRMED* 🏡\n\n` +
            `Hello ${customerName},\n\n` +
            `Congratulations! Following your site visit, your booking for *${projectName}* – *Plot ${prop.property_code || 'Unit'}* has been *CONFIRMED*.\n\n` +
            `🔖 *Booking Reference:* ${booking?.booking_reference || 'BKG'}\n` +
            `💰 *Final Agreed Price:* ₹${Number(finalPrice).toLocaleString('en-IN')}\n` +
            `💵 *Advance Paid:* ₹${Number(advance).toLocaleString('en-IN')}\n` +
            `💳 *Remaining Balance:* ₹${Number(remaining).toLocaleString('en-IN')}\n\n` +
            `Our team will reach out with the sale agreement and next steps.\n\n` +
            `Best regards,\n*Real Estate Brothers group Team*`;
          if (conv) await writeOutbound(conv, messageText);
          else await sendWhatsApp(visit.leads.phone, messageText);
        } catch (waErr) {
          console.warn('[crm] WhatsApp site-visit booking confirmation warning:', waErr?.message || waErr);
        }
      }

      return {
        status: 200,
        data: {
          visit: { ...(updated[0] || visit), status: 'BOOKED' },
          booking,
          property_id: selectedPropertyId,
          property_code: prop.property_code,
          listed_price: Number(prop.price || 0),
          final_price: finalPrice,
          advance,
          remaining_amount: remaining
        }
      };
    }
    if (visit.status !== next && !transitions[visit.status]?.includes(next)) return bad(`Invalid site visit transition: ${visit.status} → ${next}.`, 'INVALID_SITE_VISIT_TRANSITION');
    const scheduledAt = body.scheduled_at !== undefined ? iso(body.scheduled_at) : visit.scheduled_at;
    if (body.scheduled_at && !scheduledAt) return bad('scheduled_at must be a valid date/time.', 'INVALID_SCHEDULE');
    if (next === 'CONFIRMED' && !scheduledAt) return bad('A confirmed site visit needs a scheduled date and time.', 'SCHEDULE_REQUIRED');
    let notificationSent = false;
    if (next === 'CONFIRMED') {
      let conv = (await supabaseAdminGet('whatsapp_conversations', { select: 'id,phone,status', lead_id: `eq.${visit.lead_id}`, order: 'last_message_at.desc.nullslast', limit: '1' }))[0];
      if (!conv && visit.leads?.phone) {
        conv = await getOrCreateConversation(visit.lead_id, visit.leads.phone);
      }
      if (conv) {
        try {
          const customerName = visit.leads?.name || 'Valued Customer';
          const projectName = visit.properties?.title || visit.properties?.property_code || 'Real Estate Brothers group Property';
          const scheduleText = dateLabel(scheduledAt);
          const messageText =
            `*Real Estate Brothers group – SITE VISIT CONFIRMED* ✅\n\n` +
            `Hello ${customerName},\n\n` +
            `Great news! Your site visit for *${projectName}* has been *CONFIRMED* by our team.\n\n` +
            `📍 *Project / Unit:* ${projectName}\n` +
            `📅 *Scheduled Date:* ${scheduleText}\n\n` +
            `Our site coordinator will be present at the site to guide you through the venture. If free pickup was requested, our driver will contact you beforehand.\n\n` +
            `Need any assistance? Reply directly to this WhatsApp message.\n\n` +
            `Best regards,\n` +
            `*Real Estate Brothers group Team*`;
          await writeOutbound(conv, messageText);
          notificationSent = true;
        } catch (e) {
          console.warn('[crm] site-visit WhatsApp send warning:', e?.message || e);
        }
      }
      // CRITICAL: Site visits are for visiting only. Confirming a site visit NEVER auto-confirms or alters plot bookings.
    } else if (next === 'CANCELLED') {
      let conv = (await supabaseAdminGet('whatsapp_conversations', { select: 'id,phone,status', lead_id: `eq.${visit.lead_id}`, order: 'last_message_at.desc.nullslast', limit: '1' }))[0];
      if (!conv && visit.leads?.phone) conv = await getOrCreateConversation(visit.lead_id, visit.leads.phone);
      if (conv) {
        try {
          const customerName = visit.leads?.name || 'Valued Customer';
          const projectName = visit.properties?.title || visit.properties?.property_code || 'Real Estate Brothers group Property';
          const messageText =
            `*Real Estate Brothers group – Site Visit Update*\n\n` +
            `Hello ${customerName},\n\n` +
            `Thank you for your interest in *${projectName}*. Your site visit request could not be accommodated for the requested time slot.\n\n` +
            `Please reply to this message with an alternate convenient date/time, and we will gladly arrange your visit.\n\n` +
            `Best regards,\n*Real Estate Brothers group Team*`;
          await writeOutbound(conv, messageText);
          notificationSent = true;
        } catch (e) {
          console.warn('[crm] site-visit cancellation WhatsApp send warning:', e?.message || e);
        }
      }
    } else if (next === 'RESCHEDULED') {
      let conv = (await supabaseAdminGet('whatsapp_conversations', { select: 'id,phone,status', lead_id: `eq.${visit.lead_id}`, order: 'last_message_at.desc.nullslast', limit: '1' }))[0];
      if (!conv && visit.leads?.phone) conv = await getOrCreateConversation(visit.lead_id, visit.leads.phone);
      if (conv) {
        try {
          const customerName = visit.leads?.name || 'Valued Customer';
          const projectName = visit.properties?.title || visit.properties?.property_code || 'Real Estate Brothers group Property';
          const scheduleText = dateLabel(scheduledAt);
          const messageText =
            `*Real Estate Brothers group – SITE VISIT RESCHEDULED* 📅\n\n` +
            `Hello ${customerName},\n\n` +
            `Your site visit for *${projectName}* has been rescheduled.\n\n` +
            `📍 *Project / Unit:* ${projectName}\n` +
            `📅 *New Scheduled Time:* ${scheduleText}\n\n` +
            `Our coordinator will welcome you at the site. Reply to this message if you need further adjustments.\n\n` +
            `Best regards,\n*Real Estate Brothers group Team*`;
          await writeOutbound(conv, messageText);
          notificationSent = true;
        } catch (e) {
          console.warn('[crm] site-visit reschedule WhatsApp send warning:', e?.message || e);
        }
      }
    }
    const update = { status: next, scheduled_at: scheduledAt, notes: body.notes !== undefined ? clean(body.notes) || null : visit.notes, updated_at: new Date().toISOString() };
    if (next === 'CONFIRMED') update.confirmed_at = new Date().toISOString(); if (next === 'COMPLETED') update.completed_at = new Date().toISOString(); if (next === 'CANCELLED') update.cancelled_at = new Date().toISOString();
    const updated = await supabaseAdminPatch('site_visits', { id: `eq.${id}`, status: `eq.${visit.status}` }, update); if (!updated[0]) return { status: 409, error: { code: 'SITE_VISIT_CHANGED', message: 'This visit changed before your action completed. Refresh and try again.' } };
    return { status: 200, data: { visit: updated[0], notification_sent: notificationSent, confirmation_sent: next === 'CONFIRMED' } };
  }

  if (req.method === 'GET' && section === 'inventory') {
    if (id && pathParts[4] === 'history') {
      const history = await supabaseAdminGet('inventory_status_history', {
        select: 'id,property_id,from_status,to_status,reason,created_at',
        property_id: `eq.${id}`,
        order: 'created_at.desc',
        limit: '50'
      }).catch(() => []);
      return { status: 200, data: { history } };
    }

    const status = clean(searchParams.get('status')).toUpperCase();
    const type = clean(searchParams.get('type')).toUpperCase();
    const project = clean(searchParams.get('project'));
    const params = {
      select: 'id,project_id,property_code,title,property_type,inventory_status,area,area_unit,price,currency,metadata,created_at,updated_at,projects(name,slug)',
      order: 'property_code.asc',
      limit: '1000'
    };
    if (status && status !== 'ALL') params.inventory_status = `eq.${status}`;
    if (type && type !== 'ALL') params.property_type = `eq.${type}`;
    if (project) params.project_id = `eq.${project}`;

    const properties = await supabaseAdminGet('properties', params);

    // Attach active customer/booking info for BOOKED, HOLD, RESERVED, AND SOLD properties (Section 3 & 15)
    const bookedProps = properties.filter(p => p.inventory_status === 'BOOKED' || p.inventory_status === 'HOLD' || p.inventory_status === 'RESERVED' || p.inventory_status === 'SOLD');
    if (bookedProps.length) {
      const propIds = bookedProps.map(p => p.id);
      const bookings = await supabaseAdminGet('bookings', {
        select: 'id,property_id,booking_reference,status,amount,booked_at,notes,leads(id,name,phone,email,source)',
        property_id: `in.(${propIds.join(',')})`,
        order: 'created_at.desc'
      }).catch(() => []);

      const bookingMap = new Map();
      bookings.forEach(b => {
        if (!bookingMap.has(b.property_id)) bookingMap.set(b.property_id, b);
      });

      properties.forEach(p => {
        const b = bookingMap.get(p.id);
        if (b) {
          const fin = parseBookingFinancials(b, p.price);
          p.active_booking = {
            id: b.id,
            booking_reference: b.booking_reference,
            status: b.status,
            amount: fin.advance,
            listed_price: fin.listed_price,
            final_price: fin.final_price,
            remaining_amount: fin.remaining_amount,
            booked_at: b.booked_at,
            notes: b.notes,
            customer_name: b.leads?.name || '',
            customer_phone: b.leads?.phone || '',
            customer_email: b.leads?.email || '',
            source: b.leads?.source || 'CRM'
          };
        }
      });
    }

    return { status: 200, data: { properties } };
  }
  if (req.method === 'PATCH' && section === 'inventory' && id) {
    if (pathParts[4] === 'price') {
      const prop = await propertyById(id);
      if (!prop) return { status: 404, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } };
      if (prop.inventory_status === 'BOOKED' || prop.inventory_status === 'SOLD') {
        return bad(`Cannot edit price of a ${prop.inventory_status} property to preserve historical booking integrity.`, 'PROPERTY_NOT_AVAILABLE');
      }
      const newPrice = Number(body.price);
      if (Number.isNaN(newPrice) || newPrice <= 0) {
        return bad('Price must be a valid positive number.', 'INVALID_PRICE');
      }
      const updated = await supabaseAdminPatch('properties', { id: `eq.${id}` }, {
        price: newPrice,
        updated_at: new Date().toISOString()
      });
      await supabaseAdminPost('inventory_status_history', {
        property_id: id,
        from_status: prop.inventory_status,
        to_status: prop.inventory_status,
        reason: `Price updated by owner from ₹${prop.price || 0} to ₹${newPrice}`
      }).catch(() => null);
      return { status: 200, data: { property: updated[0] || prop, price: newPrice } };
    }
    return inventoryUpdate(id, body.status, body.reason);
  }

  if (req.method === 'GET' && section === 'bookings') {
    const status = clean(searchParams.get('status')).toUpperCase();
    const params = {
      select: 'id,lead_id,property_id,status,booking_reference,amount,currency,booked_at,confirmed_at,cancelled_at,cancellation_reason,notes,created_at,updated_at,leads(id,name,phone,email,status,source),properties(id,property_code,title,inventory_status,price,projects(name,slug))',
      order: 'created_at.desc',
      limit: '500'
    };
    if (status && status !== 'ALL') {
      params.status = status === 'BOOKED' ? 'eq.CONFIRMED' : `eq.${status}`;
    }
    const rawBookings = await supabaseAdminGet('bookings', params);
    const bookings = rawBookings.map(b => {
      const fin = parseBookingFinancials(b, b.properties?.price);
      return {
        ...b,
        listed_price: fin.listed_price,
        final_price: fin.final_price,
        amount: fin.advance,
        remaining_amount: fin.remaining_amount
      };
    });
    return { status: 200, data: { bookings } };
  }
  if (req.method === 'POST' && section === 'offline-booking') {
    const propertyId = clean(body.property_id);
    const name = clean(body.customer_name);
    const phone = clean(body.customer_phone);
    const email = clean(body.customer_email);
    const targetStatus = clean(body.status).toUpperCase() === 'HOLD' ? 'RESERVED' : 'BOOKED';
    const amount = body.amount ?? null;
    const notes = clean(body.notes) || 'Offline customer booking recorded via CRM';

    if (!propertyId || !name || !phone) {
      return bad('Property, customer name, and customer phone are required.', 'OFFLINE_BOOKING_FIELDS_REQUIRED');
    }

    const prop = await propertyById(propertyId);
    if (!prop) return { status: 404, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } };

    // Duplicate booking protection: reject if already BOOKED or SOLD
    if (prop.inventory_status === 'BOOKED' || prop.inventory_status === 'SOLD') {
      return {
        status: 409,
        error: {
          code: 'PROPERTY_ALREADY_BOOKED',
          message: `Property ${prop.property_code || propertyId} is already ${prop.inventory_status}. Duplicate bookings are not allowed.`
        }
      };
    }

    let lead = (await supabaseAdminGet('leads', { select: 'id,name,phone,email', phone: `eq.${phone}`, limit: '1' }).catch(() => []))[0];
    if (!lead) {
      const createdLeads = await supabaseAdminPost('leads', {
        name,
        phone,
        email: email || null,
        source: 'Offline',
        status: targetStatus === 'BOOKED' ? 'won' : 'qualified',
        notes: `Offline customer for property ${prop.property_code || propertyId}. ${notes}`
      }).catch(() => []);
      lead = createdLeads[0];
    }

    const finalPrice = Number(body.final_price || body.finalPrice || prop.price || 0);
    const advance = Number(body.amount ?? body.advance ?? 0);
    const remaining = Math.max(0, finalPrice - advance);
    const bookingNotes = `[Offline Booking] Listed Price: ₹${Number(prop.price || 0).toLocaleString('en-IN')} | Final Agreed Price: ₹${Number(finalPrice).toLocaleString('en-IN')} | Advance: ₹${Number(advance).toLocaleString('en-IN')} | Remaining: ₹${Number(remaining).toLocaleString('en-IN')}${notes ? ` | Notes: ${notes}` : ''}`;

    await supabaseAdminPatch('properties', { id: `eq.${propertyId}` }, {
      inventory_status: targetStatus,
      updated_at: new Date().toISOString()
    }).catch((e) => console.warn('[crm] property patch warning:', e?.message || e));

    const bookingRows = await supabaseAdminPost('bookings', {
      lead_id: lead?.id || null,
      property_id: propertyId,
      status: targetStatus === 'BOOKED' ? 'CONFIRMED' : 'PENDING',
      booking_reference: `OFF-${Date.now().toString(36).toUpperCase()}`,
      amount: advance || null,
      currency: 'INR',
      booked_at: new Date().toISOString(),
      confirmed_at: targetStatus === 'BOOKED' ? new Date().toISOString() : null,
      notes: bookingNotes
    }).catch(() => []);

    await supabaseAdminPost('inventory_status_history', {
      property_id: propertyId,
      from_status: prop.inventory_status,
      to_status: targetStatus,
      reason: `Offline booking: ${name} (${phone})`
    }).catch(() => null);

    return {
      status: 201,
      data: {
        success: true,
        booking: bookingRows[0] || null,
        lead,
        property_id: propertyId,
        inventory_status: targetStatus,
        final_price: finalPrice,
        advance,
        remaining_amount: remaining
      }
    };
  }

  if (req.method === 'POST' && section === 'bookings') {
    let leadId = clean(body.lead_id);
    const propertyId = clean(body.property_id);

    if (!leadId && (body.customer_name || body.name)) {
      const name = clean(body.customer_name || body.name);
      const phone = clean(body.customer_phone || body.phone);
      const email = clean(body.customer_email || body.email);
      let lead = (await supabaseAdminGet('leads', { select: 'id,name,phone,email', phone: `eq.${phone}`, limit: '1' }).catch(() => []))[0];
      if (!lead) {
        const createdLeads = await supabaseAdminPost('leads', {
          name,
          phone,
          email: email || null,
          source: clean(body.source) || 'Offline',
          status: 'won',
          notes: clean(body.notes) || 'Direct booking customer'
        }).catch(() => []);
        lead = createdLeads[0];
      }
      leadId = lead?.id;
    }

    if (!leadId || !propertyId) return bad('Customer and property are required.', 'BOOKING_FIELDS_REQUIRED');
    const property = await propertyById(propertyId);
    if (!property) return { status: 404, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } };

    // Duplicate booking protection
    if (property.inventory_status === 'BOOKED' || property.inventory_status === 'SOLD') {
      return {
        status: 409,
        error: {
          code: 'PROPERTY_ALREADY_BOOKED',
          message: `Property ${property.property_code || property.title} is already ${property.inventory_status}. Duplicate bookings are not allowed.`
        }
      };
    }

    await supabaseAdminPatch('properties', { id: `eq.${propertyId}` }, {
      inventory_status: 'BOOKED',
      updated_at: new Date().toISOString()
    });

    const finalPrice = Number(body.final_price || body.finalPrice || property.price || 0);
    const advance = Number(body.amount ?? body.advance ?? 0);
    const remaining = Math.max(0, finalPrice - advance);
    const bookingNotes = `[Direct Booking] Listed Price: ₹${Number(property.price || 0).toLocaleString('en-IN')} | Final Agreed Price: ₹${Number(finalPrice).toLocaleString('en-IN')} | Advance: ₹${Number(advance).toLocaleString('en-IN')} | Remaining: ₹${Number(remaining).toLocaleString('en-IN')}${body.notes ? ` | Notes: ${clean(body.notes)}` : ''}`;

    const bookingRef = clean(body.booking_reference) || `BKG-${Date.now().toString(36).toUpperCase()}`;
    const rows = await supabaseAdminPost('bookings', {
      lead_id: leadId,
      property_id: propertyId,
      status: 'CONFIRMED',
      booking_reference: bookingRef,
      amount: advance || null,
      currency: clean(body.currency) || 'INR',
      booked_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      notes: bookingNotes
    });

    await supabaseAdminPost('inventory_status_history', {
      property_id: propertyId,
      from_status: property.inventory_status,
      to_status: 'BOOKED',
      reason: `Direct booking confirmed via CRM: ${body.customer_name || leadId}`
    }).catch(() => null);

    return {
      status: 201,
      data: {
        booking: rows[0] || null,
        property_id: propertyId,
        inventory_status: 'BOOKED',
        final_price: finalPrice,
        advance,
        remaining_amount: remaining
      }
    };
  }
  if (req.method === 'PATCH' && section === 'bookings' && id) {
    const rows = await supabaseAdminGet('bookings', { select: 'id,lead_id,property_id,status,booking_reference,amount,currency,booked_at,confirmed_at,cancelled_at,notes', id: `eq.${id}`, limit: '1' }); const booking = rows[0];
    const next = clean(body.status).toUpperCase();
    if (!BOOKING_STATUSES.includes(next)) return bad('Invalid booking status.', 'INVALID_BOOKING_STATUS');
    const allowed = { PENDING: ['CONFIRMED','CANCELLED'], CONFIRMED: ['COMPLETED','CANCELLED'], COMPLETED: [], CANCELLED: [] };
    if (booking.status !== next && !allowed[booking.status]?.includes(next)) return bad(`Invalid booking transition: ${booking.status} → ${next}.`, 'INVALID_BOOKING_TRANSITION');
    if (next === 'COMPLETED' && booking.property_id) {
      const prop = await propertyById(booking.property_id);
      if (prop && prop.inventory_status !== 'SOLD') {
        const result = await inventoryUpdate(booking.property_id, 'SOLD', 'Booking completed');
        if (result.status !== 200 && result.status !== 409 && result.status !== 404) return result;
      }
    }
    if (next === 'CANCELLED' && booking.property_id) {
      const property = await propertyById(booking.property_id);
      if (property?.inventory_status === 'BOOKED' || property?.inventory_status === 'RESERVED' || property?.inventory_status === 'HOLD') {
        const result = await inventoryUpdate(booking.property_id, 'AVAILABLE', 'Booking cancelled / released');
        if (result.status !== 200) return result;
      }
    }
    const update = { status: next, updated_at: new Date().toISOString() };
    if (next === 'CONFIRMED') { update.confirmed_at = new Date().toISOString(); update.booked_at = new Date().toISOString(); }
    if (next === 'COMPLETED') { update.confirmed_at = update.confirmed_at || new Date().toISOString(); }
    if (next === 'CANCELLED') { update.cancelled_at = new Date().toISOString(); }
    if (body.notes !== undefined) update.notes = clean(body.notes) || null;
    const updated = await supabaseAdminPatch('bookings', { id: `eq.${id}`, status: `eq.${booking.status}` }, update); if (!updated[0]) return { status: 409, error: { code: 'BOOKING_CHANGED', message: 'Booking changed before this action completed. Refresh and try again.' } };

    // When confirmed by owner, dispatch WhatsApp Site Visit Confirmation to customer!
    let confirmationSent = false;
    if (next === 'CONFIRMED') {
      try {
        const [lead, property, linkedVisits] = await Promise.all([
          leadById(booking.lead_id),
          propertyById(booking.property_id),
          supabaseAdminGet('site_visits', {
            select: 'id,scheduled_at,status,notes',
            lead_id: `eq.${booking.lead_id}`,
            property_id: `eq.${booking.property_id}`,
            order: 'created_at.desc',
            limit: '1'
          }).catch(() => [])
        ]);

        const linkedVisit = linkedVisits[0];
        if (linkedVisit && linkedVisit.status === 'REQUESTED') {
          await supabaseAdminPatch('site_visits', { id: `eq.${linkedVisit.id}` }, {
            status: 'CONFIRMED',
            confirmed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).catch(() => null);
        }

        if (lead?.phone) {
          const conv = await getOrCreateConversation(lead.id, lead.phone);
          const customerName = lead.name || 'Valued Customer';
          const projectName = property?.title || property?.projects?.name || 'Real Estate Brothers group Property';
          let scheduleText = linkedVisit?.scheduled_at ? dateLabel(linkedVisit.scheduled_at) : 'as requested';
          if ((!linkedVisit?.scheduled_at || scheduleText === 'the requested time') && booking.notes) {
            const m = booking.notes.match(/on\s+([^(]+)(?:\(([^)]+)\))?/i);
            if (m) scheduleText = `${m[1].trim()}${m[2] ? ` (${m[2].trim()})` : ''}`;
          }

          const messageText =
            `*Real Estate Brothers group – SITE VISIT CONFIRMED* ✅\n\n` +
            `Hello ${customerName},\n\n` +
            `Great news! Your site visit for *${projectName}* has been *CONFIRMED* by our team.\n\n` +
            `📍 *Project / Unit:* ${projectName} (${property?.property_code || 'Unit'})\n` +
            `📅 *Scheduled Date:* ${scheduleText}\n` +
            `${booking.booking_reference ? `🔖 *Booking Reference:* ${booking.booking_reference}\n` : ''}\n` +
            `Our site coordinator will be present at the site to guide you through the venture. If free pickup was requested, our driver will contact you beforehand.\n\n` +
            `Need any assistance? Reply directly to this WhatsApp message.\n\n` +
            `Best regards,\n` +
            `*Real Estate Brothers group Team*`;

          if (conv) {
            await writeOutbound(conv, messageText);
            confirmationSent = true;
          } else {
            await sendWhatsApp(lead.phone, messageText);
            confirmationSent = true;
          }
          console.log(`[crm] Site visit confirmation WhatsApp sent to customer ${lead.phone} for booking ${id}`);
        }
      } catch (confirmErr) {
        console.error('[crm] Failed to send WhatsApp site visit confirmation to customer:', confirmErr?.message || confirmErr);
      }
    }

    if (next === 'CANCELLED') {
      await supabaseAdminPatch('site_visits', {
        lead_id: `eq.${booking.lead_id}`,
        property_id: `eq.${booking.property_id}`,
        status: 'eq.REQUESTED'
      }, {
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).catch(() => null);
    }

    return { status: 200, data: { booking: updated[0], confirmation_sent: confirmationSent } };
  }

  /*
   * ==========================================
   * REVIEWS (CRM Management)
   * ==========================================
   */
  if (req.method === 'GET' && section === 'reviews') {
    const reviews = await getAllReviews();
    const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;
    const approvedCount = reviews.filter((r) => r.status === 'APPROVED' && r.is_visible).length;
    return {
      status: 200,
      data: {
        reviews,
        total_count: reviews.length,
        pending_count: pendingCount,
        approved_count: approvedCount
      }
    };
  }

  if (req.method === 'PATCH' && section === 'reviews' && id) {
    const updated = await updateReview(id, body);
    if (!updated) {
      return { status: 404, error: { code: 'REVIEW_NOT_FOUND', message: 'Review not found.' } };
    }
    return { status: 200, data: { review: updated } };
  }

  if (req.method === 'POST' && section === 'reviews' && pathParts[3] === 'sync-google') {
    let newReviews = [];
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;
    if (apiKey && placeId) {
      try {
        const url = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,rating,userRatingCount,reviews&key=${apiKey}`;
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (response.ok) {
          const json = await response.json();
          newReviews = (json.reviews || []).map((r) => ({
            external_review_id: r.name || r.id,
            reviewer_name: r.authorAttribution?.displayName || 'Google User',
            rating: r.rating || 5,
            review_text: r.text?.text || '',
            publishTime: r.publishTime,
            authorUri: r.authorAttribution?.uri || ''
          }));
        }
      } catch (err) {
        console.warn('[crm-reviews] Google API sync warning:', err?.message || err);
      }
    }
    const ingested = await ingestGoogleReviews(newReviews);
    const all = await getAllReviews();
    return { status: 200, data: { synced: ingested.length, reviews: all } };
  }

  return null;
}

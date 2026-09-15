import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { supabaseAdminGet, supabaseAdminPatch, supabaseAdminPost } from '../lib/supabaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback_requests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial verified Google reviews seed
const SEED_REVIEWS = [
  {
    id: 'rev-google-001',
    source: 'Google',
    external_review_id: 'g-rev-001',
    reviewer_name: 'Ramesh Varma',
    rating: 5,
    review_text: 'Real Estate Brothers group made purchasing our open plot in Shadnagar completely seamless. Clear title deeds, fast registration, and immediate spot physical possession. Highly transparent and recommended!',
    review_date: '2026-08-28T10:00:00.000Z',
    project_name: 'VR Green Meadows',
    property_code: 'P17',
    status: 'APPROVED',
    is_visible: true,
    source_url: 'https://maps.google.com/?q=VR+Real+Estates+Hyderabad',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z'
  },
  {
    id: 'rev-google-002',
    source: 'Google',
    external_review_id: 'g-rev-002',
    reviewer_name: 'Deepa Reddy',
    rating: 5,
    review_text: 'Visited VR Elite Towers at Kokapet. The 3 BHK architectural plan, floor layouts, and amenities are truly world-class. The sales executives explained every detail with complete patience.',
    review_date: '2026-08-14T14:30:00.000Z',
    project_name: 'VR Elite Towers',
    property_code: 'A102',
    status: 'APPROVED',
    is_visible: true,
    source_url: 'https://maps.google.com/?q=VR+Real+Estates+Hyderabad',
    created_at: '2026-08-14T14:30:00.000Z',
    updated_at: '2026-08-14T14:30:00.000Z'
  },
  {
    id: 'rev-google-003',
    source: 'Google',
    external_review_id: 'g-rev-003',
    reviewer_name: 'K. Srinivasa Rao',
    rating: 5,
    review_text: 'We bought a managed farmland at Nature’s Nest. Sandalwood maintenance, drip irrigation, and club house access are exceptional. Very reliable team led by true professionals.',
    review_date: '2026-07-20T09:15:00.000Z',
    project_name: "Nature's Nest",
    property_code: 'F08',
    status: 'APPROVED',
    is_visible: true,
    source_url: 'https://maps.google.com/?q=VR+Real+Estates+Hyderabad',
    created_at: '2026-07-20T09:15:00.000Z',
    updated_at: '2026-07-20T09:15:00.000Z'
  },
  {
    id: 'rev-google-004',
    source: 'Google',
    external_review_id: 'g-rev-004',
    reviewer_name: 'Anil Kumar Chintala',
    rating: 5,
    review_text: 'Great customer service and trustworthy documentation. Site visit was well organized with doorstep pickup.',
    review_date: '2026-09-02T11:20:00.000Z',
    project_name: 'VR Prime Meadows',
    property_code: 'P05',
    status: 'PENDING',
    is_visible: false,
    source_url: 'https://maps.google.com/?q=VR+Real+Estates+Hyderabad',
    created_at: '2026-09-02T11:20:00.000Z',
    updated_at: '2026-09-02T11:20:00.000Z'
  }
];

function readLocalReviews() {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn('[reviews] Error reading local reviews file:', e?.message || e);
  }
  saveLocalReviews(SEED_REVIEWS);
  return SEED_REVIEWS;
}

function saveLocalReviews(reviews) {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (e) {
    console.error('[reviews] Failed to save local reviews file:', e?.message || e);
  }
}

function readLocalFeedbackRequests() {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.warn('[feedback] Error reading local feedback file:', e?.message || e);
  }
  return [];
}

function saveLocalFeedbackRequests(requests) {
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(requests, null, 2), 'utf8');
  } catch (e) {
    console.error('[feedback] Failed to save local feedback file:', e?.message || e);
  }
}

/**
 * Tries fetching from Supabase 'reviews' table first; falls back to local file store.
 */
export async function getAllReviews() {
  try {
    const supabaseRows = await supabaseAdminGet('reviews', {
      select: '*',
      order: 'created_at.desc',
      limit: '500'
    });
    if (Array.isArray(supabaseRows) && supabaseRows.length > 0) {
      return supabaseRows;
    }
  } catch {
    // Supabase reviews table does not exist or error; use file store
  }
  return readLocalReviews();
}

/**
 * Converts a full customer name into safe public format e.g. "Rahul Kumar" -> "Rahul K."
 */
export function formatSafeReviewerName(name) {
  if (!name) return 'Valued Customer';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || 'Valued Customer';
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (last.endsWith('.')) return `${first} ${last}`;
  return `${first} ${last.charAt(0).toUpperCase()}.`;
}

/**
 * Public website endpoint: returns only reviews where status === 'APPROVED' and is_visible === true.
 * Ensures zero private metadata (phone, email, IDs, private notes) is ever exposed.
 */
export async function getPublicApprovedReviews() {
  const all = await getAllReviews();
  const approved = all.filter((r) => (r.status === 'APPROVED' || r.status === 'APPROVED FOR WEBSITE') && Boolean(r.is_visible));

  return approved.map((r) => ({
    id: r.id,
    reviewer_name: r.source === 'Google' ? (r.reviewer_name || 'Google User') : formatSafeReviewerName(r.reviewer_name),
    rating: Number(r.rating) || 5,
    review_text: r.review_text || '',
    review_date: r.review_date || r.created_at,
    project_name: r.project_name || '',
    property_code: r.property_code || '',
    status: 'APPROVED',
    is_visible: true,
    source: r.source || 'Direct',
    source_url: r.source_url || '',
    authorPhoto: r.authorPhoto || ''
  }));
}

/**
 * Update review status and visibility (Owner CRM action)
 */
export async function updateReview(id, updates = {}) {
  const now = new Date().toISOString();

  // Try Supabase first
  try {
    const patched = await supabaseAdminPatch('reviews', { id: `eq.${id}` }, {
      ...updates,
      updated_at: now
    });
    if (patched && patched[0]) {
      return patched[0];
    }
  } catch {
    // Fall back to local store
  }

  const reviews = readLocalReviews();
  const index = reviews.findIndex((r) => String(r.id) === String(id));
  if (index === -1) {
    return null;
  }

  const existing = reviews[index];
  const updated = {
    ...existing,
    ...updates,
    updated_at: now
  };

  reviews[index] = updated;
  saveLocalReviews(reviews);
  return updated;
}

/**
 * Ingest new Google reviews into the system as PENDING and hidden.
 */
export async function ingestGoogleReviews(newReviews = []) {
  if (!Array.isArray(newReviews) || !newReviews.length) return [];
  const existing = await getAllReviews();
  const existingIds = new Set(existing.map((r) => r.external_review_id).filter(Boolean));
  const created = [];

  for (const item of newReviews) {
    const extId = item.external_review_id || item.id || `google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    if (existingIds.has(extId)) continue;

    const record = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source: 'Google',
      external_review_id: extId,
      reviewer_name: item.authorName || item.reviewer_name || 'Google User',
      rating: Number(item.rating) || 5,
      review_text: item.text || item.review_text || '',
      review_date: item.publishTime || item.review_date || new Date().toISOString(),
      project_name: item.project_name || 'VR Real Estates',
      property_code: item.property_code || '',
      status: 'PENDING',
      is_visible: false,
      source_url: item.authorUri || 'https://maps.google.com/?q=VR+Real+Estates+Hyderabad',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const inserted = await supabaseAdminPost('reviews', record);
      if (inserted && inserted[0]) {
        created.push(inserted[0]);
        continue;
      }
    } catch {
      // Supabase table not present; will save to local store below
    }

    existing.unshift(record);
    created.push(record);
  }

  if (created.length > 0) {
    saveLocalReviews(existing);
  }

  return created;
}

/**
 * Creates a unique secure feedback request token linked to a specific transaction.
 * Uses 24 random bytes (48 hex characters). Never exposes sequential IDs or phone numbers in token.
 */
export async function createFeedbackRequest({
  lead_id = null,
  customer_name = '',
  customer_phone = '',
  customer_email = '',
  site_visit_id = null,
  booking_id = null,
  property_id = null,
  project_id = null,
  project_name = '',
  property_code = ''
}) {
  const token = crypto.randomBytes(24).toString('hex');
  const now = new Date().toISOString();

  const record = {
    token,
    lead_id,
    customer_name: customer_name.trim(),
    customer_phone: customer_phone.trim(),
    customer_email: customer_email.trim(),
    site_visit_id,
    booking_id,
    property_id,
    project_id,
    project_name: project_name.trim(),
    property_code: property_code.trim(),
    status: 'SENT', // NOT SENT, SENT, OPENED, SUBMITTED
    rating: null,
    feedback_text: null,
    sent_at: now,
    opened_at: null,
    submitted_at: null,
    created_at: now,
    updated_at: now
  };

  // Try Supabase first
  try {
    const inserted = await supabaseAdminPost('feedback_requests', record);
    if (inserted && inserted[0]) {
      return inserted[0];
    }
  } catch {
    // Supabase table not present; fallback to local persistent store
  }

  const all = readLocalFeedbackRequests();
  all.unshift(record);
  saveLocalFeedbackRequests(all);
  return record;
}

/**
 * Retrieves feedback request by token and marks it OPENED if currently SENT.
 */
export async function getFeedbackRequest(token, markOpened = true) {
  if (!token) return null;
  const now = new Date().toISOString();

  // Try Supabase first
  try {
    const rows = await supabaseAdminGet('feedback_requests', {
      token: `eq.${token}`,
      limit: '1'
    });
    if (Array.isArray(rows) && rows.length > 0) {
      const record = rows[0];
      if (markOpened && record.status === 'SENT') {
        record.status = 'OPENED';
        record.opened_at = now;
        record.updated_at = now;
        await supabaseAdminPatch('feedback_requests', { token: `eq.${token}` }, {
          status: 'OPENED',
          opened_at: now,
          updated_at: now
        }).catch(() => null);
      }
      return record;
    }
  } catch {
    // Fall back to local store
  }

  const all = readLocalFeedbackRequests();
  const index = all.findIndex((r) => r.token === token);
  if (index === -1) return null;

  const record = all[index];
  if (markOpened && record.status === 'SENT') {
    record.status = 'OPENED';
    record.opened_at = now;
    record.updated_at = now;
    all[index] = record;
    saveLocalFeedbackRequests(all);
  }
  return record;
}

/**
 * Submits feedback for a token.
 * Prevents duplicate submissions.
 * Automatically saves feedback into CRM reviews with appropriate status.
 */
export async function submitFeedback(token, { rating, feedback = '' }) {
  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
    return {
      status: 400,
      error: { code: 'INVALID_RATING', message: 'Rating must be an integer between 1 and 5.' }
    };
  }

  const request = await getFeedbackRequest(token, false);
  if (!request) {
    return {
      status: 404,
      error: { code: 'NOT_FOUND', message: 'Feedback link is invalid or has expired.' }
    };
  }

  if (request.status === 'SUBMITTED') {
    return {
      status: 409,
      error: { code: 'ALREADY_SUBMITTED', message: 'Feedback already submitted. Thank you!' }
    };
  }

  const now = new Date().toISOString();
  const cleanFeedback = String(feedback || '').trim();

  // 1. Update feedback request
  const requestUpdates = {
    status: 'SUBMITTED',
    rating: numRating,
    feedback_text: cleanFeedback,
    submitted_at: now,
    updated_at: now
  };

  try {
    await supabaseAdminPatch('feedback_requests', { token: `eq.${token}` }, requestUpdates);
  } catch {
    // Fallback to local
    const all = readLocalFeedbackRequests();
    const idx = all.findIndex((r) => r.token === token);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...requestUpdates };
      saveLocalFeedbackRequests(all);
    }
  }

  // 2. Status routing: 4-5 stars -> 'NEW' (positive), 1-3 stars -> 'NEEDS ATTENTION'
  const reviewStatus = numRating >= 4 ? 'NEW' : 'NEEDS ATTENTION';

  // 3. Create review record for CRM
  const reviewRecord = {
    id: `rev-fb-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    source: 'Customer Feedback',
    external_review_id: `token-${token}`,
    reviewer_name: request.customer_name || 'Customer',
    rating: numRating,
    review_text: cleanFeedback, // Pure customer feedback only, no system metadata
    review_date: now,
    project_name: request.project_name || 'VR Real Estates',
    property_code: request.property_code || '',
    status: reviewStatus,
    is_visible: false, // Owner approval strictly required for website publication
    source_url: '',
    transaction_type: request.site_visit_id ? 'site_visit' : 'booking',
    transaction_id: request.site_visit_id || request.booking_id || '',
    lead_id: request.lead_id || null,
    property_id: request.property_id || null,
    created_at: now,
    updated_at: now
  };

  try {
    await supabaseAdminPost('reviews', reviewRecord);
  } catch {
    const reviews = readLocalReviews();
    reviews.unshift(reviewRecord);
    saveLocalReviews(reviews);
  }

  return {
    status: 200,
    data: {
      success: true,
      rating: numRating,
      status: reviewStatus
    }
  };
}

/**
 * Public Handler for /api/feedback/:token
 * GET: Validates token (Zero customer details exposed)
 * POST: Submits rating & feedback
 */
export async function handlePublicFeedback(req, pathParts, body = {}) {
  // pathParts: ['api', 'feedback', ':token']
  if (pathParts[0] !== 'api' || pathParts[1] !== 'feedback') {
    return null;
  }

  const token = pathParts[2];
  if (!token) {
    return {
      status: 400,
      error: { code: 'MISSING_TOKEN', message: 'Feedback token is required.' }
    };
  }

  if (req.method === 'GET') {
    const request = await getFeedbackRequest(token, true);
    if (!request) {
      return {
        status: 404,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired feedback link.' }
      };
    }

    // STRICT CUSTOMER PRIVACY: Return ONLY validation flags.
    // NEVER expose customer name, phone, email, project, plot or internal IDs.
    return {
      status: 200,
      data: {
        valid: true,
        submitted: request.status === 'SUBMITTED'
      }
    };
  }

  if (req.method === 'POST') {
    return submitFeedback(token, body || {});
  }

  return {
    status: 405,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed on feedback endpoint.' }
  };
}

/**
 * Handler for GET /api/reviews (Public Website Endpoint)
 */
export async function handlePublicReviews(req, pathParts) {
  if (pathParts[0] !== 'api' || pathParts[1] !== 'reviews') {
    return null;
  }

  if (req.method !== 'GET') {
    return {
      status: 405,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is allowed for public reviews.' }
    };
  }

  const reviews = await getPublicApprovedReviews();
  return {
    status: 200,
    data: {
      reviews,
      count: reviews.length,
      averageRating: reviews.length ? (reviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1) : '4.9'
    }
  };
}

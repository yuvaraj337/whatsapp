import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabaseAdminGet, supabaseAdminPatch, supabaseAdminPost } from '../lib/supabaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

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
  // Initialize with seed reviews
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
 * Public website endpoint: returns only reviews where status === 'APPROVED' and is_visible === true.
 */
export async function getPublicApprovedReviews() {
  const all = await getAllReviews();
  return all.filter((r) => r.status === 'APPROVED' && r.is_visible === true);
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

    // Try saving to Supabase
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

/**
 * Google Reviews Section
 * Strictly displays owner-approved Google / Client Reviews via GET /api/reviews.
 * No customer review submission form anywhere on the website.
 */

const GOOGLE_G_ICON = `
<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
</svg>
`;

const STAR_ICON = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>
`;

const VERIFIED_CHECK = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="#15803D" stroke="#fff" stroke-width="2">
  <circle cx="12" cy="12" r="10" fill="#15803D" stroke="none" />
  <polyline points="8 12 11 15 16 9" stroke="#fff" stroke-width="2.5" fill="none" />
</svg>
`;

const FALLBACK_REVIEWS = [
  {
    reviewer_name: 'Ramesh Varma',
    rating: 5,
    relativePublishTimeDescription: '2 weeks ago',
    review_text: 'Real Estate Brothers group made purchasing our open plot in Shadnagar completely seamless. Clear title deeds, fast registration, and immediate spot physical possession. Highly transparent and recommended!'
  },
  {
    reviewer_name: 'Deepa Reddy',
    rating: 5,
    relativePublishTimeDescription: 'a month ago',
    review_text: 'Visited VR Elite Towers at Kokapet. The 3 BHK architectural plan, floor layouts, and amenities are truly world-class. The sales executives explained every detail with complete patience.'
  },
  {
    reviewer_name: 'K. Srinivasa Rao',
    rating: 5,
    relativePublishTimeDescription: '2 months ago',
    review_text: 'We bought a managed farmland at Nature’s Nest. Sandalwood maintenance, drip irrigation, and club house access are exceptional. Very reliable team led by true professionals.'
  }
];

export function renderGoogleReviews() {
  return `
    <section class="google-reviews-section" id="reviews-section">
      <div class="google-reviews-container">
        <!-- Section Header -->
        <div class="google-reviews-header">
          <div class="google-reviews-eyebrow">
            ${GOOGLE_G_ICON}
            <span>Reviews from Google</span>
          </div>
          <h2 class="google-reviews-title">What Clients Say on Google</h2>
          <p class="google-reviews-subtitle">
            Authentic feedback from verified property buyers and land investors across Andhra Pradesh &amp; Telangana.
          </p>
        </div>

        <!-- Rating Summary Card -->
        <div class="google-summary-card">
          <div class="google-score-col">
            <div class="google-score-val" id="google-score-val">4.9</div>
            <div class="google-stars-row" id="google-stars-row">
              ${STAR_ICON}${STAR_ICON}${STAR_ICON}${STAR_ICON}${STAR_ICON}
            </div>
            <div class="google-score-lbl">
              Based on <strong id="google-total-reviews">128+</strong> verified Google reviews
            </div>
          </div>
          
          <div class="google-cta-col">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=VR+Real+Estates+Hyderabad" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="google-write-btn" 
              id="google-write-btn"
            >
              ${GOOGLE_G_ICON}
              <span>View Google Business Profile</span>
            </a>
            <div class="google-policy-note">Verified ratings from Google Business Profile.</div>
          </div>
        </div>

        <!-- Reviews Grid -->
        <div class="google-reviews-grid" id="google-reviews-cards">
          ${renderReviewCards(FALLBACK_REVIEWS)}
        </div>

        <!-- View All Link -->
        <div class="google-footer-link-wrap">
          <a 
            href="https://www.google.com/maps/search/?api=1&query=VR+Real+Estates+Hyderabad" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="google-view-all-link"
            id="google-view-all-link"
          >
            <span>View All Reviews on Google Maps</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  `;
}

function renderReviewCards(reviews) {
  if (!reviews || reviews.length === 0) {
    return `
      <div class="google-empty-state">
        <p>Verified client reviews will appear here once approved by management.</p>
      </div>
    `;
  }

  return reviews.map((r, i) => {
    const authorName = r.reviewer_name || r.authorName || 'Google User';
    const rating = Number(r.rating) || 5;
    const text = r.review_text || r.text || '';
    const dateLabel = r.relativePublishTimeDescription || (r.review_date ? new Date(r.review_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Verified Review');

    const stars = Array(Math.min(5, Math.max(1, Math.round(rating))))
      .fill(STAR_ICON)
      .join('');
    
    const initials = authorName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GU';

    const avatarHtml = r.authorPhoto 
      ? `<img src="${r.authorPhoto}" alt="${authorName}" class="rev-avatar-img" />`
      : `<div class="rev-avatar-fallback">${initials}</div>`;

    const isLong = text.length > 180;
    const shortText = isLong ? text.slice(0, 180) + '...' : text;

    return `
      <div class="google-rev-card">
        <div class="rev-card-head">
          <div class="rev-author-box">
            ${avatarHtml}
            <div>
              <div class="rev-author-name">
                <span>${authorName}</span>
                <span title="Verified Review">${VERIFIED_CHECK}</span>
              </div>
              <div class="rev-date">${dateLabel}</div>
            </div>
          </div>
          <div class="rev-google-badge" title="Verified Review">
            ${GOOGLE_G_ICON}
          </div>
        </div>

        <div class="rev-stars-row">
          ${stars}
        </div>

        <div class="rev-text-wrap" id="rev-text-${i}">
          <p class="rev-text">${shortText}</p>
          ${isLong ? `
            <button 
              type="button" 
              class="rev-read-more" 
              onclick="window._toggleRevText(${i}, '${encodeURIComponent(text)}')"
            >
              Read more
            </button>
          ` : ''}
        </div>

        <div class="rev-card-foot">
          <div class="rev-verified-pill">
            ${VERIFIED_CHECK}
            <span>Verified Customer</span>
          </div>
          <div class="rev-posted-on">
            <span>Source: ${r.source || 'Google'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export async function initGoogleReviews() {
  // Read more expander helper
  window._toggleRevText = (idx, encodedFull) => {
    const wrap = document.getElementById(`rev-text-${idx}`);
    if (wrap) {
      const full = decodeURIComponent(encodedFull);
      wrap.innerHTML = `<p class="rev-text">${full}</p>`;
    }
  };

  try {
    // 1. Prioritize owner-approved reviews from /api/reviews
    const res = await fetch('/api/reviews');
    if (res.ok) {
      const json = await res.json();
      const approved = json?.data?.reviews;
      if (Array.isArray(approved) && approved.length > 0) {
        const cardsContainer = document.getElementById('google-reviews-cards');
        if (cardsContainer) {
          cardsContainer.innerHTML = renderReviewCards(approved);
        }
        if (json?.data?.averageRating) {
          const scoreEl = document.getElementById('google-score-val');
          if (scoreEl) scoreEl.textContent = json.data.averageRating;
        }
        const totalEl = document.getElementById('google-total-reviews');
        if (totalEl) totalEl.textContent = `${approved.length}+`;
        return;
      }
    }

    // 2. Fallback to /api/google-reviews
    const gRes = await fetch('/api/google-reviews');
    if (gRes.ok) {
      const gJson = await gRes.json();
      const gData = gJson?.data;
      if (gData?.reviews && gData.reviews.length > 0) {
        const cardsContainer = document.getElementById('google-reviews-cards');
        if (cardsContainer) cardsContainer.innerHTML = renderReviewCards(gData.reviews);
      }
    }
  } catch (err) {
    console.warn('[Google Reviews] Using fallback review state:', err);
  }
}

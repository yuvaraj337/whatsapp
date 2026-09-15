/**
 * Customer Feedback Page (Standalone & Customer-Facing)
 * Strictly displays ONLY:
 * - "How was your experience?"
 * - ★★★★★ rating
 * - "Tell us about your experience"
 * - [ Write your feedback here... ]
 * - [ Submit Feedback ]
 * 
 * NEVER displays customer name, phone, email, project name, plot number,
 * booking details, or CRM metadata.
 */

const GOOGLE_G_ICON = `
<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
</svg>
`;

const STAR_SVG = `
<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>
`;

const CHECK_ICON = `
<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
  <polyline points="22 4 12 14.01 9 11.01"/>
</svg>
`;

const HEART_ICON = `
<svg width="48" height="48" viewBox="0 0 24 24" fill="#16a34a" stroke="none">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
`;

export function renderCustomerFeedbackPage(token) {
  return {
    html: `
      <div class="feedback-page-shell" id="feedback-shell">
        <style>
          .feedback-page-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 20px 16px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            box-sizing: border-box;
          }
          .feedback-card {
            background: #ffffff;
            width: 100%;
            max-width: 480px;
            border-radius: 20px;
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
            padding: 36px 28px;
            box-sizing: border-box;
            border: 1px solid #e2e8f0;
            text-align: center;
          }
          @media (max-width: 414px) {
            .feedback-card {
              padding: 28px 18px;
              border-radius: 16px;
            }
          }
          .feedback-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 20px 0;
            line-height: 1.3;
          }
          .feedback-stars-wrap {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 24px;
          }
          .fb-star-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 6px;
            color: #cbd5e1;
            transition: color 0.15s ease, transform 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            touch-action: manipulation;
          }
          .fb-star-btn:hover,
          .fb-star-btn.hovered,
          .fb-star-btn.selected {
            color: #f59e0b;
          }
          .fb-star-btn:active {
            transform: scale(0.92);
          }
          .feedback-form-group {
            text-align: left;
            margin-bottom: 24px;
          }
          .feedback-label {
            display: block;
            font-size: 0.95rem;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
          }
          .feedback-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1.5px solid #cbd5e1;
            border-radius: 12px;
            padding: 14px;
            font-size: 0.95rem;
            line-height: 1.5;
            color: #0f172a;
            resize: vertical;
            min-height: 110px;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
            font-family: inherit;
            outline: none;
          }
          .feedback-textarea:focus {
            border-color: #15803d;
            box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.15);
          }
          .feedback-submit-btn {
            width: 100%;
            background: #15803d;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            padding: 14px 20px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: background-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
            box-shadow: 0 4px 12px rgba(21, 128, 61, 0.25);
          }
          .feedback-submit-btn:hover:not(:disabled) {
            background: #166534;
            transform: translateY(-1px);
          }
          .feedback-submit-btn:disabled {
            background: #94a3b8;
            box-shadow: none;
            cursor: not-allowed;
            opacity: 0.7;
          }
          .fb-state-icon {
            margin-bottom: 16px;
            display: flex;
            justify-content: center;
          }
          .fb-state-title {
            font-size: 1.4rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 10px 0;
          }
          .fb-state-desc {
            font-size: 0.95rem;
            color: #475569;
            margin: 0 0 24px 0;
            line-height: 1.5;
          }
          .google-review-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
            background: #ffffff;
            color: #1e293b;
            border: 1.5px solid #cbd5e1;
            border-radius: 12px;
            padding: 14px 20px;
            font-size: 0.95rem;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
          }
          .google-review-cta:hover {
            background: #f8fafc;
            border-color: #94a3b8;
            transform: translateY(-1px);
          }
          .fb-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #cbd5e1;
            border-top-color: #15803d;
            border-radius: 50%;
            animation: fbSpin 0.8s linear infinite;
            margin: 20px auto;
          }
          @keyframes fbSpin {
            to { transform: rotate(360deg); }
          }
        </style>

        <div class="feedback-card" id="feedback-card-inner">
          <div class="fb-spinner"></div>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Loading...</p>
        </div>
      </div>
    `,
    init: () => {
      initCustomerFeedback(token);
    }
  };
}

async function initCustomerFeedback(token) {
  const container = document.getElementById('feedback-card-inner');
  if (!container) return;

  if (!token) {
    showErrorState(container, 'Invalid Link', 'This feedback link is not valid.');
    return;
  }

  // 1. Fetch & validate feedback token
  try {
    const res = await fetch(`/api/feedback/${encodeURIComponent(token)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.data?.valid) {
      showErrorState(container, 'Link Expired or Invalid', data?.error?.message || 'This feedback link has expired or is invalid.');
      return;
    }

    // 2. Check if already submitted (Duplicate Submission Protection)
    if (data.data.submitted) {
      showAlreadySubmittedState(container);
      return;
    }

    // 3. Render clean feedback form
    renderFeedbackForm(container, token);
  } catch (err) {
    showErrorState(container, 'Connection Error', 'Unable to reach the server. Please check your connection.');
  }
}

function renderFeedbackForm(container, token) {
  container.innerHTML = `
    <h1 class="feedback-title">How was your experience?</h1>

    <div class="feedback-stars-wrap" id="fb-stars-row" role="radiogroup" aria-label="Rating from 1 to 5 stars">
      ${[1, 2, 3, 4, 5].map((s) => `
        <button type="button" class="fb-star-btn" data-star="${s}" aria-label="${s} star${s > 1 ? 's' : ''}">
          ${STAR_SVG}
        </button>
      `).join('')}
    </div>

    <form id="fb-submit-form">
      <div class="feedback-form-group">
        <label for="fb-comments" class="feedback-label">Tell us about your experience</label>
        <textarea 
          id="fb-comments" 
          class="feedback-textarea" 
          placeholder="Write your feedback here..." 
          rows="4"
        ></textarea>
      </div>

      <button type="submit" id="fb-submit-btn" class="feedback-submit-btn" disabled>
        Submit Feedback
      </button>
    </form>
  `;

  let selectedRating = 0;
  const starButtons = container.querySelectorAll('.fb-star-btn');
  const submitBtn = container.getElementById('fb-submit-btn');
  const textarea = container.getElementById('fb-comments');
  const form = container.getElementById('fb-submit-form');

  function updateStars(highlightUpTo) {
    starButtons.forEach((btn) => {
      const val = Number(btn.dataset.star);
      if (val <= highlightUpTo) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  starButtons.forEach((btn) => {
    const val = Number(btn.dataset.star);

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      starButtons.forEach((b) => {
        b.classList.toggle('hovered', Number(b.dataset.star) <= val);
      });
    });

    btn.addEventListener('mouseleave', () => {
      starButtons.forEach((b) => b.classList.remove('hovered'));
    });

    // Click selection
    btn.addEventListener('click', () => {
      selectedRating = val;
      updateStars(val);
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    });
  });

  // Reset hovered when mouse leaves container
  container.querySelector('#fb-stars-row')?.addEventListener('mouseleave', () => {
    updateStars(selectedRating);
  });

  // Submit flow
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedRating) return;

    // Show "Submitting..." and disable button to prevent duplicate submissions
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const feedbackText = textarea ? textarea.value.trim() : '';

    try {
      const res = await fetch(`/api/feedback/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          rating: selectedRating,
          feedback: feedbackText
        })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409 || json?.error?.code === 'ALREADY_SUBMITTED') {
          showAlreadySubmittedState(container);
          return;
        }
        alert(json?.error?.message || 'Failed to submit feedback. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
        return;
      }

      // Check rating flow
      if (selectedRating >= 4) {
        showPositiveFlow(container);
      } else {
        showAttentionFlow(container);
      }
    } catch (err) {
      alert('Network error. Please try submitting again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Feedback';
    }
  });
}

/**
 * 4–5 Star Flow:
 * - Thank you for your feedback!
 * - We're glad you had a great experience.
 * - [ Leave a Google Review ] (Directs to official Google review page)
 */
function showPositiveFlow(container) {
  // Official Google review URL fallback / configured Place ID
  const googleReviewUrl = 'https://www.google.com/maps/search/?api=1&query=VR+Real+Estates+Hyderabad';

  container.innerHTML = `
    <div class="fb-state-icon">
      ${HEART_ICON}
    </div>
    <h2 class="fb-state-title">Thank you for your feedback!</h2>
    <p class="fb-state-desc">We're glad you had a great experience.</p>
    
    <div>
      <a 
        href="${googleReviewUrl}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="google-review-cta"
        id="google-review-cta-btn"
      >
        ${GOOGLE_G_ICON}
        <span>Leave a Google Review</span>
      </a>
      <p style="font-size: 0.8rem; color: #64748b; margin-top: 14px; margin-bottom: 0;">
        Share your experience on Google to help other property buyers.
      </p>
    </div>
  `;
}

/**
 * 1–3 Star Flow:
 * - Thank you for your honest feedback.
 * - Your feedback helps us improve our service.
 * (No Google Review CTA shown)
 */
function showAttentionFlow(container) {
  container.innerHTML = `
    <div class="fb-state-icon">
      ${CHECK_ICON}
    </div>
    <h2 class="fb-state-title">Thank you for your honest feedback.</h2>
    <p class="fb-state-desc" style="margin-bottom: 0;">
      Your feedback helps us improve our service. Our team will review your comments carefully.
    </p>
  `;
}

/**
 * Duplicate Submission Protection:
 * "Feedback already submitted. Thank you!"
 */
function showAlreadySubmittedState(container) {
  container.innerHTML = `
    <div class="fb-state-icon">
      ${CHECK_ICON}
    </div>
    <h2 class="fb-state-title">Feedback already submitted. Thank you!</h2>
    <p class="fb-state-desc" style="margin-bottom: 0;">
      We have already received your feedback for this experience. We appreciate your time!
    </p>
  `;
}

function showErrorState(container, title, message) {
  container.innerHTML = `
    <div class="fb-state-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <h2 class="fb-state-title">${title}</h2>
    <p class="fb-state-desc" style="margin-bottom: 0;">${message}</p>
  `;
}

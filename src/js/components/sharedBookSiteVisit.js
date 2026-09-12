import { api } from '../api/client.js';
// Shared Book Site Visit & General Enquiry Flow Components
// Matching Reference Image #3 design system and decoupled for accurate property context

let currentPropertyContext = null;

export function setSharedProperty(prop) {
  currentPropertyContext = prop;
}

export function getSharedProperty() {
  return currentPropertyContext;
}

// --------------------------------------------------------------------------
// 1. SITE VISIT FLOW
// --------------------------------------------------------------------------
export function openSiteVisitFlow(customProp = null, startScreen = 'form') {
  if (customProp && !customProp.isManual) {
    currentPropertyContext = customProp;
  } else if (customProp?.isManual) {
    currentPropertyContext = null;
  }
  const prop = (customProp && !customProp.isManual) ? customProp : (customProp?.isManual ? { isManual: true } : currentPropertyContext);
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  // Render modal wrapper
  modalContainer.innerHTML = `
    <div class="sv-modal-overlay" id="sv-modal-overlay">
      <div class="sv-modal-dialog" id="sv-modal-dialog">
        <!-- Content will be rendered dynamically -->
        <div id="sv-flow-container"></div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('sv-modal-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeSiteVisitFlow();
    }
  });

  if (startScreen === 'details' && prop && !prop.isManual) {
    renderScreen1Details(prop);
  } else {
    renderScreen2Form(prop);
  }
}

export function closeSiteVisitFlow() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) modalContainer.innerHTML = '';
}

// Screen 1: Property Details (from Reference #3)
export function renderScreen1Details(prop) {
  const container = document.getElementById('sv-flow-container');
  if (!container || !prop) return;

  container.innerHTML = `
    <div class="sv-screen sv-screen-details">
      <!-- Mobile / Modal Top Header -->
      <div class="sv-top-header">
        <button type="button" class="sv-back-btn" onclick="window.closeSiteVisitFlow()">
          &larr; Back to ${prop.projectName || 'Project'}
        </button>
        <button type="button" class="sv-close-x" onclick="window.closeSiteVisitFlow()">&times;</button>
      </div>

      <!-- Main Property Image Showcase -->
      <div class="sv-hero-image-wrap">
        <img src="${prop.image || '/images/journey/gallery_entrance.jpg'}" alt="${prop.unitName || prop.projectName}" class="sv-hero-image" id="sv-main-view-img" />
        <span class="sv-image-counter">1/5</span>
        <button type="button" class="sv-fav-btn" aria-label="Save Property">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>

      <!-- Thumbnails Carousel Strip -->
      <div class="sv-thumbs-strip">
        <img src="${prop.thumb || '/images/journey/gallery_entrance.jpg'}" class="sv-thumb-img active" onclick="document.getElementById('sv-main-view-img').src=this.src" />
        <img src="/images/journey/gallery_clubhouse.jpg" class="sv-thumb-img" onclick="document.getElementById('sv-main-view-img').src=this.src" />
        <img src="/images/journey/gallery_park.jpg" class="sv-thumb-img" onclick="document.getElementById('sv-main-view-img').src=this.src" />
        <img src="/images/journey/gallery_play.jpg" class="sv-thumb-img" onclick="document.getElementById('sv-main-view-img').src=this.src" />
        <img src="/images/journey/gallery_roads.jpg" class="sv-thumb-img" onclick="document.getElementById('sv-main-view-img').src=this.src" />
      </div>

      <!-- Property Summary -->
      <div class="sv-details-body">
        <div class="sv-unit-header-row">
          <div>
            <h2 class="sv-unit-title">${prop.unitName || prop.projectName}</h2>
            <div class="sv-unit-loc">${prop.location || 'Hyderabad'}</div>
          </div>
          <span class="sv-badge-available">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            ${prop.status || 'Available'}
          </span>
        </div>

        <!-- Spec Tags Grid -->
        <div class="sv-specs-grid">
          ${prop.size ? `
          <div class="sv-spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
            <span>${prop.size}</span>
          </div>` : ''}
          ${prop.facing ? `
          <div class="sv-spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polygon points="12 3 14 10 21 12 14 14 12 21 10 14 3 12 10 10 12 3"/></svg>
            <span>${prop.facing}</span>
          </div>` : ''}
          ${prop.beds ? `
          <div class="sv-spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M2 14h20M4 10h16a2 2 0 0 1 2 2v2H2v-2a2 2 0 0 1 2-2zM6 4h12v6H6z"/></svg>
            <span>${prop.beds}</span>
          </div>` : ''}
        </div>

        <!-- Price -->
        ${prop.price ? `
        <div class="sv-price-row">
          <span class="sv-price-val">${prop.price}</span>
          ${prop.priceSub ? `<span class="sv-price-sub">${prop.priceSub}</span>` : ''}
        </div>` : ''}

        <!-- Actions -->
        <div class="sv-action-buttons">
          <button type="button" class="sv-btn-secondary" onclick="window.openGeneralEnquiry ? window.openGeneralEnquiry(window.getSharedProperty()) : window.closeSiteVisitFlow()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span>Send Enquiry</span>
          </button>
          
          <button type="button" class="sv-btn-primary" onclick="window.renderScreen2Form()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Book Site Visit</span>
          </button>

          <a href="https://maps.google.com/?q=${encodeURIComponent(prop.location || 'Hyderabad')}" target="_blank" rel="noopener" class="sv-btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>View on Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

// Screen 2: Book a Site Visit Form (Matching Reference #3)
export function renderScreen2Form(customProp = null) {
  const isManual = customProp?.isManual || (!customProp && !currentPropertyContext) || currentPropertyContext?.isManual;
  const prop = (!isManual && (customProp || currentPropertyContext)) ? (customProp || currentPropertyContext) : null;
  const container = document.getElementById('sv-flow-container');
  if (!container) return;

  const today = new Date();
  const defaultDateStr = today.toISOString().split('T')[0];

  container.innerHTML = `
    <div class="sv-screen sv-screen-form">
      <div class="sv-top-header">
        <button type="button" class="sv-back-btn" onclick="window.closeSiteVisitFlow()">
          &larr; Back
        </button>
        <button type="button" class="sv-close-x" onclick="window.closeSiteVisitFlow()">&times;</button>
      </div>

      <div class="sv-form-wrapper">
        <h2 class="sv-form-title">Book a Free Site Visit</h2>
        <p class="sv-form-subtitle">
          Share your details and preferred date.<br/>Our team will arrange a guided tour with optional complimentary pickup.
        </p>

        <!-- Selected Property Card (if opened from a specific property/plot) -->
        ${prop ? `
        <div class="sv-property-preview-card">
          <div class="sv-prev-label">Selected Property</div>
          <div class="sv-prev-content">
            <img src="${prop.thumb || prop.image || '/images/journey/gallery_entrance.jpg'}" alt="${prop.projectName || 'Property'}" class="sv-prev-thumb" />
            <div class="sv-prev-info">
              <div class="sv-prev-name">${prop.projectName || 'VR Real Estates'}</div>
              <div class="sv-prev-unit">${prop.unitName || 'Selected Unit'}</div>
              <div class="sv-prev-loc">${prop.location || 'Hyderabad'}</div>
              ${prop.price ? `<div class="sv-prev-price">${prop.price}</div>` : ''}
            </div>
          </div>
        </div>
        ` : `
        <!-- Manual Property Details Section (when opened from AI Assistant or general flow) -->
        <div class="sv-property-preview-card sv-manual-prop-card" style="display: block; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 14px 16px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span class="sv-prev-label" style="margin: 0; font-size: 0.76rem; font-weight: 700; color: #15803D; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Property Details
            </span>
            <span style="font-size: 0.72rem; color: #64748B; font-weight: 600; background: #E2E8F0; padding: 2px 8px; border-radius: 12px;">Manual Entry</span>
          </div>

          <div class="sv-input-group" style="margin-bottom: 10px;">
            <label class="sv-label" for="sv-input-project" style="font-size: 0.8rem; margin-bottom: 4px;">Project / Community *</label>
            <div class="sv-select-wrap">
              <select id="sv-input-project" class="sv-select" required>
                <option value="VR Green Meadows (Open Plots - Shadnagar)" selected>VR Green Meadows (Open Plots - Shadnagar)</option>
                <option value="VR Silicon Valley (Luxury Villas - Gachibowli)">VR Silicon Valley (Luxury Villas - Gachibowli)</option>
                <option value="VR Elite Towers (High-Rise Apartments - Kokapet)">VR Elite Towers (High-Rise Apartments - Kokapet)</option>
                <option value="VR Green Acres (Managed Farmlands - Chevella)">VR Green Acres (Managed Farmlands - Chevella)</option>
                <option value="General Open Plots Site Visit">General Open Plots Site Visit</option>
                <option value="Other Project / Venture">Other Project / Custom Location</option>
              </select>
            </div>
          </div>

          <div class="sv-input-group" id="sv-custom-project-wrap" style="display: none; margin-bottom: 10px;">
            <label class="sv-label" for="sv-input-custom-project" style="font-size: 0.8rem; margin-bottom: 4px;">Custom Project / Location Name *</label>
            <input type="text" id="sv-input-custom-project" class="sv-input" placeholder="e.g. Shadnagar Highway Venture Phase 2" />
            <span class="sv-error-msg" id="err-custom-project" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group" style="margin-bottom: 2px;">
            <label class="sv-label" for="sv-input-plot-details" style="font-size: 0.8rem; margin-bottom: 4px;">Plot / Unit Details (Plot No, Size, Facing) *</label>
            <input type="text" id="sv-input-plot-details" class="sv-input" placeholder="e.g. Plot #104, 200 Sq.Yds, East Facing" required />
            <span class="sv-error-msg" id="err-plot-details" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>
        </div>
        `}

        <!-- Form Fields with Strict Validation -->
        <form id="sv-booking-form" class="sv-form-body">
          <div class="sv-input-group">
            <label class="sv-label" for="sv-input-name">Full Name *</label>
            <input type="text" id="sv-input-name" class="sv-input" placeholder="e.g. Siva Prasad" required />
            <span class="sv-error-msg" id="err-name" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="sv-input-mobile">Mobile Number *</label>
            <input type="tel" id="sv-input-mobile" class="sv-input" placeholder="10-digit mobile number" maxlength="10" required />
            <span class="sv-error-msg" id="err-mobile" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="sv-input-email">Email (Optional)</label>
            <input type="email" id="sv-input-email" class="sv-input" placeholder="name@example.com" />
            <span class="sv-error-msg" id="err-email" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="sv-input-date">Preferred Date *</label>
            <input type="date" id="sv-input-date" class="sv-input" value="${defaultDateStr}" min="${defaultDateStr}" required />
            <span class="sv-error-msg" id="err-date" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="sv-input-time">Preferred Time Slot *</label>
            <div class="sv-select-wrap">
              <select id="sv-input-time" class="sv-select" required>
                <option value="10:00 AM - 12:00 PM" selected>10:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
              </select>
            </div>
            <span class="sv-error-msg" id="err-time" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="sv-input-transport">Transportation Preference</label>
            <div class="sv-select-wrap">
              <select id="sv-input-transport" class="sv-select">
                <option value="Self Vehicle" selected>Self Vehicle (Meet at Site)</option>
                <option value="Company Cab Pickup">Request Free Company Pickup (Hyderabad)</option>
              </select>
            </div>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="sv-input-msg">Any Message (Optional)</label>
            <textarea id="sv-input-msg" class="sv-textarea" rows="2" placeholder="e.g. Visiting with family on Sunday morning."></textarea>
          </div>

          <button type="submit" class="sv-submit-btn" id="sv-submit-btn">
            Confirm Site Visit Request
          </button>
        </form>
      </div>
    </div>
  `;

  // Dynamic Custom Project Toggle
  const projectSelect = document.getElementById('sv-input-project');
  const customProjectWrap = document.getElementById('sv-custom-project-wrap');
  if (projectSelect && customProjectWrap) {
    projectSelect.addEventListener('change', () => {
      if (projectSelect.value === 'Other Project / Venture') {
        customProjectWrap.style.display = 'block';
        document.getElementById('sv-input-custom-project')?.focus();
      } else {
        customProjectWrap.style.display = 'none';
      }
    });
  }

  // Attach Form Submit Handler
  const form = document.getElementById('sv-booking-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('sv-input-name').value.trim();
    const mobile = document.getElementById('sv-input-mobile').value.trim();
    const email = document.getElementById('sv-input-email').value.trim();
    const date = document.getElementById('sv-input-date').value;
    const time = document.getElementById('sv-input-time').value;
    const transport = document.getElementById('sv-input-transport')?.value || 'Self Vehicle';
    const message = document.getElementById('sv-input-msg')?.value?.trim() || '';

    let hasError = false;

    let chosenProject = prop?.projectName || '';
    let propertyDetails = prop?.unitName || '';

    if (!prop) {
      const projVal = document.getElementById('sv-input-project')?.value || 'VR Green Meadows (Open Plots - Shadnagar)';
      if (projVal === 'Other Project / Venture') {
        const customProj = document.getElementById('sv-input-custom-project')?.value?.trim();
        if (!customProj) {
          const errCustom = document.getElementById('err-custom-project');
          if (errCustom) errCustom.textContent = 'Please enter project / location name';
          hasError = true;
        } else {
          const errCustom = document.getElementById('err-custom-project');
          if (errCustom) errCustom.textContent = '';
          chosenProject = customProj;
        }
      } else {
        chosenProject = projVal;
      }

      const plotInput = document.getElementById('sv-input-plot-details');
      propertyDetails = plotInput?.value?.trim() || '';
      if (!propertyDetails) {
        const errPlot = document.getElementById('err-plot-details');
        if (errPlot) errPlot.textContent = 'Please enter plot / property details (e.g. Plot No, Size, Facing)';
        hasError = true;
      } else {
        const errPlot = document.getElementById('err-plot-details');
        if (errPlot) errPlot.textContent = '';
      }
    }

    if (!name || name.length < 2) {
      document.getElementById('err-name').textContent = 'Please enter your full name';
      hasError = true;
    } else {
      document.getElementById('err-name').textContent = '';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobile)) {
      document.getElementById('err-mobile').textContent = 'Please enter a valid 10-digit mobile number';
      hasError = true;
    } else {
      document.getElementById('err-mobile').textContent = '';
    }

    if (!date) {
      document.getElementById('err-date').textContent = 'Please choose a preferred visit date';
      hasError = true;
    } else {
      document.getElementById('err-date').textContent = '';
    }

    if (hasError) return;

    const submitBtn = document.getElementById('sv-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';
    }

    let whatsappSent = false;
    let bookingReference = '';

    try {
      const res = await api.createBooking({
        name,
        phone: mobile,
        email,
        date,
        time,
        projectName: chosenProject || 'VR Green Meadows (Open Plots - Shadnagar)',
        unitName: propertyDetails,
        propertyId: prop?.id || null,
        message: `${message}${propertyDetails && !prop ? ` | Property Details: ${propertyDetails}` : ''} | Transport: ${transport}`
      });

      if (res?.customerNotification?.sent) {
        whatsappSent = true;
      }
      bookingReference = res?.reference || '';
    } catch (apiErr) {
      console.warn('[booking] API notification warning:', apiErr?.message || apiErr);
    }

    // Transition to Screen 3: Success Confirmation
    renderScreen3Success({
      ...(prop || {}),
      projectName: chosenProject || 'VR Green Meadows (Open Plots - Shadnagar)',
      unitName: propertyDetails,
      location: prop?.location || (chosenProject.includes('Shadnagar') ? 'Shadnagar, Hyderabad' : (chosenProject.includes('Gachibowli') ? 'Gachibowli, Hyderabad' : (chosenProject.includes('Kokapet') ? 'Kokapet, Hyderabad' : 'Hyderabad'))),
      customerName: name,
      customerMobile: mobile,
      customerEmail: email,
      visitDate: date,
      visitTime: time,
      whatsappSent,
      bookingReference
    });
  });
}

// Screen 3: Site Visit Request Submitted Success
export function renderScreen3Success(submissionData) {
  const container = document.getElementById('sv-flow-container');
  if (!container) return;

  container.innerHTML = `
    <div class="sv-screen sv-screen-success">
      <div class="sv-top-header">
        <button type="button" class="sv-close-x right-only" onclick="window.closeSiteVisitFlow()">&times;</button>
      </div>

      <div class="sv-success-content">
        <!-- Big Green Success Icon -->
        <div class="sv-success-icon-wrap">
          <div class="sv-green-circle">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <h2 class="sv-success-title">Site Visit Request Submitted!</h2>
        
        <p class="sv-success-msg">
          ${submissionData.whatsappSent
            ? `Thank you, <strong>${submissionData.customerName || 'Valued Buyer'}</strong>!<br/>Your site visit request has been confirmed. <strong>A confirmation message has been sent to your WhatsApp number.</strong>`
            : `Thank you, <strong>${submissionData.customerName || 'Valued Buyer'}</strong>!<br/>Your site visit request for <strong>${submissionData.projectName || 'VR Real Estates'}</strong> has been received.<br/>Our management team will review your preferred date/time and <strong>you will receive a WhatsApp confirmation</strong> at <strong>${submissionData.customerMobile}</strong> once confirmed.`}
        </p>
        ${submissionData.bookingReference ? `<div style="margin: -10px 0 15px 0; font-size: 13px; color: #64748b; font-weight: 500;">Booking Reference: <strong>${submissionData.bookingReference}</strong></div>` : ''}

        <!-- Selected Property Card (if available) -->
        ${submissionData.unitName ? `
        <div class="sv-property-preview-card success-card">
          <div class="sv-prev-label">Requested Property Details</div>
          <div class="sv-prev-content">
            <img src="${submissionData.thumb || submissionData.image || '/images/journey/gallery_entrance.jpg'}" alt="${submissionData.projectName}" class="sv-prev-thumb" />
            <div class="sv-prev-info">
              <div class="sv-prev-name">${submissionData.projectName}</div>
              <div class="sv-prev-unit">${submissionData.unitName}</div>
              <div class="sv-prev-loc">${submissionData.location || 'Hyderabad'}</div>
              ${submissionData.price ? `<div class="sv-prev-price">${submissionData.price}</div>` : ''}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- What Happens Next 3-Step Guide -->
        <div class="sv-next-steps-card">
          <h3 class="sv-next-title">What happens next?</h3>
          
          <div class="sv-step-row">
            <div class="sv-step-badge">1</div>
            <div class="sv-step-desc">Our management team reviews and confirms your visit date (${submissionData.visitDate || 'Selected Day'}) and time slot.</div>
          </div>

          <div class="sv-step-row">
            <div class="sv-step-badge">2</div>
            <div class="sv-step-desc">You'll receive site visit confirmation, location pin, and executive contact details via WhatsApp.</div>
          </div>

          <div class="sv-step-row">
            <div class="sv-step-badge">3</div>
            <div class="sv-step-desc">Enjoy a dedicated guided walkthrough and complete legal title review on-site.</div>
          </div>
        </div>

        <button type="button" class="sv-back-project-btn" onclick="window.closeSiteVisitFlow()">
          Return to Site
        </button>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 2. GENERAL ENQUIRY FLOW (Decoupled from hardcoded apartment defaults)
// --------------------------------------------------------------------------
export function openGeneralEnquiry(context = null) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="sv-modal-overlay" id="sv-modal-overlay">
      <div class="sv-modal-dialog" id="sv-modal-dialog">
        <div id="sv-flow-container"></div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('sv-modal-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeSiteVisitFlow();
    }
  });

  renderEnquiryForm(context);
}

export function renderEnquiryForm(context = null) {
  const container = document.getElementById('sv-flow-container');
  if (!container) return;

  const projectOptions = [
    { value: 'VR Green Meadows (Open Plots - Shadnagar)', label: 'VR Green Meadows (Open Plots - Shadnagar)' },
    { value: 'VR Silicon Valley (Luxury Villas - Gachibowli)', label: 'VR Silicon Valley (Luxury Villas - Gachibowli)' },
    { value: 'VR Elite Towers (High-Rise Apartments - Kokapet)', label: 'VR Elite Towers (High-Rise Apartments - Kokapet)' },
    { value: 'VR Green Acres (Managed Farmlands - Chevella)', label: 'VR Green Acres (Managed Farmlands - Chevella)' },
    { value: 'General Consultation / Advisory', label: 'General Consultation / Advisory' }
  ];

  container.innerHTML = `
    <div class="sv-screen sv-screen-form">
      <div class="sv-top-header">
        <span style="font-weight: 700; color: #1A3B2B; font-size: 0.95rem;">Property Enquiry</span>
        <button type="button" class="sv-close-x" onclick="window.closeSiteVisitFlow()">&times;</button>
      </div>

      <div class="sv-form-wrapper">
        <h2 class="sv-form-title">Send Us an Enquiry</h2>
        <p class="sv-form-subtitle">
          Connect with our property specialists for pricing, unit availability, brochures, and master plan details.
        </p>

        <!-- Contextual Card if opened for a specific unit/plot -->
        ${context ? `
        <div class="sv-property-preview-card">
          <div class="sv-prev-label">Enquiring For</div>
          <div class="sv-prev-content">
            <img src="${context.thumb || context.image || '/images/journey/gallery_entrance.jpg'}" alt="${context.projectName || 'Property'}" class="sv-prev-thumb" />
            <div class="sv-prev-info">
              <div class="sv-prev-name">${context.projectName || 'VR Real Estates'}</div>
              <div class="sv-prev-unit">${context.unitName || 'Unit Selection'}</div>
              <div class="sv-prev-loc">${context.location || 'Hyderabad'}</div>
              ${context.price ? `<div class="sv-prev-price">${context.price}</div>` : ''}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Form -->
        <form id="sv-enquiry-form" class="sv-form-body">
          <div class="sv-input-group">
            <label class="sv-label" for="enq-input-name">Full Name *</label>
            <input type="text" id="enq-input-name" class="sv-input" placeholder="e.g. Siva Prasad" required />
            <span class="sv-error-msg" id="err-enq-name" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="enq-input-mobile">Mobile Number *</label>
            <input type="tel" id="enq-input-mobile" class="sv-input" placeholder="10-digit mobile number" maxlength="10" required />
            <span class="sv-error-msg" id="err-enq-mobile" style="color: #DC2626; font-size: 0.76rem;"></span>
          </div>

          <div class="sv-input-group">
            <label class="sv-label" for="enq-input-email">Email Address (Optional)</label>
            <input type="email" id="enq-input-email" class="sv-input" placeholder="name@example.com" />
          </div>

          ${!context ? `
          <div class="sv-input-group">
            <label class="sv-label" for="enq-input-project">Interested Property Type / Project *</label>
            <div class="sv-select-wrap">
              <select id="enq-input-project" class="sv-select" required>
                ${projectOptions.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
              </select>
            </div>
          </div>
          ` : ''}

          <div class="sv-input-group">
            <label class="sv-label" for="enq-input-msg">Message / Questions</label>
            <textarea id="enq-input-msg" class="sv-textarea" rows="3" placeholder="Please share current price list, payment schedules, and bank loan approvals."></textarea>
          </div>

          <button type="submit" class="sv-submit-btn" id="enq-submit-btn">
            Submit Enquiry
          </button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('sv-enquiry-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('enq-input-name').value.trim();
    const mobile = document.getElementById('enq-input-mobile').value.trim();
    const email = document.getElementById('enq-input-email').value.trim();
    const msg = document.getElementById('enq-input-msg').value.trim();
    const project = context?.projectName || document.getElementById('enq-input-project')?.value || 'General Consultation';

    let hasError = false;
    if (!name || name.length < 2) {
      document.getElementById('err-enq-name').textContent = 'Please enter your full name';
      hasError = true;
    } else {
      document.getElementById('err-enq-name').textContent = '';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobile)) {
      document.getElementById('err-enq-mobile').textContent = 'Please enter a valid 10-digit mobile number';
      hasError = true;
    } else {
      document.getElementById('err-enq-mobile').textContent = '';
    }

    if (hasError) return;

    const submitBtn = document.getElementById('enq-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    let whatsappSent = false;
    let enquiryReference = '';
    try {
      const res = await api.createBooking({
        name,
        phone: mobile,
        email,
        date: 'Immediate Enquiry',
        time: 'Preferred Slot',
        projectName: project,
        notes: msg
      });
      whatsappSent = Boolean(res?.customerNotification?.sent);
      enquiryReference = res?.reference || '';
    } catch (err) {
      console.warn('[enquiry] API call warning:', err?.message || err);
    }

    renderEnquirySuccess({
      customerName: name,
      customerMobile: mobile,
      customerEmail: email,
      message: msg,
      projectName: project,
      context: context,
      whatsappSent,
      enquiryReference
    });
  });
}

export function renderEnquirySuccess(data) {
  const container = document.getElementById('sv-flow-container');
  if (!container) return;

  container.innerHTML = `
    <div class="sv-screen sv-screen-success">
      <div class="sv-top-header">
        <button type="button" class="sv-close-x right-only" onclick="window.closeSiteVisitFlow()">&times;</button>
      </div>

      <div class="sv-success-content">
        <div class="sv-success-icon-wrap">
          <div class="sv-green-circle">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <h2 class="sv-success-title">Enquiry Received!</h2>
        
        <p class="sv-success-msg">
          Thank you, <strong>${data.customerName}</strong>!<br/>
          Your enquiry regarding <strong>${data.projectName}</strong> has been submitted. ${data.whatsappSent ? '<strong>A confirmation has been sent to your WhatsApp number.</strong> ' : ''}Our property expert will connect with you at <strong>${data.customerMobile}</strong> with verified brochures and pricing.
        </p>
        ${data.enquiryReference ? `<div style="margin: -10px 0 15px 0; font-size: 13px; color: #64748b; font-weight: 500;">Reference: <strong>${data.enquiryReference}</strong></div>` : ''}

        ${data.context ? `
        <div class="sv-property-preview-card success-card">
          <div class="sv-prev-label">Enquired Property</div>
          <div class="sv-prev-content">
            <img src="${data.context.thumb || data.context.image || '/images/journey/gallery_entrance.jpg'}" alt="${data.context.projectName}" class="sv-prev-thumb" />
            <div class="sv-prev-info">
              <div class="sv-prev-name">${data.context.projectName}</div>
              <div class="sv-prev-unit">${data.context.unitName || ''}</div>
              <div class="sv-prev-loc">${data.context.location || ''}</div>
              ${data.context.price ? `<div class="sv-prev-price">${data.context.price}</div>` : ''}
            </div>
          </div>
        </div>
        ` : ''}

        <div class="sv-next-steps-card">
          <h3 class="sv-next-title">Next Steps</h3>
          <div class="sv-step-row">
            <div class="sv-step-badge">1</div>
            <div class="sv-step-desc">Our dedicated relationship manager will call you within 1 business hour.</div>
          </div>
          <div class="sv-step-row">
            <div class="sv-step-badge">2</div>
            <div class="sv-step-desc">Receive digital brochure, floor plan layouts, and payment milestone breakdown directly on WhatsApp.</div>
          </div>
        </div>

        <button type="button" class="sv-back-project-btn" onclick="window.closeSiteVisitFlow()">
          Done
        </button>
      </div>
    </div>
  `;
}

// Global window hookups
window.openSiteVisitFlow = openSiteVisitFlow;
window.closeSiteVisitFlow = closeSiteVisitFlow;
window.renderScreen2Form = () => renderScreen2Form();
window.openGeneralEnquiry = openGeneralEnquiry;
window.getSharedProperty = getSharedProperty;
window.setSharedProperty = setSharedProperty;
window.switchToEnquiry = () => {
  const prop = currentPropertyContext;
  openGeneralEnquiry(prop);
};

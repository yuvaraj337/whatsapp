export function renderHeader(options = {}) {
  const { currentPath = '#/', isDetail = false, isOpenPlots = false, backUrl = '#/open-plots' } = options;

  let leftNavElement = '';
  let rightNavElement = '';

  const getInTouchBtn = `
    <button class="header-get-in-touch-btn" onclick="window.openGeneralEnquiry ? window.openGeneralEnquiry() : (window.openSiteVisitModal ? window.openSiteVisitModal('VR Header') : null)">
      <span>- Get in Touch</span>
      <span class="btn-circle-arrow">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </span>
    </button>
  `;

  if (isDetail) {
    leftNavElement = `
      <a href="${backUrl}" class="nav-back-btn" id="header-back-btn">
        <span>&larr;</span> Back
      </a>
    `;
    rightNavElement = `
      <a href="tel:+919876543210" class="header-phone-link" title="Call Real Estate Brothers group">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>+91 98765 43210</span>
      </a>
      ${getInTouchBtn}
    `;
  } else if (isOpenPlots) {
    rightNavElement = `
      <a href="tel:+919876543210" class="header-phone-link" title="Call Real Estate Brothers group">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>+91 98765 43210</span>
      </a>
      ${getInTouchBtn}
    `;
  } else {
    rightNavElement = `
      <a href="tel:+919876543210" class="header-phone-link" title="Call Real Estate Brothers group">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>+91 98765 43210</span>
      </a>
      ${getInTouchBtn}
    `;
  }

  const isHome = currentPath === '#/' || currentPath === '';
  const isProperties = currentPath.includes('plots') || currentPath.includes('villas') || currentPath.includes('apartments') || currentPath.includes('farmlands');

  return `
    <header class="ref-header" id="main-header">
      <div class="ref-header-inner">
        <!-- Brand Logo Area -->
        <a href="#/" class="ref-brand-block" title="Real Estate Brothers group">
          <img src="/images/vr-logo.png" alt="Real Estate Brothers group" class="ref-brand-logo-img" />
          <div class="ref-brand-text">
            <span class="ref-brand-title">Real Estate Brothers group</span>
            <span class="ref-brand-subtitle">LAND TODAY &bull; A BRIGHTER TOMORROW</span>
          </div>
        </a>

        <!-- Desktop Navigation Links matching Image 2 -->
        <nav class="ref-nav-menu" id="ref-nav-menu">
          ${leftNavElement}
          
          <div class="ref-nav-pill-wrapper ${isHome ? 'active' : ''}">
            <a href="#/" class="ref-nav-link ${isHome ? 'active' : ''}">
              <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Home</span>
            </a>
            ${isHome ? '<span class="nav-active-dot" aria-hidden="true"></span>' : ''}
          </div>

          <div class="ref-nav-pill-wrapper ${currentPath === '#/about' ? 'active' : ''}">
            <a href="#/about" class="ref-nav-link ${currentPath === '#/about' ? 'active' : ''}">
              <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>About Us</span>
            </a>
            ${currentPath === '#/about' ? '<span class="nav-active-dot" aria-hidden="true"></span>' : ''}
          </div>

          <div class="ref-nav-pill-wrapper ${currentPath === '#/projects' ? 'active' : ''}">
            <a href="#/projects" class="ref-nav-link ${currentPath === '#/projects' ? 'active' : ''}">
              <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
              </svg>
              <span>Projects</span>
            </a>
            ${currentPath === '#/projects' ? '<span class="nav-active-dot" aria-hidden="true"></span>' : ''}
          </div>

          <div class="ref-nav-item has-dropdown ref-nav-pill-wrapper ${isProperties ? 'active' : ''}">
            <a href="#/open-plots" class="ref-nav-link dropdown-toggle ${isProperties ? 'active' : ''}">
              <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                <path d="M9 22v-4h6v4"/>
                <path d="M8 6h.01"/>
                <path d="M16 6h.01"/>
                <path d="M12 6h.01"/>
                <path d="M12 10h.01"/>
                <path d="M12 14h.01"/>
                <path d="M16 10h.01"/>
                <path d="M16 14h.01"/>
                <path d="M8 10h.01"/>
                <path d="M8 14h.01"/>
              </svg>
              <span>Properties</span>
              <svg class="dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            ${isProperties ? '<span class="nav-active-dot" aria-hidden="true"></span>' : ''}
            <div class="ref-dropdown-menu">
              <a href="#/open-plots" class="ref-dropdown-item">Open Plots</a>
              <a href="#/villas" class="ref-dropdown-item">Luxury Villas</a>
              <a href="#/apartments" class="ref-dropdown-item">Apartments</a>
              <a href="#/farmlands" class="ref-dropdown-item">Farm Lands</a>
            </div>
          </div>

          <div class="ref-nav-pill-wrapper ${currentPath === '#/locations' ? 'active' : ''}">
            <a href="#/locations" class="ref-nav-link ${currentPath === '#/locations' ? 'active' : ''}">
              <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Locations</span>
            </a>
            ${currentPath === '#/locations' ? '<span class="nav-active-dot" aria-hidden="true"></span>' : ''}
          </div>

          <div class="ref-nav-pill-wrapper ${currentPath === '#/resources' ? 'active' : ''}">
            <a href="#/resources" class="ref-nav-link ${currentPath === '#/resources' ? 'active' : ''}">
              <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" x2="18" y1="20" y2="10"/>
                <line x1="12" x2="12" y1="20" y2="4"/>
                <line x1="6" x2="6" y1="20" y2="14"/>
              </svg>
              <span>Insights</span>
            </a>
            ${currentPath === '#/resources' ? '<span class="nav-active-dot" aria-hidden="true"></span>' : ''}
          </div>

          <div class="ref-nav-pill-wrapper ${currentPath === '#/contact' ? 'active' : ''}">
            <a href="#/contact" class="ref-nav-link ${currentPath === '#/contact' ? 'active' : ''}">
              <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span>Contact</span>
            </a>
            ${currentPath === '#/contact' ? '<span class="nav-active-dot" aria-hidden="true"></span>' : ''}
          </div>
        </nav>

        <!-- Right Side Contact & Get in Touch CTA -->
        <div class="ref-header-actions">
          ${rightNavElement}
          <button class="header-mobile-enquire-btn" onclick="window.openGeneralEnquiry ? window.openGeneralEnquiry() : (window.openSiteVisitModal ? window.openSiteVisitModal('Mobile Header') : null)">
            Enquire Now &rarr;
          </button>
          <button class="ref-mobile-toggle" id="ref-mobile-toggle" aria-label="Toggle navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <!-- Mobile Nav Drawer -->
      <div class="ref-mobile-drawer" id="ref-mobile-drawer">
        <a href="#/" class="ref-mobile-link ${isHome ? 'active' : ''}">Home</a>
        <a href="#/about" class="ref-mobile-link ${currentPath === '#/about' ? 'active' : ''}">About Us</a>
        <a href="#/projects" class="ref-mobile-link ${currentPath === '#/projects' ? 'active' : ''}">Projects</a>
        <a href="#/open-plots" class="ref-mobile-link">Open Plots</a>
        <a href="#/villas" class="ref-mobile-link">Luxury Villas</a>
        <a href="#/apartments" class="ref-mobile-link">Apartments</a>
        <a href="#/farmlands" class="ref-mobile-link">Farm Lands</a>
        <a href="#/locations" class="ref-mobile-link ${currentPath === '#/locations' ? 'active' : ''}">Locations</a>
        <a href="#/resources" class="ref-mobile-link ${currentPath === '#/resources' ? 'active' : ''}">Insights</a>
        <a href="#/contact" class="ref-mobile-link ${currentPath === '#/contact' ? 'active' : ''}">Contact</a>
        <div class="ref-mobile-contact">
          <a href="tel:+919876543210" class="mobile-contact-item">📞 +91 98765 43210</a>
          <a href="mailto:info@realestatebrothersgroup.com" class="mobile-contact-item">✉️ info@realestatebrothersgroup.com</a>
        </div>
      </div>
    </header>
  `;
}

export function initStickyNav() {
  const header = document.getElementById('main-header');
  const toggle = document.getElementById('ref-mobile-toggle');
  const drawer = document.getElementById('ref-mobile-drawer');

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      drawer.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

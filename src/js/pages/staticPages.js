import { api } from '../api/client.js';
import { renderHeader, initStickyNav } from '../components/header.js';
import { renderFooter, initScrollTop } from '../components/footer.js';
import { showToast } from '../components/siteVisitModal.js';

export function renderStaticPage(title, subtitle, contentHtml, currentPath = '#/') {
  const html = `
    <div class="page-static">
      ${renderHeader({ currentPath })}
      
      <div class="page-title-banner">
        <div class="container">
          <h1 class="page-title-heading">${title}</h1>
        </div>
      </div>

      <div class="container" style="padding-top: 50px; padding-bottom: 80px; max-width: 960px;">
        ${subtitle ? `<p style="font-size: 1.2rem; color: #475569; margin-bottom: 30px; line-height: 1.6;">${subtitle}</p>` : ''}
        <div class="static-content" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: var(--shadow-sm); line-height: 1.8; color: #334155;">
          ${contentHtml}
        </div>
      </div>

      ${renderFooter()}
    </div>
  `;

  return {
    html,
    init: () => {
      initStickyNav();
      initScrollTop();

      const contactForm = document.getElementById('static-contact-form');
      if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = contactForm.querySelector('input[type="text"]')?.value?.trim() || '';
          const phone = contactForm.querySelector('input[type="tel"]')?.value?.trim() || '';
          const email = contactForm.querySelector('input[type="email"]')?.value?.trim() || '';
          const interest = contactForm.querySelector('select')?.value || 'General Inquiry';
          const requirement = contactForm.querySelector('textarea')?.value?.trim() || '';

          const submitBtn = contactForm.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
          }

          let whatsappSent = false;
          try {
            const res = await api.createBooking({
              name,
              phone,
              email,
              date: 'Contact Page Inquiry',
              time: 'Preferred Slot',
              projectName: `Real Estate Brothers group - ${interest}`,
              notes: requirement
            });
            whatsappSent = Boolean(res?.customerNotification?.sent);
          } catch (err) {
            console.warn('[static-contact] enquiry notice:', err?.message || err);
          }

          contactForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }

          if (whatsappSent) {
            showToast(`Thank you, ${name}! Your message has been sent and confirmed via WhatsApp.`);
          } else {
            showToast('Message sent! Our property advisor will reach out to you.');
          }
        });
      }
    }
  };
}

export function renderAboutPage() {
  return renderStaticPage(
    'ABOUT Real Estate Brothers group',
    'Find Your Dream Asset with complete confidence, transparency, and legal due diligence.',
    `
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; color: #0e4b9e; margin-bottom: 16px;">Who We Are</h2>
      <p style="margin-bottom: 20px;">
        Real Estate Brothers group is a premier real estate advisory and land acquisition company operating across prime corridors in Telangana and Andhra Pradesh. Built on principles of transparency, trust, and verified documentation, we assist individual home seekers, NRI investors, and institutional clients in identifying high-growth land assets and luxury properties.
      </p>
      <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #1e293b; margin-top: 30px; margin-bottom: 14px;">Our Core Expertise</h3>
      <ul style="padding-left: 20px; margin-bottom: 24px;">
        <li style="margin-bottom: 8px;"><strong>HMDA &amp; DTCP Approved Open Plots:</strong> Strategic layouts along emerging growth hubs like Shadnagar, Balanagar, and Regional Ring Road corridors.</li>
        <li style="margin-bottom: 8px;"><strong>Luxury Gated Villas:</strong> Ultra-modern architecture, private amenities, and sustainable community living.</li>
        <li style="margin-bottom: 8px;"><strong>Premium High-Rise Apartments:</strong> 2 &amp; 3 BHK luxury residences in established city centers.</li>
        <li style="margin-bottom: 8px;"><strong>Managed Farmlands:</strong> Sustainable green escapes offering sandalwood, agarwood, and high long-term appreciation.</li>
      </ul>
      <div style="margin-top: 36px; padding: 24px; background: #f0f7ff; border-radius: 12px; border-left: 4px solid #0e4b9e;">
        <h4 style="color: #0e4b9e; font-size: 1.1rem; margin-bottom: 8px;">Our Promise to Every Buyer:</h4>
        <p>ముందుగా Location చూడండి... నచ్చితేనే Decision తీసుకోండి. We always recommend inspecting the actual site, verifying town-planning approvals, and understanding future appreciation potential before committing.</p>
      </div>
    `,
    '#/about'
  );
}

export function renderServicesPage() {
  return renderStaticPage(
    'OUR SERVICES',
    'Comprehensive real estate advisory from land verification to registration and management.',
    `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0e4b9e; font-size: 1.25rem; margin-bottom: 8px;">📜 Due Diligence &amp; Title Verification</h3>
          <p>Complete 30-year link document verification, master plan conformity checks, HMDA, DTCP, and RERA approval audits.</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0e4b9e; font-size: 1.25rem; margin-bottom: 8px;">🚗 Free Guided Site Visits</h3>
          <p>Complimentary escorted site visits from Hyderabad with expert property consultants explaining on-ground milestones.</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0e4b9e; font-size: 1.25rem; margin-bottom: 8px;">🌐 NRI &amp; Remote Buyer Assistance</h3>
          <p>Dedicated desk for Telugus in Bengaluru, USA, and Gulf countries with video walkthroughs and legal power-of-attorney support.</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0e4b9e; font-size: 1.25rem; margin-bottom: 8px;">💼 Resale &amp; Portfolio Management</h3>
          <p>Strategic advisory on when to enter, hold, and exit plotted land investments to maximize compounding capital returns.</p>
        </div>
      </div>
    `,
    '#/services'
  );
}

export function renderContactPage() {
  return renderStaticPage(
    'CONTACT US',
    'Get in touch with Real Estate Brothers group advisors for plots, villas, and site visits.',
    `
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 36px;">
        <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));">
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #1A3B2B; margin-bottom: 6px;">Send Us an Enquiry</h3>
          <p style="color: #64748b; font-size: 0.92rem; margin-bottom: 20px;">Have questions about our plots, villas, or apartments? Fill out this form and our team will get back to you shortly.</p>
          
          <form id="static-contact-form" class="enquiry-form-body">
            <div class="form-group" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Full Name *</label>
              <input type="text" id="contact-full-name" placeholder="Enter your full name" required style="width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Mobile Number *</label>
              <input type="tel" id="contact-mobile" placeholder="10-digit mobile number" required pattern="[0-9]{10}" style="width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Email Address</label>
              <input type="email" id="contact-email" placeholder="name@example.com" style="width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Interested In *</label>
              <select id="contact-interested-in" required style="width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; background: #fff;">
                <option value="" disabled selected>Select Category</option>
                <option value="Open Plots">Open Plots (Shadnagar / Hyderabad)</option>
                <option value="Villas">Luxury Villas (Kompally / Tellapur)</option>
                <option value="Apartments">High-Rise Apartments (Kokapet / Nallagandla)</option>
                <option value="Farmlands">Managed Farm Lands (Shankarpally)</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 18px;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Your Message / Requirement</label>
              <textarea id="contact-message" placeholder="Tell us your requirements, budget, or preferred schedule..." rows="4" style="width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem;"></textarea>
            </div>
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <button type="submit" class="btn-send-enquiry" style="background: #1A3B2B; color: #fff; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Send Message</button>
              <button type="button" class="btn-outline-brochure" onclick="alert('Downloading Project Brochure (PDF)...')" style="background: #f8fafc; color: #1A3B2B; border: 1.5px solid #1A3B2B; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                <span>Download Brochure (PDF)</span>
              </button>
            </div>
          </form>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 28px; border: 1px solid #e2e8f0; height: fit-content;">
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: #1e293b; margin-bottom: 20px;">Direct Contact</h3>
          <p style="margin-bottom: 14px;"><strong>📞 Phone:</strong> <a href="tel:+919490634829" style="color: #1A3B2B; font-weight: 600;">+91-9490-634829</a></p>
          <p style="margin-bottom: 14px;"><strong>✉️ Email:</strong> <a href="mailto:info@realestatebrothersgroup.com" style="color: #1A3B2B; font-weight: 600;">info@realestatebrothersgroup.com</a></p>
          <p style="margin-bottom: 14px;"><strong>📍 Locations:</strong> Hyderabad, Shadnagar, Amaravati &amp; Visakhapatnam</p>
          <div style="margin-top: 24px;">
            <a href="https://wa.me/919490634829" target="_blank" class="btn-whatsapp-enquiry" style="display: inline-block; background: #25D366; color: #fff; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 600;">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    `,
    '#/contact'
  );
}

export function renderResourcesPage() {
  return renderStaticPage(
    'RESOURCES & BUYER GUIDES',
    'Comprehensive guides and regulatory resources for land buyers in AP & Telangana.',
    `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0e4b9e; font-size: 1.25rem;">Amaravati Capital Region Buyer Guide</h3>
          <p>Essential checklist for open plots and commercial ventures in the CRDA zone, capital infrastructure timelines, and land pooling schemes.</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0e4b9e; font-size: 1.25rem;">HMDA vs DTCP: What Every Telangana Buyer Must Know</h3>
          <p>Understanding layout norms, mortgage plot releases, open space reservations, and conversion approvals before you sign.</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0e4b9e; font-size: 1.25rem;">Bengaluru Telugu Techies: Investing in Hyderabad &amp; AP</h3>
          <p>Why Bangalore tech professionals are acquiring assets along the Bangalore-Hyderabad expressway corridor.</p>
        </div>
      </div>
    `,
    '#/resources'
  );
}

export function renderMediaPage() {
  return renderStaticPage(
    'MEDIA & PROJECT HIGHLIGHTS',
    'Watch walkthrough videos, drone surveys, and layout development updates.',
    `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <img src="/images/hero-openplots.jpg" style="height: 200px; width: 100%; object-fit: cover;" />
          <div style="padding: 18px;">
            <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 6px;">Shadnagar Highway Corridor Drone Survey</h4>
            <p style="font-size: 0.9rem; color: #64748b;">Aerial view of new infrastructure, 6-lane highway connectivity, and upcoming SEZs.</p>
          </div>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <img src="/images/hero-villas.jpg" style="height: 200px; width: 100%; object-fit: cover;" />
          <div style="padding: 18px;">
            <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 6px;">Luxury Gated Community Clubhouse Showcase</h4>
            <p style="font-size: 0.9rem; color: #64748b;">Tour the modern architecture and resort-style amenities.</p>
          </div>
        </div>
      </div>
    `,
    '#/media'
  );
}

export function renderCategoryListingPage(type = 'villas') {
  const titles = {
    villas: 'LUXURY VILLAS',
    apartments: 'PREMIUM APARTMENTS',
    farmlands: 'MANAGED FARM LANDS'
  };

  const images = {
    villas: '/images/cat-villas.jpg',
    apartments: '/images/cat-apartments.jpg',
    farmlands: '/images/cat-farmlands.jpg'
  };

  const title = titles[type] || 'PROPERTIES';
  const img = images[type] || '/images/cat-villas.jpg';

  return renderStaticPage(
    title,
    `Explore premium ${type} verified by Real Estate Brothers group.`,
    `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px;">
        <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm);">
          <img src="${img}" style="height: 260px; width: 100%; object-fit: cover;" />
          <div style="padding: 24px;">
            <h3 style="font-size: 1.35rem; color: #0e4b9e; font-weight: 800; margin-bottom: 8px;">Prime Gated Project</h3>
            <p style="color: #64748b; margin-bottom: 16px;">Strategically located in premier high-growth sectors with full legal sanctions and bank loans available.</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: #f57c00; font-size: 1.1rem;">Price on Request</span>
              <button class="nav-cta-blue" onclick="window.openSiteVisitModal('${title}')">Enquire Now</button>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; padding: 20px;">
          <h3 style="font-size: 1.4rem; color: #1e293b; margin-bottom: 12px;">Looking for specific locations or budgets?</h3>
          <p style="color: #4b5563; line-height: 1.7; margin-bottom: 24px;">Our advisors provide custom property shortlists matching your family needs and investment goals across AP &amp; Telangana.</p>
          <button class="btn-send-enquiry" style="width: fit-content;" onclick="window.openSiteVisitModal('${title}')">Request Custom Shortlist</button>
        </div>
      </div>
    `,
    `#/${type}`
  );
}

export function renderLocationsPage() {
  const locations = [
    { name: 'Hyderabad - Kokapet', desc: 'Financial District & Neopolis high-rise luxury corridor.', link: '#/apartments/vr-elite-towers', badge: 'Apartments' },
    { name: 'Hyderabad - Kompally', desc: 'Serene gated community villas with top connectivity.', link: '#/vr-green-villas', badge: 'Luxury Villas' },
    { name: 'Hyderabad - Shadnagar', desc: 'HMDA approved open plots near upcoming SEZ & Regional Ring Road.', link: '#/open-plots', badge: 'Open Plots' },
    { name: 'Hyderabad - Shankarpally', desc: 'Managed lush farmlands with coconut and mango groves.', link: '#/farmlands/natures-nest', badge: 'Farm Lands' },
    { name: 'Hyderabad - Nallagandla', desc: 'Fast-developing residential hub near Gachibowli.', link: '#/apartments', badge: 'Apartments' },
    { name: 'Amaravati Capital Region', desc: 'High-growth strategic plots with legal due diligence.', link: '#/open-plots', badge: 'Open Plots' }
  ];

  return renderStaticPage(
    'PRIME LOCATIONS',
    'Discover verified properties and fast-appreciating ventures across high-growth corridors.',
    `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        ${locations.map(loc => `
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span style="display: inline-block; background: #E8F5E9; color: #1B5E20; font-size: 0.78rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 12px;">${loc.badge}</span>
              <h3 style="font-size: 1.25rem; color: #1e293b; font-weight: 700; margin-bottom: 8px;">${loc.name}</h3>
              <p style="color: #64748b; font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px;">${loc.desc}</p>
            </div>
            <a href="${loc.link}" style="color: #1A3B2B; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 6px;">
              <span>Explore Properties</span> &rarr;
            </a>
          </div>
        `).join('')}
      </div>
    `,
    '#/locations'
  );
}

export function renderProjectsPage() {
  const projects = [
    { name: 'VR Elite Towers', loc: 'Kokapet, Hyderabad', type: 'Apartments', price: '₹ 75 Lakhs*', link: '#/apartments/vr-elite-towers', img: '/images/journey/overview_thumb_1.jpg' },
    { name: 'VR Green Villas', loc: 'Kompally, Hyderabad', type: 'Villas', price: '₹ 2.50 Cr', link: '#/vr-green-villas', img: '/images/villas/villa-vr-green.png' },
    { name: 'VR Prime Meadows', loc: 'Shadnagar, Hyderabad', type: 'Open Plots', price: '₹ 29.9 Lakhs*', link: '#/vr-prime-meadows', img: '/images/ref/feat-plots-clean.jpg' },
    { name: "Nature's Nest", loc: 'Shankarpally, Hyderabad', type: 'Farm Lands', price: '₹ 1.25 Crore', link: '#/farmlands/natures-nest', img: '/images/farmlands/farm-natures-nest.jpg' }
  ];

  return renderStaticPage(
    'OUR FEATURED PROJECTS',
    'Explore curated projects across Open Plots, Luxury Villas, Apartments and Managed Farmlands.',
    `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
        ${projects.map(p => `
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <img src="${p.img}" alt="${p.name}" style="height: 180px; width: 100%; object-fit: cover;" />
            <div style="padding: 20px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #15803D; text-transform: uppercase;">${p.type}</span>
              <h3 style="font-size: 1.2rem; color: #1e293b; margin: 6px 0;">${p.name}</h3>
              <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 14px;">${p.loc}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                <span style="font-weight: 700; color: #1A3B2B;">${p.price}</span>
                <a href="${p.link}" style="background: #1A3B2B; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">View &rarr;</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `,
    '#/projects'
  );
}


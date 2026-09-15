import '../../styles/crm.css';
import { renderMasterPlanSvg } from '../components/plotMasterPlan.js';
import { renderMasterPlanSvgCode } from '../components/villaMasterPlan.js';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'won', 'lost'];
const VISIT_STATUSES = ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'];
const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const INVENTORY_STATUSES = ['AVAILABLE', 'HOLD', 'RESERVED', 'BOOKED', 'SOLD', 'BLOCKED'];

const CRM_PROJECTS = [
  { slug: 'vr-green-meadows', name: '🌿 VR Green Meadows (Amodha Plots)', type: 'plot' },
  { slug: 'vr-luxury-villas', name: '🏡 VR Luxury Villas', type: 'villa' },
  { slug: 'vr-elite-towers', name: '🏢 VR Elite Towers', type: 'apartment' },
  { slug: 'vr-agro-lands', name: '🌾 VR Agro Lands', type: 'farmland' }
];

const GREEN_MEADOWS_PLOTS = [
  { id: 'P01', num: 'P01', size: 200, facing: 'East', road: '40ft Road', price: '₹32,00,000' },
  { id: 'P02', num: 'P02', size: 200, facing: 'East', road: '40ft Road', price: '₹32,00,000' },
  { id: 'P03', num: 'P03', size: 200, facing: 'East', road: '40ft Road', price: '₹32,00,000' },
  { id: 'P04', num: 'P04', size: 200, facing: 'East', road: '40ft Road', price: '₹32,00,000' },
  { id: 'P05', num: 'P05', size: 200, facing: 'East', road: '40ft Road', price: '₹32,00,000' },
  { id: 'P06', num: 'P06', size: 200, facing: 'East', road: '40ft Road', price: '₹32,00,000' },
  { id: 'P07', num: 'P07', size: 220, facing: 'West', road: '40ft Road', price: '₹35,20,000' },
  { id: 'P08', num: 'P08', size: 220, facing: 'West', road: '40ft Road', price: '₹35,20,000' },
  { id: 'P09', num: 'P09', size: 220, facing: 'West', road: '40ft Road', price: '₹35,20,000' },
  { id: 'P10', num: 'P10', size: 220, facing: 'West', road: '40ft Road', price: '₹35,20,000' },
  { id: 'P11', num: 'P11', size: 220, facing: 'West', road: '40ft Road', price: '₹35,20,000' },
  { id: 'P12', num: 'P12', size: 220, facing: 'West', road: '40ft Road', price: '₹35,20,000' },
  { id: 'P13', num: 'P13', size: 250, facing: 'North', road: '60ft Road', price: '₹40,00,000' },
  { id: 'P14', num: 'P14', size: 250, facing: 'North', road: '60ft Road', price: '₹40,00,000' },
  { id: 'P15', num: 'P15', size: 250, facing: 'North', road: '60ft Road', price: '₹40,00,000' },
  { id: 'P16', num: 'P16', size: 250, facing: 'North', road: '60ft Road', price: '₹40,00,000' },
  { id: 'P17', num: 'P17', size: 250, facing: 'North', road: '60ft Road', price: '₹40,00,000' },
  { id: 'P18', num: 'P18', size: 250, facing: 'North', road: '60ft Road', price: '₹40,00,000' }
];

const LUXURY_VILLAS = [
  { id: 'v01', label: 'V01', bhk: '4 BHK East', price: '₹1.85 Cr' },
  { id: 'v02', label: 'V02', bhk: '4 BHK East', price: '₹1.85 Cr' },
  { id: 'v03', label: 'V03', bhk: '4 BHK East', price: '₹1.85 Cr' },
  { id: 'v04', label: 'V04', bhk: '4 BHK East', price: '₹1.85 Cr' },
  { id: 'v05', label: 'V05', bhk: '4 BHK East', price: '₹1.85 Cr' },
  { id: 'v06', label: 'V06', bhk: '4 BHK West', price: '₹1.75 Cr' },
  { id: 'v07', label: 'V07', bhk: '4 BHK West', price: '₹1.75 Cr' },
  { id: 'v08', label: 'V08', bhk: '4 BHK West', price: '₹1.75 Cr' },
  { id: 'v09', label: 'V09', bhk: '4 BHK West', price: '₹1.75 Cr' },
  { id: 'v10', label: 'V10', bhk: '4 BHK West', price: '₹1.75 Cr' },
  { id: 'v11', label: 'V11', bhk: '5 BHK North', price: '₹2.20 Cr' },
  { id: 'v12', label: 'V12', bhk: '5 BHK North', price: '₹2.20 Cr' },
  { id: 'v13', label: 'V13', bhk: '5 BHK North', price: '₹2.20 Cr' },
  { id: 'v14', label: 'V14', bhk: '5 BHK North', price: '₹2.20 Cr' },
  { id: 'v15', label: 'V15', bhk: '5 BHK North', price: '₹2.20 Cr' }
];

let key = sessionStorage.getItem('vr_crm_key') || '';
const S = {
  tab: 'overview',
  summary: null,
  enquiries: [],
  conversations: [],
  visits: [],
  inventory: [],
  bookings: [],
  messages: [],
  active: null,
  search: '',
  enquiryFilter: 'active', // 'active' or 'cancelled'
  visitFilter: 'ALL',
  inventoryFilter: 'ALL',
  bookingFilter: 'ALL',
  selectedProject: 'vr-green-meadows',
  selectedPlotId: 'P17',
  inventoryViewMode: 'plan',
  activePlotDetail: null,
  plotHistory: [],
  reviews: [],
  reviewFilter: 'ALL'
};
let timer = null;

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const label = (v) => String(v || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const cls = (v) => 'status-' + String(v || '').toLowerCase().replaceAll('_', '-');
const date = (v) => (v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const initials = (v) => (String(v || 'VR').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('') || 'VR').toUpperCase();

function cleanCustomerNote(raw) {
  if (!raw) return '-';
  let str = String(raw).trim();
  if (!str) return '-';

  str = str.replace(/\[(?:Website Enquiry|Website Site Visit|Offline Site Visit|Contact Enquiry|Offline|BOOKED|AUTO-CAPTURED[^\]]*)\]/gi, '');
  str = str.replace(/(?:Project|Property(?:\/Plot)?|Plot|Type|Area|Price|Unit|Facing|Road|Source|Date|Time|Scheduled|Status|Message ID|Enquiry ID|Booking ID|Reference|Original Interested Property|Booked Property):\s*[^|\n]*/gi, '');
  str = str.replace(/(?:Customer Note|Message|Remarks|Notes?):\s*/gi, '');
  str = str
    .replace(/created from website (?:enquiry|contact) form\.?/gi, '')
    .replace(/Site visit scheduled for [^|\n]*/gi, '')
    .replace(/Offline customer for property [^|\n]*/gi, '')
    .replace(/[|—\-]+/g, ' ')
    .trim();

  const lines = str.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('http') && !l.includes('wa.me') && !/^(?:none|nil|na|n\/a|-)$/i.test(l));

  const unique = Array.from(new Set(lines)).join(' ').replace(/\s+/g, ' ').trim();
  return unique || '-';
}

function cleanEnquiryNotes(raw) {
  return cleanCustomerNote(raw);
}

export function cleanVisitNote(raw) {
  if (!raw) return '-';
  let str = String(raw).trim();
  if (!str) return '-';

  // 1. Extract note candidate from 'Query: "..."' or 'Notes: ...'
  let candidate = '';
  const queryMatch = str.match(/Query:\s*["']([^"'\n]+)["']/i);
  const notesMatch = str.match(/\bNotes?:\s*([^|\n]+)/i);

  if (queryMatch) {
    candidate = queryMatch[1].trim();
  } else if (notesMatch) {
    candidate = notesMatch[1].trim();
  } else {
    // If it is a system-generated site visit string without custom notes/query, return '-'
    if (/^(?:\[?(?:Website|WhatsApp|Offline)\s*(?:AI\s*)?Site\s*Visit\]?)/i.test(str)) {
      const after = str.replace(/^(?:\[?(?:Website|WhatsApp|Offline)\s*(?:AI\s*)?Site\s*Visit\]?)\s*:?/i, '').trim();
      if (!after || /^Project:\s*/i.test(after)) return '-';
      candidate = after;
    } else {
      candidate = str;
    }
  }

  // If candidate is purely system text like 'Booked via ...' without query
  if (/^Booked via (?:WhatsApp Agent|Website AI Chatbot|Website Site Visit form)/i.test(candidate) && !queryMatch) {
    return '-';
  }

  let text = candidate;

  // Strip bracketed system tags
  text = text.replace(/\[(?:Website Site Visit|WhatsApp AI Site Visit|Offline Site Visit|Website Enquiry|Contact Enquiry|Offline|BOOKED|AUTO-CAPTURED[^\]]*)\]/gi, ' ');
  text = text.replace(/\[Customer Updated Details\]:[^|\n]*/gi, ' ');

  // Strip system prefixes and booking agent sentences
  text = text.replace(/(?:WhatsApp|Website AI|Website|Offline)\s*Site\s*Visit:?[^|\n]*/gi, ' ');
  text = text.replace(/Booked via (?:WhatsApp Agent|Website AI Chatbot|Website Site Visit form)[^|\n.]*\.?/gi, ' ');
  text = text.replace(/(?:VR\s+)?(?:Green\s+Meadows|Green\s+Villas|Luxury\s+Villas|Elite\s+Towers|Nature's\s+Nest|Prime\s+Meadows|Heights|Agro\s+Lands|Amodha\s+Plots)[^|\n,]*/gi, ' ');
  text = text.replace(/\([A-Za-z0-9-]+\)/gi, ' ');
  text = text.replace(/\b(?:P\d+|V\d+|A-\d+|B-\d+|F-\d+)\b/gi, ' ');

  // Strip contact details
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ');
  text = text.replace(/(?:\+?91|0)?[-\s]?[6-9]\d{9}\b/g, ' ');
  text = text.replace(/\b\d{10,12}\b/g, ' ');
  text = text.replace(/(?:my\s+)?phone(?:\s+number)?\s*(?:is|=)\s*[^,\n|]*/gi, ' ');
  text = text.replace(/(?:my\s+)?email(?:\s+address)?\s*(?:is|=)\s*[^,\n|]*/gi, ' ');
  text = text.replace(/(?:my\s+)?(?:full\s+)?name\s*(?:is|=)\s*[^,\n|]*/gi, ' ');

  // Strip system booking boilerplate sentences
  text = text.replace(/(?:can\s+you|please|could\s+you|i\s+want\s+to|would\s+like\s+to)?\s*book\s+(?:a\s+)?(?:free\s+)?site\s*visit\s*(?:for\s+)?(?:plot\s*|villa\s*|apartment\s*)?(?:[A-Za-z0-9-]+)?/gi, ' ');
  text = text.replace(/(?:schedule|arrang(?:e|ing)|confirm(?:ing)?)\s+(?:a\s+)?site\s*visit\s*(?:for\s+[^,\n|]*)?/gi, ' ');
  text = text.replace(/\b(?:tomorrow|today|day after tomorrow|yesterday|morning|afternoon|evening|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s+\d{4})?)\b/gi, ' ');
  text = text.replace(/created from website (?:enquiry|contact|site visit) form\.?/gi, ' ');
  text = text.replace(/Site visit scheduled for [^|\n]*/gi, ' ');
  text = text.replace(/Offline customer for property [^|\n]*/gi, ' ');
  text = text.replace(/(?:Customer Note|Message|Remarks|Notes?):\s*/gi, ' ');

  // Clean delimiters (preserve compound word hyphens like east-facing)
  text = text.replace(/[|—]+/g, ' ').replace(/\s+-\s+/g, ' ').replace(/\s+/g, ' ').trim();

  // If starts with long filler, strip conversational filler
  text = text.replace(/^(?:customer\s+wants\s+to\s+visit\s+(?:the\s+)?plot\s+because\s+(?:they\s+are\s+)?)/i, '');
  text = text.replace(/^(?:i\s+want\s+to\s+see\s+(?:the\s+)?)/i, '');
  text = text.replace(/^(?:i\s+(?:want|would\s+like)\s+to\s+visit\s+(?:the\s+)?)/i, '');
  text = text.replace(/^(?:please\s+note\s+(?:that\s+)?)/i, '');

  const words = text.split(/\s+/).filter(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean && !/^(?:none|nil|na|null|undefined|-)$/i.test(clean);
  });

  if (!words.length) return '-';

  // If remaining words are purely residual generic intent/conjunction words
  if (words.every(w => /^(?:i|want|would|like|to|visit|site|plot|unit|property|booking|book|please|can|you|the|for|at|p\d+|v\d+|a\d+|and|or|a|an|my|full|name|email|phone|is|are|in|on|enquiry|enquire|send)$/i.test(w))) {
    return '-';
  }

  // Cap at 4-5 words maximum (Requirement 3 & 8)
  let cappedWords = words.slice(0, 5);
  let res = cappedWords.join(' ');

  // Strip leading/trailing dangling conjunctions
  res = res.replace(/^(?:and|or|the|a|an)\s+/i, '');
  res = res.replace(/\s+(?:and|or|the|a|an)$/i, '');

  // Remove trailing punctuation
  res = res.replace(/[.,;:]+$/, '').trim();

  if (!res) return '-';

  return res.charAt(0).toUpperCase() + res.slice(1);
}

function parseNumericPrice(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const s = String(val).trim();
  if (s.toLowerCase().includes('cr')) {
    const num = parseFloat(s.replace(/[^0-9.]/g, ''));
    return Math.round(num * 10000000);
  }
  if (s.toLowerCase().includes('l')) {
    const num = parseFloat(s.replace(/[^0-9.]/g, ''));
    return Math.round(num * 100000);
  }
  const clean = s.replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
}

function formatIndianCurrency(val) {
  const num = Number(val);
  if (isNaN(num) || num === 0) return '₹0';
  return '₹' + num.toLocaleString('en-IN');
}

function formatUnitLabel(code, project, title) {
  if (!code || code === '—') return title || 'General Enquiry';
  const pStr = String(project || '').toLowerCase();
  const cStr = String(code).trim();
  const cUp = cStr.toUpperCase();

  if (pStr.includes('villa') || cUp.startsWith('V')) {
    return cUp.startsWith('VILLA') ? cStr : `Villa ${cStr}`;
  }
  if (pStr.includes('height') || pStr.includes('tower') || pStr.includes('apt') || pStr.includes('apartment') || cUp.startsWith('A-') || cUp.startsWith('B-')) {
    return cUp.startsWith('UNIT') ? cStr : `Unit ${cStr}`;
  }
  if (pStr.includes('farm') || pStr.includes('agro') || cUp.startsWith('F-')) {
    if (title && !title.startsWith('Plot') && !title.startsWith('Villa')) return title;
    if (cUp === 'F-GREEN-VALLEY') return 'Green Valley Farms';
    if (cUp === 'F-NATURES-NEST') return "Nature's Nest";
    if (cUp === 'F-SIRI-AGRO') return 'Siri Agro Farms';
    return cStr;
  }
  if (cUp.startsWith('P') || !isNaN(cUp)) {
    return cUp.startsWith('PLOT') ? cStr : `Plot ${cStr}`;
  }
  return title || cStr;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function api(path, opt = {}) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const r = await fetch(url, {
    ...opt,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CRM-Key': key,
      ...(opt.headers || {})
    }
  });
  const p = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(p?.error?.message || 'CRM request failed.');
  return p.data;
}

function syncPlotOverride(propertyId, status) {
  try {
    const overrides = JSON.parse(localStorage.getItem('vr_plot_status_overrides') || '{}');
    const normalized = status.toLowerCase() === 'hold' ? 'reserved' : status.toLowerCase();
    overrides[propertyId] = normalized;
    localStorage.setItem('vr_plot_status_overrides', JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('vr_plot_status_changed', { detail: { propertyId, status: normalized } }));
  } catch (e) {
    console.warn('[crm] syncPlotOverride error:', e);
  }
}

function login(root, msg = '') {
  root.innerHTML = `
    <main class="crm-shell crm-login">
      <div class="crm-login-card">
        <div class="crm-brand">Real Estate Brothers group</div>
        <h1>Sales CRM</h1>
        <p>Private workspace for enquiries, WhatsApp conversations, site visits, bookings and inventory.</p>
        ${msg ? `<div class="crm-error">${esc(msg)}</div>` : ''}
        <form id="crm-login-form">
          <label>CRM access key
            <input id="crm-key" type="password" required autocomplete="current-password" placeholder="Enter CRM key (123456)">
          </label>
          <button class="crm-primary">Open CRM</button>
        </form>
        <a class="crm-back" href="#/">← Back to website</a>
      </div>
    </main>
  `;
  document.getElementById('crm-login-form').onsubmit = async (e) => {
    e.preventDefault();
    key = document.getElementById('crm-key').value.trim();
    try {
      await api('/api/crm/summary');
      sessionStorage.setItem('vr_crm_key', key);
      await load();
      render();
      start();
    } catch (x) {
      key = '';
      login(root, x.message);
    }
  };
}

function shell(bodyContent) {
  const nav = [
    ['overview', 'Overview', '▦'],
    ['enquiries', 'Enquiries', '✉'],
    ['inbox', 'WhatsApp Inbox', '◌'],
    ['visits', 'Site Visits', '⌖'],
    ['inventory', 'Inventory', '▤'],
    ['bookings', 'Bookings', '✓'],
    ['reviews', 'Reviews', '★'],
    ['reminders', 'Reminders', '⏰']
  ];

  const descMap = {
    overview: 'A single view of sales activity and performance.',
    enquiries: 'Customer enquiries from website contact forms, WhatsApp, and AI chatbot.',
    inbox: 'Manage WhatsApp customer conversations and AI handoff.',
    visits: 'Review site visit requests. Confirming a visit NEVER modifies plot inventory.',
    inventory: 'Interactive Master Plan and live plot status control with full manual owner authority.',
    bookings: 'Track confirmed plot bookings, advance payments, and customer records.',
    reviews: 'Manage and approve customer reviews and Google ratings displayed on the public website.',
    reminders: 'Configure automated WhatsApp site visit reminder rules.'
  };

  const pendingEnquiriesCount = S.enquiries.filter((e) => (e.status || 'NEW') === 'NEW' || e.status === 'PENDING').length;
  const pendingReviewsCount = S.reviews.filter((r) => r.status === 'PENDING' || r.status === 'NEEDS ATTENTION' || r.status === 'NEW').length;

  return `
    <main class="crm-app">
      <div class="crm-sidebar-backdrop" id="crm-sidebar-backdrop"></div>
      <aside class="crm-sidebar" id="crm-sidebar">
        <div class="crm-side-brand">
          <img src="/images/vr-logo.png" alt="Logo" class="crm-logo-img" />
          <div>
            <b>Real Estate Brothers group</b>
            <span>Sales CRM</span>
          </div>
        </div>
        <nav>
          ${nav.map((n) => `
            <button class="crm-nav ${S.tab === n[0] ? 'active' : ''}" data-tab="${n[0]}">
              <i>${n[2]}</i>
              <span>${n[1]}</span>
              ${n[0] === 'visits' && S.summary?.siteVisitRequests ? `<em>${S.summary.siteVisitRequests}</em>` : ''}
              ${n[0] === 'enquiries' && pendingEnquiriesCount ? `<em>${pendingEnquiriesCount}</em>` : ''}
              ${n[0] === 'reviews' && pendingReviewsCount ? `<em>${pendingReviewsCount}</em>` : ''}
            </button>
          `).join('')}
        </nav>
        <div class="crm-side-footer">
          <div class="crm-secure">● CRM secure</div>
          <button id="crm-logout">Logout</button>
          <a href="#/">Open website</a>
        </div>
      </aside>
      <section class="crm-main">
        <header class="crm-header">
          <div class="crm-header-title-wrap">
            <button class="crm-menu-toggle" id="crm-menu-toggle" aria-label="Toggle Navigation">☰</button>
            <div>
              <div class="crm-eyebrow">Real Estate Brothers group · OPERATIONS</div>
              <h1>${label(S.tab)}</h1>
              <p>${descMap[S.tab] || 'Manage operations'}</p>
            </div>
          </div>
          <div class="crm-header-actions">
            <button class="crm-icon-btn" id="refresh" title="Refresh data">↻</button>
            <span class="crm-sync">● Live</span>
          </div>
        </header>
        ${bodyContent}
      </section>
      ${renderPlotDrawerHtml()}
    </main>
  `;
}

function stat(t, v, m, i) {
  return `
    <article class="crm-stat">
      <div class="crm-stat-icon">${i}</div>
      <div>
        <span>${t}</span>
        <strong>${v}</strong>
        <small>${m}</small>
      </div>
    </article>
  `;
}

function overview() {
  const s = S.summary || {};
  const i = s.inventory || {};
  const totalEnquiriesCount = s.totalEnquiries || S.enquiries.length;
  const newEnquiriesCount = s.newEnquiries || S.enquiries.filter((e) => (e.status || 'NEW') === 'NEW' || e.status === 'PENDING').length;
  const pendingVisitsCount = s.siteVisitRequests || S.visits.filter((v) => v.status === 'REQUESTED' || v.status === 'PENDING').length;
  const confirmedVisitsCount = s.confirmedVisits || S.visits.filter((v) => v.status === 'CONFIRMED').length;
  const confirmedBookingsCount = s.totalBookings || s.bookings || S.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'BOOKED').length;

  return `
    <div class="crm-stats">
      ${stat('Customer Enquiries', totalEnquiriesCount, `${newEnquiriesCount} pending review`, '✉')}
      ${stat('Pending Site Visits', pendingVisitsCount, 'awaiting confirmation', '⌖')}
      ${stat('Confirmed Visits', confirmedVisitsCount, 'scheduled with customers', '✓')}
      ${stat('Confirmed Bookings', confirmedBookingsCount, 'units booked', '★')}
    </div>
    <div class="crm-overview-grid">
      <section class="crm-card">
        <div class="crm-card-head">
          <div>
            <h2>Inventory Availability</h2>
            <p>Database source of truth across ventures</p>
          </div>
          <button class="crm-link" data-go="inventory">Manage Master Plan →</button>
        </div>
        <div class="crm-inventory-summary">
          ${[
            ['available', i.available || 0],
            ['hold', (i.hold || 0) + (i.reserved || 0)],
            ['booked', i.booked || 0],
            ['sold', i.sold || 0]
          ].map((x) => `
            <div>
              <strong>${x[1]}</strong>
              <span>${label(x[0])}</span>
            </div>
          `).join('')}
        </div>
      </section>
      <section class="crm-card">
        <div class="crm-card-head">
          <div>
            <h2>Operational Overview</h2>
            <p>Live integrations &amp; operational metrics</p>
          </div>
          <button class="crm-link" data-go="inbox">Open Inbox →</button>
        </div>
        <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">WhatsApp Active</span>
            <div style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 4px;">${s.openConversations || 0}</div>
            <small style="color: #10b981; font-weight: 500;">Connected via Cloud API</small>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Reviews Pending</span>
            <div style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 4px;">${s.pendingReviews || 0}</div>
            <small style="color: #f59e0b; font-weight: 500;">Awaiting approval</small>
          </div>
        </div>
      </section>
    </div>
  `;
}

function enquiries() {
  const q = S.search.toLowerCase();
  const activeEnqs = S.enquiries.filter((e) => e.status !== 'CANCEL' && e.status !== 'BOOKED');
  const cancelledEnqs = S.enquiries.filter((e) => e.status === 'CANCEL');

  const targetList = S.enquiryFilter === 'cancelled' ? cancelledEnqs : activeEnqs;
  const rows = targetList.filter((e) => {
    if (q && ![e.name, e.phone, e.email, e.project, e.property, e.notes, e.status].some((v) => String(v || '').toLowerCase().includes(q))) return false;
    return true;
  });

  return `
    <div class="crm-toolbar">
      <div class="crm-search">
        <span>⌕</span>
        <input id="enquiry-search" value="${esc(S.search)}" placeholder="Search customer, phone, property or enquiry message…">
      </div>
      <div class="crm-filter-pills">
        <button class="crm-filter-pill ${S.enquiryFilter === 'active' ? 'active' : ''}" data-enquiry-filter="active">
          Active Enquiries (${activeEnqs.length})
        </button>
        <button class="crm-filter-pill ${S.enquiryFilter === 'cancelled' ? 'active' : ''}" data-enquiry-filter="cancelled">
          Cancelled Enquiries (${cancelledEnqs.length})
        </button>
      </div>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>${rows.length} ${S.enquiryFilter === 'cancelled' ? 'Cancelled' : 'Active'} Enquiries</h2>
          <p>${S.enquiryFilter === 'cancelled' ? 'Enquiries marked as cancelled. You can restore or archive them.' : 'Customer enquiry submissions from Website, WhatsApp & AI Chatbot. Action: Book plot with financial breakdown or Cancel.'}</p>
        </div>
      </div>
      
      <!-- Desktop Table (Hidden on <=768px) -->
      <div class="crm-desktop-table crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Project / Property</th>
              <th>Customer Notes</th>
              <th>Source</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="enquiries-table-body">
            ${renderEnquiryRows(rows)}
          </tbody>
        </table>
      </div>

      <!-- Mobile Responsive Cards (Visible on <=768px) -->
      <div class="crm-mobile-cards" id="enquiries-mobile-cards" style="padding: 12px;">
        ${renderEnquiryCards(rows)}
      </div>
    </section>
  `;
}

function renderEnquiryRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="8"><div class="crm-empty">No enquiries match your search.</div></td></tr>`;
  }
  return rows.map((e) => {
    const isBooked = e.status === 'BOOKED';
    const isCancel = e.status === 'CANCEL';
    const cleanNotes = cleanEnquiryNotes(e.notes);

    return `
      <tr>
        <td>
          <div class="crm-person">
            <span>${initials(e.name)}</span>
            <div>
              <b>${esc(e.name || 'Unknown')}</b>
            </div>
          </div>
        </td>
        <td>
          <a href="https://wa.me/${String(e.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
            ${esc(e.phone || '—')} 💬
          </a>
        </td>
        <td>${esc(e.email || '—')}</td>
        <td>
          <b>${esc(e.project || 'VR Green Meadows')}</b>
          <small class="crm-cell-sub">${esc(formatUnitLabel(e.property, e.project))}</small>
        </td>
        <td style="max-width: 280px; white-space: normal; line-height: 1.45;">
          ${esc(cleanNotes)}
        </td>
        <td>
          <span class="crm-badge">${esc(e.source || 'Website')}</span>
        </td>
        <td>
          <span class="crm-badge ${isBooked ? 'status-booked' : isCancel ? 'status-cancelled' : 'status-hold'}">
            ${isBooked ? 'BOOKED' : isCancel ? 'CANCEL' : 'PENDING'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${isBooked ? `
              <span style="font-size: 11px; color: #16a34a; font-weight: 700;">✓ Confirmed</span>
            ` : isCancel ? `
              <button class="crm-action success" data-enquiry-restore="${e.id}" title="Restore to Active">↺ Restore</button>
              <button class="crm-action danger" data-enquiry-remove="${e.id}" title="Archive Permanently">🗑 Archive</button>
            ` : `
              <button class="crm-action success" data-enquiry-book="${e.id}" title="Book Plot &amp; Update Website">✓ Book</button>
              <button class="crm-action danger" data-enquiry-cancel="${e.id}" title="Cancel Enquiry">✕ Cancel</button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderEnquiryCards(rows) {
  if (!rows.length) {
    return `<div class="crm-empty">No enquiries match your search.</div>`;
  }
  return rows.map((e) => {
    const isBooked = e.status === 'BOOKED';
    const isCancel = e.status === 'CANCEL';
    const cleanNotes = cleanEnquiryNotes(e.notes);

    return `
      <div class="crm-record-card">
        <div class="crm-record-head">
          <div class="crm-record-head-info">
            <span class="crm-avatar">${initials(e.name)}</span>
            <div>
              <b style="font-size: 14px; color: #173f2c;">${esc(e.name || 'Unknown')}</b>
              <small class="crm-cell-sub">${esc(e.email || 'No email')}</small>
            </div>
          </div>
          <span class="crm-badge ${isBooked ? 'status-booked' : isCancel ? 'status-cancelled' : 'status-hold'}">
            ${isBooked ? 'BOOKED' : isCancel ? 'CANCEL' : 'PENDING'}
          </span>
        </div>
        <div class="crm-record-body">
          <div class="crm-record-row">
            <span class="crm-record-row-label">Phone:</span>
            <span class="crm-record-row-val">
              <a href="https://wa.me/${String(e.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
                ${esc(e.phone || '—')} 💬
              </a>
            </span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Project / Unit:</span>
            <span class="crm-record-row-val">
              ${esc(e.project || 'VR Green Meadows')} · <b>${esc(formatUnitLabel(e.property, e.project))}</b>
            </span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Source:</span>
            <span class="crm-record-row-val"><span class="crm-badge">${esc(e.source || 'Website')}</span></span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Notes:</span>
            <span class="crm-record-row-val" style="font-weight: normal; color: #4b5563;">
              ${esc(cleanNotes)}
            </span>
          </div>
        </div>
        <div class="crm-record-actions">
          ${isBooked ? `
            <span style="font-size: 12px; color: #16a34a; font-weight: 700; padding: 6px;">✓ Confirmed Booking</span>
          ` : isCancel ? `
            <button class="crm-action success" data-enquiry-restore="${e.id}" title="Restore to Active">↺ Restore</button>
            <button class="crm-action danger" data-enquiry-remove="${e.id}" title="Archive Permanently">🗑 Archive</button>
          ` : `
            <button class="crm-action success" data-enquiry-book="${e.id}" title="Book Plot &amp; Update Website">✓ Book</button>
            <button class="crm-action danger" data-enquiry-cancel="${e.id}" title="Cancel Enquiry">✕ Cancel</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function inbox() {
  const c = S.conversations.find((x) => x.id === S.active) || S.conversations[0];
  if (c && !S.active) S.active = c.id;
  const lead = c?.leads;
  return `
    <div class="crm-inbox">
      <section class="crm-card crm-chat-list">
        <div class="crm-card-head">
          <div>
            <h2>Conversations</h2>
            <p>${S.conversations.length} threads</p>
          </div>
        </div>
        <div class="crm-conversation-list">
          ${S.conversations.map((x) => `
            <button class="crm-conversation ${S.active === x.id ? 'active' : ''}" data-conversation="${x.id}">
              <span class="crm-avatar">${initials(x.leads?.name || x.phone)}</span>
              <div>
                <b>${esc(x.leads?.name || x.phone)}</b>
                <small>${esc(x.phone)}</small>
                <em>${date(x.last_message_at)}</em>
              </div>
              <i class="${x.status === 'open' ? 'open' : ''}"></i>
            </button>
          `).join('') || `<div class="crm-empty">No WhatsApp conversations yet.</div>`}
        </div>
      </section>
      <section class="crm-card crm-chat">
        <div class="crm-chat-head">
          ${c ? `
            <div class="crm-person">
              <span>${initials(lead?.name || c.phone)}</span>
              <div>
                <b>${esc(lead?.name || c.phone)}</b>
                <small>${esc(c.phone)} · ${label(c.status)}</small>
              </div>
            </div>
            <div class="crm-chat-actions">
              <label class="crm-toggle">
                <input id="ai-toggle" type="checkbox" ${c.ai_enabled ? 'checked' : ''}>
                <span></span> AI
              </label>
              <button id="toggle-chat" class="crm-small-btn">${c.status === 'open' ? 'Close' : 'Reopen'}</button>
            </div>
          ` : '<h2>Select a conversation</h2>'}
        </div>
        <div id="chat-messages" class="crm-chat-messages">
          ${c ? (S.messages.length ? S.messages.map((m) => `
            <div class="crm-message ${m.direction === 'outbound' ? 'outbound' : 'inbound'}">
              <div>${esc(m.body || `[${m.message_type}]`)}</div>
              <small>${date(m.created_at)}</small>
            </div>
          `).join('') : `<div class="crm-empty">No messages.</div>`) : `<div class="crm-empty">Select a customer.</div>`}
        </div>
        ${c ? `
          <form id="chat-form" class="crm-composer">
            <textarea id="chat-input" rows="2" placeholder="Type a WhatsApp reply…"></textarea>
            <button class="crm-primary">Send</button>
          </form>
        ` : ''}
      </section>
      <aside class="crm-card crm-contact-card">
        ${c ? `
          <div class="crm-card-head">
            <div>
              <h2>Customer</h2>
              <p>Contact details</p>
            </div>
          </div>
          <div class="crm-contact">
            <div class="crm-big-avatar">${initials(lead?.name || c.phone)}</div>
            <h3>${esc(lead?.name || 'Unknown')}</h3>
            <p>${esc(lead?.phone || c.phone)}</p>
            <p>${esc(lead?.email || 'No email')}</p>
            <span class="crm-badge ${cls(lead?.status || 'new')}">${label(lead?.status || 'new')}</span>
          </div>
          <div class="crm-contact-meta">
            <div><span>Source</span><b>${esc(lead?.source || 'whatsapp')}</b></div>
            <div><span>AI</span><b>${c.ai_enabled ? 'Enabled' : 'Human only'}</b></div>
            <div><span>Notes</span><b>${esc(lead?.notes || 'No notes')}</b></div>
          </div>
        ` : `<div class="crm-empty">Customer details appear here.</div>`}
      </aside>
    </div>
  `;
}

function visits() {
  const q = S.search.toLowerCase();
  const rows = S.visits.filter((v) => {
    if (S.visitFilter !== 'ALL') {
      if (S.visitFilter === 'PENDING' && v.status !== 'REQUESTED' && v.status !== 'PENDING') return false;
      if (S.visitFilter !== 'PENDING' && v.status !== S.visitFilter) return false;
    }
    if (q) {
      const cust = v.leads?.name || '';
      const phone = v.leads?.phone || '';
      const email = v.leads?.email || '';
      const proj = v.properties?.projects?.name || v.properties?.title || '';
      const code = v.properties?.property_code || '';
      const notes = v.notes || '';
      const cNote = cleanVisitNote(v.notes);
      if (![cust, phone, email, proj, code, notes, cNote].some((val) => val.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return `
    <div class="crm-toolbar">
      <div class="crm-search">
        <span>⌕</span>
        <input id="visit-search" value="${esc(S.search)}" placeholder="Search visitor name, phone, plot, or notes…">
      </div>
      <select id="visit-filter">
        <option value="ALL">All visit statuses</option>
        <option value="PENDING" ${S.visitFilter === 'PENDING' ? 'selected' : ''}>Pending Review</option>
        <option value="CONFIRMED" ${S.visitFilter === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
        <option value="RESCHEDULED" ${S.visitFilter === 'RESCHEDULED' ? 'selected' : ''}>Rescheduled</option>
        <option value="COMPLETED" ${S.visitFilter === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        <option value="CANCELLED" ${S.visitFilter === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
        <option value="BOOKED" ${S.visitFilter === 'BOOKED' ? 'selected' : ''}>Booked</option>
      </select>
      <button class="crm-primary" id="add-visit">+ Add Site Visit</button>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>${rows.length} Site Visits</h2>
          <p>Site visit appointments only (plot remains AVAILABLE). When customer decides to purchase, click Book to confirm booking.</p>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="crm-desktop-table crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Project</th>
              <th>Plot / Property</th>
              <th>Date</th>
              <th>Time</th>
              <th>Notes</th>
              <th>Source</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="visits-table-body">
            ${renderVisitRows(rows)}
          </tbody>
        </table>
      </div>

      <!-- Mobile Responsive Cards -->
      <div class="crm-mobile-cards" id="visits-mobile-cards" style="padding: 12px;">
        ${renderVisitCards(rows)}
      </div>
    </section>
  `;
}

function renderVisitRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="11"><div class="crm-empty">No site visits match this filter.</div></td></tr>`;
  }
  return rows.map((v) => {
    const src = v.source || (v.notes && v.notes.includes('WhatsApp') ? 'WhatsApp AI' : (v.notes && v.notes.includes('Offline') ? 'Offline' : 'Website'));
    const displayStatus = v.status === 'REQUESTED' ? 'PENDING' : v.status;
    const statusClass = displayStatus === 'PENDING' ? 'status-hold' : cls(v.status);

    let visitDate = '—';
    let visitTime = 'Anytime';
    if (v.scheduled_at) {
      const d = new Date(v.scheduled_at);
      if (!Number.isNaN(d.getTime())) {
        visitDate = d.toLocaleDateString('en-IN', { dateStyle: 'medium' });
        visitTime = d.toLocaleTimeString('en-IN', { timeStyle: 'short' });
      }
    }

    return `
      <tr>
        <td>
          <div class="crm-person">
            <span>${initials(v.leads?.name)}</span>
            <div>
              <b>${esc(v.leads?.name || 'Unknown')}</b>
            </div>
          </div>
        </td>
        <td>
          <a href="https://wa.me/${String(v.leads?.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
            ${esc(v.leads?.phone || '—')} 💬
          </a>
        </td>
        <td>${esc(v.leads?.email || '—')}</td>
        <td><b>${esc(v.properties?.projects?.name || 'VR Green Meadows')}</b></td>
        <td>
          <b>${esc(formatUnitLabel(v.properties?.property_code, v.properties?.projects?.name, v.properties?.title))}</b>
        </td>
        <td>${esc(visitDate)}</td>
        <td><b>${esc(visitTime)}</b></td>
        <td style="max-width: 180px; white-space: normal; font-size: 13px; line-height: 1.35;" title="${esc(v.notes || '')}">${esc(cleanVisitNote(v.notes))}</td>
        <td>
          <span class="crm-badge" style="${src === 'WhatsApp AI' ? 'background:#dcfce7; color:#15803d;' : src === 'Offline' ? 'background:#fef3c7; color:#92400e;' : 'background:#e0f2fe; color:#0369a1;'}">
            ${esc(src)}
          </span>
        </td>
        <td><span class="crm-badge ${statusClass}">${displayStatus}</span></td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${v.status === 'REQUESTED' || v.status === 'PENDING' || v.status === 'RESCHEDULED' ? `
              <button class="crm-action success" data-confirm-visit="${v.id}" title="Confirm site visit &amp; send WhatsApp to customer">✓ Confirm</button>
              <button class="crm-action" data-visit-book="${v.id}" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd;" title="Customer booked this plot">★ Book</button>
              <button class="crm-action danger" data-cancel-visit="${v.id}" title="Cancel site visit">✕ Cancel</button>
            ` : v.status === 'CONFIRMED' ? `
              <button class="crm-action" data-visit-book="${v.id}" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd;" title="Customer booked this plot">★ Book</button>
              <button class="crm-action" data-complete-visit="${v.id}">Complete</button>
              <button class="crm-action" data-reschedule-visit="${v.id}">Reschedule</button>
              <button class="crm-action danger" data-cancel-visit="${v.id}">Cancel</button>
            ` : v.status === 'COMPLETED' ? `
              <button class="crm-action" data-send-feedback-visit="${v.id}" style="background: #f0fdf4; color: #166534; border: 1px solid #86efac; font-weight: 600;" title="Send customer feedback link via WhatsApp">★ Send Feedback</button>
            ` : v.status === 'BOOKED' ? `
              <button class="crm-action" data-send-feedback-visit="${v.id}" style="background: #f0fdf4; color: #166534; border: 1px solid #86efac; font-weight: 600;" title="Send customer feedback link via WhatsApp">★ Send Feedback</button>
              <span style="font-size: 11px; color: #16a34a; font-weight: 700; align-self: center;">✓ Booked</span>
            ` : '—'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderVisitCards(rows) {
  if (!rows.length) {
    return `<div class="crm-empty">No site visits match this filter.</div>`;
  }
  return rows.map((v) => {
    const src = v.source || (v.notes && v.notes.includes('WhatsApp') ? 'WhatsApp AI' : (v.notes && v.notes.includes('Offline') ? 'Offline' : 'Website'));
    const displayStatus = v.status === 'REQUESTED' ? 'PENDING' : v.status;
    const statusClass = displayStatus === 'PENDING' ? 'status-hold' : cls(v.status);

    let visitDate = '—';
    let visitTime = 'Anytime';
    if (v.scheduled_at) {
      const d = new Date(v.scheduled_at);
      if (!Number.isNaN(d.getTime())) {
        visitDate = d.toLocaleDateString('en-IN', { dateStyle: 'medium' });
        visitTime = d.toLocaleTimeString('en-IN', { timeStyle: 'short' });
      }
    }

    return `
      <div class="crm-record-card">
        <div class="crm-record-head">
          <div class="crm-record-head-info">
            <span class="crm-avatar">${initials(v.leads?.name)}</span>
            <div>
              <b style="font-size: 14px; color: #173f2c;">${esc(v.leads?.name || 'Unknown')}</b>
              <small class="crm-cell-sub">${esc(v.leads?.email || 'No email')}</small>
            </div>
          </div>
          <span class="crm-badge ${statusClass}">${displayStatus}</span>
        </div>
        <div class="crm-record-body">
          <div class="crm-record-row">
            <span class="crm-record-row-label">Phone:</span>
            <span class="crm-record-row-val">
              <a href="https://wa.me/${String(v.leads?.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
                ${esc(v.leads?.phone || '—')} 💬
              </a>
            </span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Plot / Unit:</span>
            <span class="crm-record-row-val">
              ${esc(v.properties?.projects?.name || 'VR Green Meadows')} · <b>${esc(formatUnitLabel(v.properties?.property_code, v.properties?.projects?.name, v.properties?.title))}</b>
            </span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Date &amp; Time:</span>
            <span class="crm-record-row-val">${esc(visitDate)} · ${esc(visitTime)}</span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Source:</span>
            <span class="crm-record-row-val"><span class="crm-badge">${esc(src)}</span></span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Notes:</span>
            <span class="crm-record-row-val" style="font-weight: normal; color: #4b5563;" title="${esc(v.notes || '')}">${esc(cleanVisitNote(v.notes))}</span>
          </div>
        </div>
        <div class="crm-record-actions">
          ${v.status === 'REQUESTED' || v.status === 'PENDING' || v.status === 'RESCHEDULED' ? `
            <button class="crm-action success" data-confirm-visit="${v.id}" title="Confirm site visit &amp; send WhatsApp">✓ Confirm</button>
            <button class="crm-action" data-visit-book="${v.id}" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd;" title="Customer booked this plot">★ Book</button>
            <button class="crm-action danger" data-cancel-visit="${v.id}">✕ Cancel</button>
          ` : v.status === 'CONFIRMED' ? `
            <button class="crm-action" data-visit-book="${v.id}" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd;" title="Customer booked this plot">★ Book</button>
            <button class="crm-action" data-complete-visit="${v.id}">Complete</button>
            <button class="crm-action danger" data-cancel-visit="${v.id}">Cancel</button>
          ` : v.status === 'COMPLETED' ? `
            <button class="crm-action" data-send-feedback-visit="${v.id}" style="background: #f0fdf4; color: #166534; border: 1px solid #86efac; font-weight: 600;" title="Send customer feedback link via WhatsApp">★ Send Feedback</button>
          ` : v.status === 'BOOKED' ? `
            <button class="crm-action" data-send-feedback-visit="${v.id}" style="background: #f0fdf4; color: #166534; border: 1px solid #86efac; font-weight: 600;" title="Send customer feedback link via WhatsApp">★ Send Feedback</button>
            <span style="font-size: 12px; color: #16a34a; font-weight: 700; padding: 6px;">✓ Booked</span>
          ` : '—'}
        </div>
      </div>
    `;
  }).join('');
}

function inventory() {
  const currentProj = CRM_PROJECTS.find((p) => p.slug === S.selectedProject) || CRM_PROJECTS[0];
  const rows = S.inventory.filter((p) => {
    if (S.inventoryFilter !== 'ALL') {
      const matchStatus = S.inventoryFilter === 'HOLD'
        ? (p.inventory_status === 'HOLD' || p.inventory_status === 'RESERVED')
        : p.inventory_status === S.inventoryFilter;
      if (!matchStatus) return false;
    }
    return true;
  });

  return `
    <div class="crm-project-pills">
      ${CRM_PROJECTS.map((p) => `
        <button class="crm-project-pill ${S.selectedProject === p.slug ? 'active' : ''}" data-crm-project="${p.slug}">
          ${p.name}
        </button>
      `).join('')}
    </div>

    <div class="crm-toolbar">
      <select id="inventory-filter">
        <option value="ALL">All Statuses</option>
        ${['AVAILABLE', 'HOLD', 'BOOKED', 'SOLD', 'BLOCKED'].map((x) => `<option value="${x}" ${S.inventoryFilter === x ? 'selected' : ''}>${label(x)}</option>`).join('')}
      </select>
      <div class="crm-view-switch">
        <button class="crm-view-btn ${S.inventoryViewMode === 'plan' ? 'active' : ''}" data-inv-view="plan">🖼 Master Plan</button>
        <button class="crm-view-btn ${S.inventoryViewMode === 'table' ? 'active' : ''}" data-inv-view="table">📋 Table View</button>
      </div>
      <button class="crm-primary" id="add-offline-booking">+ Add Offline Customer</button>
      <button class="crm-icon-btn" id="inventory-refresh" title="Refresh Inventory">↻</button>
    </div>

    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>${currentProj.name}</h2>
          <p>Click any plot to view customer details, edit listed price, record offline bookings, and control manual status with <strong>no automatic hold expiry</strong>.</p>
        </div>
      </div>

      ${S.inventoryViewMode === 'plan' ? renderMasterPlanView(currentProj) : renderInventoryTableView(rows)}
    </section>
  `;
}

function renderMasterPlanView(proj) {
  let overrides = {};
  try {
    overrides = JSON.parse(localStorage.getItem('vr_plot_status_overrides') || '{}');
  } catch (e) { }

  if (proj.slug === 'vr-green-meadows') {
    const plots = GREEN_MEADOWS_PLOTS.map((base) => {
      const inv = S.inventory.find((x) => x.property_code === base.id || x.title?.includes(base.id));
      const override = overrides[base.id];
      const effStatus = override ? override.toLowerCase() : (inv ? inv.inventory_status.toLowerCase() : 'available');
      return {
        ...base,
        status: effStatus,
        price: inv?.price ? '₹' + Number(inv.price).toLocaleString('en-IN') : base.price,
        size: inv?.area || base.size
      };
    });

    return `
      <div class="crm-masterplan-box">
        ${renderMasterPlanSvg(plots, S.selectedPlotId, 'crm-mp')}
        <div class="crm-masterplan-legend">
          <div class="crm-legend-item"><span class="crm-legend-dot avail"></span> Available</div>
          <div class="crm-legend-item"><span class="crm-legend-dot hold"></span> Hold / Reserved (Manual)</div>
          <div class="crm-legend-item"><span class="crm-legend-dot booked"></span> Booked</div>
          <div class="crm-legend-item"><span class="crm-legend-dot sold"></span> Sold</div>
          <div class="crm-legend-item"><span class="crm-legend-dot blocked"></span> Blocked</div>
          <span style="margin-left: auto; font-size: 11px; color: #6b7280;">💡 Click any plot to open details</span>
        </div>
      </div>
    `;
  }

  if (proj.slug === 'vr-luxury-villas') {
    const villas = LUXURY_VILLAS.map((base) => {
      const inv = S.inventory.find((x) => x.property_code?.toLowerCase() === base.id.toLowerCase());
      const override = overrides[base.id];
      const effStatus = override ? override.toLowerCase() : (inv ? inv.inventory_status.toLowerCase() : 'available');
      return {
        ...base,
        status: effStatus
      };
    });

    return `
      <div class="crm-masterplan-box">
        ${renderMasterPlanSvgCode(villas, S.selectedPlotId)}
        <div class="crm-masterplan-legend">
          <div class="crm-legend-item"><span class="crm-legend-dot avail"></span> Available</div>
          <div class="crm-legend-item"><span class="crm-legend-dot hold"></span> Hold / On-Hold</div>
          <div class="crm-legend-item"><span class="crm-legend-dot booked"></span> Booked</div>
          <div class="crm-legend-item"><span class="crm-legend-dot sold"></span> Sold</div>
          <span style="margin-left: auto; font-size: 11px; color: #6b7280;">💡 Click any villa to open details</span>
        </div>
      </div>
    `;
  }

  const items = S.inventory.filter((x) => x.projects?.slug === proj.slug || !x.projects?.slug);
  return `
    <div style="padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px;">
      ${items.map((p) => `
        <div class="crm-card" style="padding: 16px; border-radius: 12px; cursor: pointer; border: 2px solid ${p.property_code === S.selectedPlotId ? '#0284C7' : '#e2e8e0'};" data-open-plot="${p.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <b style="font-size: 16px; color: #123b2a;">${esc(p.property_code)}</b>
            <span class="crm-badge ${cls(p.inventory_status)}">${label(p.inventory_status)}</span>
          </div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">${esc(p.title || proj.name)}</div>
          <div style="font-weight: 700; font-size: 13px; color: #173f2c;">${p.area ? `${p.area} ${p.area_unit || 'Sq.Yds'}` : '—'}</div>
        </div>
      `).join('') || `<div class="crm-empty">No properties in this project yet.</div>`}
    </div>
  `;
}

function renderInventoryTableView(rows) {
  return `
    <div class="crm-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Project</th>
            <th>Type</th>
            <th>Area</th>
            <th>Listed Price</th>
            <th>Status</th>
            <th>Active Customer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((p) => {
            const b = p.active_booking;
            return `
              <tr>
                <td>
                  <b>${esc(p.property_code)}</b>
                  <small class="crm-cell-sub">${esc(p.title || '')}</small>
                </td>
                <td>${esc(p.projects?.name || 'VR Green Meadows')}</td>
                <td>${esc(p.property_type || 'PLOT')}</td>
                <td>${p.area ? `${esc(p.area)} ${esc(p.area_unit || '')}` : '—'}</td>
                <td><b>${formatIndianCurrency(p.price)}</b></td>
                <td><span class="crm-badge ${cls(p.inventory_status)}">${label(p.inventory_status)}</span></td>
                <td>
                  ${b ? `
                    <b>${esc(b.customer_name || 'Customer')}</b>
                    <small class="crm-cell-sub">${esc(b.customer_phone || '')}</small>
                  ` : '<span class="crm-muted">Vacant</span>'}
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <button class="crm-small-btn" data-open-plot="${p.id}">Details</button>
                    ${p.inventory_status === 'AVAILABLE' || p.inventory_status === 'HOLD' || p.inventory_status === 'RESERVED' ? `
                      <button class="crm-small-btn" data-offline-book="${p.id}">+ Book</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join('') || `<tr><td colspan="8"><div class="crm-empty">No inventory found.</div></td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderPlotDrawerHtml() {
  const p = S.activePlotDetail;
  if (!p) return '';

  const status = p.inventory_status || 'AVAILABLE';
  const b = p.active_booking || S.bookings.find(
    (x) => (x.property_id === p.id || x.properties?.property_code === p.property_code) &&
           (x.status === 'CONFIRMED' || x.status === 'COMPLETED' || x.status === 'BOOKED')
  );
  const numericPrice = parseNumericPrice(p.price) || 3200000;

  return `
    <div class="crm-drawer-backdrop" id="crm-drawer-backdrop">
      <aside class="crm-drawer" id="crm-drawer">
        <div class="crm-drawer-head">
          <div>
            <div class="crm-eyebrow">PLOT INVENTORY RECORD</div>
            <h2>Plot ${esc(p.property_code)}</h2>
            <p style="margin: 2px 0 0; color: #6b7280; font-size: 12px;">${esc(p.projects?.name || 'VR Green Meadows')}</p>
          </div>
          <button class="crm-drawer-close" data-drawer-close>×</button>
        </div>

        <div class="crm-drawer-body">
          <div class="crm-drawer-badge-row">
            <span class="crm-badge ${cls(status)}" style="font-size: 12px; padding: 6px 14px;">
              ${label(status)}
            </span>
            <span style="font-size: 11px; color: #6b7280;">Manual Owner Control · No Auto Expiry</span>
          </div>

          <div class="crm-drawer-grid">
            <div>
              <span>Area</span>
              <strong>${p.area ? `${p.area} ${p.area_unit || 'Sq.Yds'}` : '200 Sq.Yds'}</strong>
            </div>
            <div>
              <span>Current Listed Price</span>
              <strong>${formatIndianCurrency(numericPrice)}</strong>
            </div>
            <div>
              <span>Facing</span>
              <strong>${p.facing || (p.property_code <= 'P06' ? 'East' : p.property_code <= 'P12' ? 'West' : 'North')}</strong>
            </div>
          </div>

          ${status === 'AVAILABLE' ? `
            <div class="crm-drawer-section">
              <h3>Owner Price Control</h3>
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 8px;">Edit official listed price. Updates website and master plan immediately.</p>
              <div style="display: flex; gap: 8px;">
                <input type="number" id="drawer-edit-price" value="${numericPrice}" style="flex: 1; padding: 8px 10px; border: 1px solid #dfe2dd; border-radius: 8px; font-size: 13px;">
                <button class="crm-primary" id="drawer-save-price" style="padding: 8px 14px;">Save Price</button>
              </div>
            </div>
          ` : ''}

          <!-- Customer Information & Complete Financial Breakdown -->
          ${b || status === 'BOOKED' || status === 'HOLD' || status === 'SOLD' ? `
            <div class="crm-drawer-section">
              <h3>Customer &amp; Financial Information</h3>
              <div class="crm-drawer-customer-card">
                <div class="crm-drawer-customer-row">
                  <span>Customer:</span>
                  <b>${esc(b?.customer_name || b?.leads?.name || 'Recorded Customer')}</b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Phone:</span>
                  <b>
                    <a href="https://wa.me/${String(b?.customer_phone || b?.leads?.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
                      ${esc(b?.customer_phone || b?.leads?.phone || '—')} 💬
                    </a>
                  </b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Email:</span>
                  <b>${esc(b?.customer_email || b?.leads?.email || '—')}</b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Source:</span>
                  <b class="crm-badge">${esc(b?.source || b?.leads?.source || 'Offline')}</b>
                </div>
                <div class="crm-drawer-customer-row" style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 4px;">
                  <span>Listed Price at Booking:</span>
                  <b>${formatIndianCurrency(b?.listed_price || p.price || numericPrice)}</b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Final Agreed Price:</span>
                  <b style="color: #173f2c; font-weight: 800;">${formatIndianCurrency(b?.final_price || numericPrice)}</b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Advance Amount Paid:</span>
                  <b style="color: #166534; font-weight: 800;">${formatIndianCurrency(b?.amount || b?.advance || 0)}</b>
                </div>
                <div class="crm-drawer-customer-row" style="border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                  <span style="color: #dc2626; font-weight: 700;">Remaining Balance:</span>
                  <b style="color: #dc2626; font-weight: 800;">${formatIndianCurrency(b?.remaining_amount != null ? b.remaining_amount : Math.max(0, (b?.final_price || numericPrice) - (b?.amount || 0)))}</b>
                </div>
                ${b?.booked_at ? `
                  <div class="crm-drawer-customer-row">
                    <span>Booking Date:</span>
                    <b>${date(b.booked_at)}</b>
                  </div>
                ` : ''}
                <div class="crm-drawer-customer-row">
                  <span>Notes:</span>
                  <b style="max-width: 260px; word-break: break-word;">${esc(b?.notes || 'No customer notes recorded')}</b>
                </div>
              </div>
            </div>
          ` : `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; color: #166534; font-size: 12px; line-height: 1.5;">
              ✓ <strong>Plot is currently AVAILABLE</strong> for immediate customer booking or hold.
            </div>
          `}

          <!-- Audit History Timeline -->
          <div class="crm-drawer-section">
            <h3>Audit History</h3>
            <div class="crm-history-list" id="drawer-history-list">
              ${S.plotHistory && S.plotHistory.length ? S.plotHistory.map((h) => `
                <div class="crm-history-item">
                  <b>${esc(h.from_status || 'INIT')} → ${esc(h.to_status)}</b>
                  <small>${date(h.created_at)} · ${esc(h.reason || 'Status update')}</small>
                </div>
              `).join('') : '<div style="color: #9ca3af; font-size: 11px;">No recorded transitions.</div>'}
            </div>
          </div>

          <!-- Owner Manual Status Actions -->
          <div class="crm-drawer-actions">
            ${status === 'AVAILABLE' ? `
              <button class="crm-primary" data-drawer-offline="${p.id}">+ Add Offline Customer</button>
              <button class="crm-small-btn" data-drawer-status="HOLD" style="background:#fef3c7; border-color:#f59e0b; color:#92400e;">Put on Hold (Manual)</button>
              <button class="crm-small-btn" data-drawer-status="BOOKED">Quick Book Plot</button>
              <button class="crm-small-btn" data-drawer-status="BLOCKED" style="color: #64748b;">Block Plot</button>
            ` : status === 'HOLD' || status === 'RESERVED' ? `
              <button class="crm-primary" data-drawer-status="BOOKED">Confirm / Book Plot</button>
              <button class="crm-small-btn" data-drawer-status="AVAILABLE" style="border-color: #22c55e; color: #15803d;">Release Hold (Mark Available)</button>
              <button class="crm-small-btn" data-drawer-status="BLOCKED">Block Plot</button>
            ` : status === 'BOOKED' ? `
              <button class="crm-primary" data-drawer-status="SOLD">Mark as Sold</button>
              <button class="crm-small-btn" data-drawer-status="AVAILABLE" style="border-color: #fca5a5; color: #dc2626;">Cancel Booking &amp; Release Plot</button>
              <button class="crm-small-btn" data-drawer-offline="${p.id}">Edit Customer Booking</button>
            ` : status === 'SOLD' ? `
              <button class="crm-small-btn" data-drawer-status="AVAILABLE" style="border-color: #fca5a5; color: #dc2626;">Release Plot (Reopen)</button>
            ` : `
              <button class="crm-small-btn" data-drawer-status="AVAILABLE" style="border-color: #22c55e; color: #15803d;">Unblock Plot (Mark Available)</button>
            `}
          </div>
        </div>
      </aside>
    </div>
  `;
}

function bookings() {
  const q = S.search.toLowerCase();
  const rows = S.bookings.filter((b) => {
    if (S.bookingFilter !== 'ALL' && b.status !== S.bookingFilter) return false;
    if (q) {
      const cust = b.leads?.name || '';
      const phone = b.leads?.phone || '';
      const email = b.leads?.email || '';
      const code = b.properties?.property_code || '';
      const proj = b.properties?.projects?.name || '';
      const ref = b.booking_reference || '';
      const notes = b.notes || '';
      if (![cust, phone, email, code, proj, ref, notes].some((val) => val.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return `
    <div class="crm-toolbar">
      <div class="crm-search">
        <span>⌕</span>
        <input id="booking-search" value="${esc(S.search)}" placeholder="Search booking reference, customer, phone, plot…">
      </div>
      <select id="booking-filter">
        <option value="ALL">All confirmed bookings</option>
        <option value="CONFIRMED" ${S.bookingFilter === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
        <option value="COMPLETED" ${S.bookingFilter === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        <option value="CANCELLED" ${S.bookingFilter === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
      </select>
      <button class="crm-primary" id="add-booking">+ Add Booking</button>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>${rows.length} Confirmed Bookings</h2>
          <p>Central record of confirmed property bookings. Plot inventory is synchronized immediately.</p>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="crm-desktop-table crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Project</th>
              <th>Plot / Property</th>
              <th>Financial Breakdown</th>
              <th>Booking Date</th>
              <th>Source</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="bookings-table-body">
            ${renderBookingRows(rows)}
          </tbody>
        </table>
      </div>

      <!-- Mobile Responsive Cards -->
      <div class="crm-mobile-cards" id="bookings-mobile-cards" style="padding: 12px;">
        ${renderBookingCards(rows)}
      </div>
    </section>
  `;
}

function renderBookingRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="10"><div class="crm-empty">No confirmed bookings found.</div></td></tr>`;
  }
  return rows.map((b) => {
    const src = b.leads?.source || (b.notes && b.notes.includes('Offline') ? 'Offline' : (b.notes && b.notes.includes('Enquiry') ? 'Website Enquiry' : 'Website'));
    return `
      <tr>
        <td>
          <div class="crm-person">
            <span>${initials(b.leads?.name)}</span>
            <div>
              <b>${esc(b.leads?.name || 'Unknown')}</b>
            </div>
          </div>
        </td>
        <td>
          <a href="https://wa.me/${String(b.leads?.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
            ${esc(b.leads?.phone || '—')} 💬
          </a>
        </td>
        <td>${esc(b.leads?.email || '—')}</td>
        <td><b>${esc(b.properties?.projects?.name || 'VR Green Meadows')}</b></td>
        <td>
          <b>${esc(b.properties?.property_code ? 'Plot ' + b.properties.property_code : (b.properties?.title || '—'))}</b>
          ${b.booking_reference ? `<small class="crm-cell-sub">Ref: ${esc(b.booking_reference)}</small>` : ''}
        </td>
        <td style="font-size: 12px; line-height: 1.4;">
          ${b.final_price ? `<div>Final: <b>₹${Number(b.final_price).toLocaleString('en-IN')}</b></div>` : ''}
          ${b.amount ? `<div style="color:#166534;">Advance: <b>₹${Number(b.amount).toLocaleString('en-IN')}</b></div>` : ''}
          ${b.remaining_amount != null ? `<div style="color:#dc2626;">Due: <b>₹${Number(b.remaining_amount).toLocaleString('en-IN')}</b></div>` : ''}
        </td>
        <td>${date(b.booked_at || b.created_at)}</td>
        <td><span class="crm-badge">${esc(src)}</span></td>
        <td><span class="crm-badge ${cls(b.status)}">${label(b.status)}</span></td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${b.status === 'CONFIRMED' || b.status === 'PENDING' ? `
              <button class="crm-action success" data-booking-complete="${b.id}" title="Mark sale completed &amp; mark plot SOLD">Complete</button>
              <button class="crm-action danger" data-booking-cancel="${b.id}" title="Cancel booking &amp; release plot back to AVAILABLE">Cancel</button>
              <button class="crm-action" data-send-feedback-booking="${b.id}" style="background:#f0fdf4; color:#166534; border:1px solid #86efac; font-weight:600;" title="Send customer feedback link via WhatsApp">★ Feedback</button>
            ` : b.status === 'COMPLETED' ? `
              <button class="crm-action" data-send-feedback-booking="${b.id}" style="background:#f0fdf4; color:#166534; border:1px solid #86efac; font-weight:600;" title="Send customer feedback link via WhatsApp">★ Send Feedback</button>
              <span style="font-size: 11px; color: #16a34a; font-weight: 700; align-self: center;">✓ Completed (Sold)</span>
            ` : `
              <span style="font-size: 11px; color: #dc2626; font-weight: 700;">Cancelled (Released)</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderBookingCards(rows) {
  if (!rows.length) {
    return `<div class="crm-empty">No confirmed bookings found.</div>`;
  }
  return rows.map((b) => {
    const src = b.leads?.source || (b.notes && b.notes.includes('Offline') ? 'Offline' : (b.notes && b.notes.includes('Enquiry') ? 'Website Enquiry' : 'Website'));
    return `
      <div class="crm-record-card">
        <div class="crm-record-head">
          <div class="crm-record-head-info">
            <span class="crm-avatar">${initials(b.leads?.name)}</span>
            <div>
              <b style="font-size: 14px; color: #173f2c;">${esc(b.leads?.name || 'Unknown')}</b>
              <small class="crm-cell-sub">${esc(b.leads?.email || 'No email')}</small>
            </div>
          </div>
          <span class="crm-badge ${cls(b.status)}">${label(b.status)}</span>
        </div>
        <div class="crm-record-body">
          <div class="crm-record-row">
            <span class="crm-record-row-label">Phone:</span>
            <span class="crm-record-row-val">
              <a href="https://wa.me/${String(b.leads?.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
                ${esc(b.leads?.phone || '—')} 💬
              </a>
            </span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Plot:</span>
            <span class="crm-record-row-val">
              ${esc(b.properties?.projects?.name || 'VR Green Meadows')} · <b>${esc(b.properties?.property_code ? 'Plot ' + b.properties.property_code : (b.properties?.title || '—'))}</b>
            </span>
          </div>
          ${b.final_price ? `
            <div class="crm-record-row">
              <span class="crm-record-row-label">Final Agreed:</span>
              <span class="crm-record-row-val">₹${Number(b.final_price).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          ${b.amount ? `
            <div class="crm-record-row">
              <span class="crm-record-row-label">Advance Paid:</span>
              <span class="crm-record-row-val" style="color: #166534;">₹${Number(b.amount).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          ${b.remaining_amount != null ? `
            <div class="crm-record-row">
              <span class="crm-record-row-label" style="color: #dc2626;">Balance Due:</span>
              <span class="crm-record-row-val" style="color: #dc2626;">₹${Number(b.remaining_amount).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div class="crm-record-row">
            <span class="crm-record-row-label">Date:</span>
            <span class="crm-record-row-val">${date(b.booked_at || b.created_at)}</span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Source:</span>
            <span class="crm-record-row-val"><span class="crm-badge">${esc(src)}</span></span>
          </div>
        </div>
        <div class="crm-record-actions">
          ${b.status === 'CONFIRMED' || b.status === 'PENDING' ? `
            <button class="crm-action success" data-booking-complete="${b.id}" title="Complete sale">Complete (Sold)</button>
            <button class="crm-action danger" data-booking-cancel="${b.id}" title="Cancel booking">Cancel (Release Plot)</button>
            <button class="crm-action" data-send-feedback-booking="${b.id}" style="background:#f0fdf4; color:#166534; border:1px solid #86efac; font-weight:600;" title="Send customer feedback link via WhatsApp">★ Send Feedback</button>
          ` : b.status === 'COMPLETED' ? `
            <button class="crm-action" data-send-feedback-booking="${b.id}" style="background:#f0fdf4; color:#166534; border:1px solid #86efac; font-weight:600;" title="Send customer feedback link via WhatsApp">★ Send Feedback</button>
            <span style="font-size: 12px; color: #16a34a; font-weight: 700; padding: 6px;">✓ Completed (Sold)</span>
          ` : `
            <span style="font-size: 12px; color: #dc2626; font-weight: 700; padding: 6px;">Cancelled (Released)</span>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function reminders() {
  const currentSettings = JSON.parse(localStorage.getItem('vr_crm_reminder_settings') || '{"remind48":true,"remind24":true,"remindDay":true}');
  return `
    <div class="crm-toolbar">
      <span class="crm-eyebrow">AUTOMATED WORKFLOWS</span>
    </div>
    <div style="display: grid; grid-template-columns: minmax(320px, 600px) 1fr; gap: 24px;">
      <section class="crm-card">
        <div class="crm-card-head">
          <div>
            <h2>Site Visit Reminder Rules</h2>
            <p>Configure automated WhatsApp reminders sent to visitors.</p>
          </div>
        </div>
        <div style="padding: 24px;">
          <form id="reminder-settings-form" class="crm-form">
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="remind-48" ${currentSettings.remind48 ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <strong>48 Hours Prior Reminder</strong>
                <p style="margin: 2px 0 0; color: #6B7280; font-size: 0.85rem;">Send early confirmation 2 days before the scheduled site visit date.</p>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; margin-top: 12px;">
              <input type="checkbox" id="remind-24" ${currentSettings.remind24 ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <strong>24 Hours Prior Reminder (Recommended)</strong>
                <p style="margin: 2px 0 0; color: #6B7280; font-size: 0.85rem;">Send 1-day reminder with executive contact and driving route details.</p>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; margin-top: 12px;">
              <input type="checkbox" id="remind-day" ${currentSettings.remindDay ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <strong>Day-of-Visit Morning Alert</strong>
                <p style="margin: 2px 0 0; color: #6B7280; font-size: 0.85rem;">Send morning WhatsApp message 2 hours prior with site coordinator phone and Google pin.</p>
              </div>
            </label>

            <div style="margin-top: 24px; padding: 14px; background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 10px; color: #92400E; font-size: 0.85rem; line-height: 1.5;">
              <strong>CRITICAL NOTICE:</strong> Site visit reminders are purely for customer communication. Site visits NEVER alter plot inventory status, and there is strictly <strong>no automatic hold expiry</strong>.
            </div>

            <div style="margin-top: 20px;">
              <button type="submit" class="crm-primary">Save Reminder Preferences</button>
            </div>
          </form>
        </div>
      </section>

      <section class="crm-card">
        <div class="crm-card-head">
          <div>
            <h2>Message Preview</h2>
            <p>Sample message delivered to customer</p>
          </div>
        </div>
        <div style="padding: 24px; background: #F0FDF4; border-radius: 0 0 16px 16px;">
          <div style="background: #FFFFFF; border: 1px solid #DCFCE7; border-radius: 12px; padding: 16px; font-size: 0.9rem; line-height: 1.6; color: #1F2937; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <div style="font-weight: 700; color: #166534; margin-bottom: 8px;">Real Estate Brothers group — Site Visit Reminder 📍</div>
            <p style="margin: 0 0 8px;">Hello <strong>Rahul Kumar</strong>,</p>
            <p style="margin: 0 0 8px;">This is a quick reminder of your upcoming site visit to <strong>Amodha Open Plots, Shadnagar</strong> scheduled for <strong>Tomorrow, 11:00 AM</strong>.</p>
            <p style="margin: 0 0 8px;">Our site coordinator, Mr. Suresh, will welcome you at the entrance arch.</p>
            <p style="margin: 0; font-size: 0.82rem; color: #4B5563;">Need pickup or rescheduling? Reply directly to this WhatsApp message.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function reviews() {
  const q = S.search.toLowerCase();
  const rows = S.reviews.filter((r) => {
    if (S.reviewFilter !== 'ALL') {
      if (S.reviewFilter === 'SHOW' && !r.is_visible) return false;
      if (S.reviewFilter === 'HIDE' && r.is_visible) return false;
      if (S.reviewFilter === 'NEEDS_ATTENTION' && r.status !== 'NEEDS ATTENTION') return false;
      if (S.reviewFilter === 'NEW' && r.status !== 'NEW') return false;
      if (S.reviewFilter !== 'SHOW' && S.reviewFilter !== 'HIDE' && S.reviewFilter !== 'NEEDS_ATTENTION' && S.reviewFilter !== 'NEW' && r.status !== S.reviewFilter) return false;
    }
    if (q && ![r.reviewer_name, r.review_text, r.project_name, r.source, r.property_code].some((v) => String(v || '').toLowerCase().includes(q))) {
      return false;
    }
    return true;
  });

  const totalCount = S.reviews.length;
  const needsAttentionCount = S.reviews.filter((r) => r.status === 'NEEDS ATTENTION').length;
  const newCount = S.reviews.filter((r) => r.status === 'NEW').length;
  const pendingCount = S.reviews.filter((r) => r.status === 'PENDING').length;
  const approvedCount = S.reviews.filter((r) => (r.status === 'APPROVED' || r.status === 'APPROVED FOR WEBSITE') && Boolean(r.is_visible)).length;
  const hiddenCount = S.reviews.filter((r) => r.status === 'HIDDEN' || !r.is_visible).length;

  return `
    <div class="crm-toolbar">
      <div class="crm-search">
        <span>⌕</span>
        <input id="review-search" value="${esc(S.search)}" placeholder="Search customer, feedback text, project, or plot…">
      </div>
      <select id="review-filter">
        <option value="ALL" ${S.reviewFilter === 'ALL' ? 'selected' : ''}>All Feedback &amp; Reviews (${totalCount})</option>
        <option value="NEEDS_ATTENTION" ${S.reviewFilter === 'NEEDS_ATTENTION' ? 'selected' : ''}>⚠️ Needs Attention (${needsAttentionCount})</option>
        <option value="NEW" ${S.reviewFilter === 'NEW' ? 'selected' : ''}>New Feedback (${newCount})</option>
        <option value="PENDING" ${S.reviewFilter === 'PENDING' ? 'selected' : ''}>Pending Google (${pendingCount})</option>
        <option value="APPROVED" ${S.reviewFilter === 'APPROVED' ? 'selected' : ''}>Approved for Website (${approvedCount})</option>
        <option value="HIDDEN" ${S.reviewFilter === 'HIDDEN' ? 'selected' : ''}>Hidden (${hiddenCount})</option>
      </select>
      <button class="crm-primary" id="sync-google-reviews">↻ Sync Google Reviews</button>
    </div>

    <div class="crm-overview-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 20px;">
      <article class="crm-stat">
        <div class="crm-stat-icon">★</div>
        <div>
          <span>Total Records</span>
          <strong>${totalCount}</strong>
          <small>Customer &amp; Google Reviews</small>
        </div>
      </article>
      <article class="crm-stat" style="${needsAttentionCount > 0 ? 'border-left: 4px solid #ef4444; background: #fff5f5;' : ''}">
        <div class="crm-stat-icon" style="color: #ef4444;">⚠️</div>
        <div>
          <span>Needs Attention</span>
          <strong style="color: ${needsAttentionCount > 0 ? '#dc2626' : '#64748b'};">${needsAttentionCount}</strong>
          <small>1–3 Star Feedbacks</small>
        </div>
      </article>
      <article class="crm-stat">
        <div class="crm-stat-icon" style="color: #3b82f6;">✉</div>
        <div>
          <span>New Feedback</span>
          <strong style="color: #2563eb;">${newCount}</strong>
          <small>Unreviewed 4–5★</small>
        </div>
      </article>
      <article class="crm-stat">
        <div class="crm-stat-icon" style="color: #10b981;">✓</div>
        <div>
          <span>Live on Website</span>
          <strong style="color: #059669;">${approvedCount}</strong>
          <small>Approved Testimonials</small>
        </div>
      </article>
      <article class="crm-stat">
        <div class="crm-stat-icon" style="color: #6b7280;">👁</div>
        <div>
          <span>Hidden</span>
          <strong>${hiddenCount}</strong>
          <small>Private to CRM</small>
        </div>
      </article>
    </div>

    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>Customer Feedback &amp; Testimonial Management</h2>
          <p>Review customer feedback from site visits &amp; bookings. Owner approval is required to display testimonials publicly.</p>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="crm-desktop-table crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Project</th>
              <th>Property/Plot</th>
              <th>Source</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reviews-table-body">
            ${renderReviewRows(rows)}
          </tbody>
        </table>
      </div>

      <!-- Mobile Responsive Cards -->
      <div class="crm-mobile-cards" id="reviews-mobile-cards" style="padding: 12px;">
        ${renderReviewCards(rows)}
      </div>
    </section>
  `;
}

function renderReviewRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="9"><div class="crm-empty">No feedback or reviews match this filter.</div></td></tr>`;
  }
  return rows.map((r) => {
    const isApproved = r.status === 'APPROVED' || r.status === 'APPROVED FOR WEBSITE';
    const isVisible = Boolean(r.is_visible);
    const starStr = '★'.repeat(Math.min(5, Math.max(1, r.rating || 5))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, r.rating || 5))));
    const cleanFeedback = String(r.review_text || '').trim() || '-';

    return `
      <tr>
        <td>
          <div class="crm-person">
            <span>${initials(r.reviewer_name)}</span>
            <div>
              <b>${esc(r.reviewer_name || 'Customer')}</b>
              <small>${esc(r.source || 'Direct')}</small>
            </div>
          </div>
        </td>
        <td style="color: #f59e0b; font-weight: 700; white-space: nowrap;">
          ${starStr} <small style="color:#6b7280;">(${r.rating || 5}/5)</small>
        </td>
        <td style="max-width: 260px; white-space: normal; line-height: 1.45; font-size: 13px;">
          ${esc(cleanFeedback)}
        </td>
        <td>
          <b>${esc(r.project_name || 'VR Real Estates')}</b>
        </td>
        <td>
          ${r.property_code ? `<b>Plot ${esc(r.property_code)}</b>` : '—'}
        </td>
        <td>
          <span class="crm-badge" style="background:#e0f2fe; color:#0369a1;">${esc(r.source || 'Direct')}</span>
        </td>
        <td>${date(r.review_date || r.created_at)}</td>
        <td>
          <span class="crm-badge ${cls(r.status)}">${label(r.status)}</span>
          ${isVisible ? `<span class="crm-badge" style="background:#dcfce7; color:#15803d; margin-top:3px; display:inline-block;">● LIVE</span>` : ''}
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${!isApproved || !isVisible ? `
              <button class="crm-small-btn" data-review-approve="${r.id}" style="background:#dcfce7; border-color:#22c55e; color:#15803d; font-weight:600;" title="Approve this review for website display">
                ✓ Approve for Website
              </button>
            ` : ''}
            ${isVisible ? `
              <button class="crm-small-btn" data-review-hide="${r.id}" style="background:#fee2e2; border-color:#ef4444; color:#b91c1c;" title="Hide from public website">
                Hide
              </button>
            ` : ''}
            ${r.status === 'NEEDS ATTENTION' ? `
              <button class="crm-small-btn" data-review-resolve="${r.id}" style="background:#fef3c7; border-color:#f59e0b; color:#92400e;" title="Mark customer concern as resolved">
                Mark Resolved
              </button>
            ` : ''}
            ${r.status === 'NEW' ? `
              <button class="crm-small-btn" data-review-reviewed="${r.id}" style="color:#475569;" title="Mark as reviewed">
                Mark Reviewed
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderReviewCards(rows) {
  if (!rows.length) {
    return `<div class="crm-empty">No feedback or reviews match this filter.</div>`;
  }
  return rows.map((r) => {
    const isApproved = r.status === 'APPROVED' || r.status === 'APPROVED FOR WEBSITE';
    const isVisible = Boolean(r.is_visible);
    const starStr = '★'.repeat(Math.min(5, Math.max(1, r.rating || 5))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, r.rating || 5))));
    const cleanFeedback = String(r.review_text || '').trim() || '-';

    return `
      <div class="crm-record-card">
        <div class="crm-record-head">
          <div class="crm-record-head-info">
            <span class="crm-avatar">${initials(r.reviewer_name)}</span>
            <div>
              <b style="font-size: 14px; color: #173f2c;">${esc(r.reviewer_name || 'Customer')}</b>
              <small class="crm-cell-sub">${esc(r.source || 'Direct')}</small>
            </div>
          </div>
          <div style="display: flex; gap: 4px; flex-direction: column; align-items: flex-end;">
            <span class="crm-badge ${cls(r.status)}">${label(r.status)}</span>
            ${isVisible ? `<span class="crm-badge" style="background:#dcfce7; color:#15803d;">● LIVE</span>` : ''}
          </div>
        </div>
        <div class="crm-record-body">
          <div class="crm-record-row">
            <span class="crm-record-row-label">Rating:</span>
            <span class="crm-record-row-val" style="color: #f59e0b;">${starStr} (${r.rating || 5}/5)</span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Feedback:</span>
            <span class="crm-record-row-val" style="font-weight: normal; color: #334155;">${esc(cleanFeedback)}</span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Project:</span>
            <span class="crm-record-row-val">${esc(r.project_name || 'VR Real Estates')}${r.property_code ? ` · Plot ${esc(r.property_code)}` : ''}</span>
          </div>
          <div class="crm-record-row">
            <span class="crm-record-row-label">Date:</span>
            <span class="crm-record-row-val">${date(r.review_date || r.created_at)}</span>
          </div>
        </div>
        <div class="crm-record-actions">
          ${!isApproved || !isVisible ? `
            <button class="crm-small-btn" data-review-approve="${r.id}" style="background:#dcfce7; border-color:#22c55e; color:#15803d; font-weight:600;" title="Approve this review for website display">
              ✓ Approve for Website
            </button>
          ` : ''}
          ${isVisible ? `
            <button class="crm-small-btn" data-review-hide="${r.id}" style="background:#fee2e2; border-color:#ef4444; color:#b91c1c;" title="Hide from public website">
              Hide
            </button>
          ` : ''}
          ${r.status === 'NEEDS ATTENTION' ? `
            <button class="crm-small-btn" data-review-resolve="${r.id}" style="background:#fef3c7; border-color:#f59e0b; color:#92400e;" title="Mark customer concern as resolved">
              Mark Resolved
            </button>
          ` : ''}
          ${r.status === 'NEW' ? `
            <button class="crm-small-btn" data-review-reviewed="${r.id}" style="color:#475569;" title="Mark as reviewed">
              Mark Reviewed
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function body() {
  return ({
    overview,
    enquiries,
    inbox,
    visits,
    inventory,
    bookings,
    reviews,
    reminders
  }[S.tab] || overview)();
}

async function load() {
  const [a, b, c, d, e, f, g] = await Promise.all([
    api('/api/crm/summary'),
    api('/api/crm/enquiries'),
    api('/api/crm/conversations'),
    api('/api/crm/site-visits'),
    api('/api/crm/inventory'),
    api('/api/crm/bookings'),
    api('/api/crm/reviews').catch(() => ({ reviews: [] }))
  ]);
  S.summary = a;
  S.enquiries = b.enquiries || [];
  S.conversations = c.conversations || [];
  S.visits = d.visits || [];
  S.inventory = e.properties || [];
  S.bookings = f.bookings || [];
  S.reviews = g.reviews || [];

  if (S.activePlotDetail) {
    const fresh = S.inventory.find((x) => x.id === S.activePlotDetail.id);
    if (fresh) S.activePlotDetail = fresh;
  }
}

async function messages(id) {
  S.active = id;
  const d = await api(`/api/crm/messages/${id}`);
  S.messages = d.messages || [];
  render();
  requestAnimationFrame(() => {
    const x = document.getElementById('chat-messages');
    if (x) x.scrollTop = x.scrollHeight;
  });
}

function modal(html) {
  document.getElementById('crm-modal')?.remove();
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="crm-modal" class="crm-modal-backdrop"><div class="crm-modal">${html}</div></div>`
  );
  document.querySelectorAll('[data-close]').forEach((x) => (x.onclick = () => document.getElementById('crm-modal')?.remove()));
}

function getProjectProperties(projSlug) {
  return S.inventory.filter((p) => {
    const slug = p.projects?.slug || '';
    if (slug) return slug === projSlug;
    const name = String(p.projects?.name || '').toLowerCase();
    const code = String(p.property_code || '').toUpperCase();
    if (projSlug === 'vr-green-meadows') {
      return name.includes('meadow') || name.includes('plot') || code.startsWith('P') || (!isNaN(code) && !code.startsWith('V') && !code.startsWith('A') && !code.startsWith('F'));
    }
    if (projSlug === 'vr-luxury-villas') {
      return name.includes('villa') || code.startsWith('V');
    }
    if (projSlug === 'vr-elite-towers') {
      return name.includes('tower') || name.includes('apart') || code.startsWith('A-') || code.startsWith('B-');
    }
    if (projSlug === 'vr-agro-lands') {
      return name.includes('agro') || name.includes('farm') || code.startsWith('F-');
    }
    return false;
  });
}

function openBookingModal({ mode = 'offline', enquiryId = null, visitId = null, propertyId = null } = {}) {
  let customerName = '';
  let customerPhone = '';
  let customerEmail = '';
  let customerNote = '';
  let initialPropertyId = propertyId || '';
  let initialPropertyCode = '';
  let initialProjectSlug = 'vr-green-meadows';

  let enq = null;
  let visit = null;

  if (mode === 'enquiry' && enquiryId) {
    enq = S.enquiries.find((x) => x.id === enquiryId);
    if (enq) {
      customerName = enq.name || '';
      customerPhone = enq.phone || '';
      customerEmail = enq.email || '';
      customerNote = cleanCustomerNote(enq.notes);
      initialPropertyId = enq.property_id || '';
      initialPropertyCode = enq.property || '';
      const pMatch = S.inventory.find((x) => x.id === initialPropertyId || (initialPropertyCode && x.property_code === initialPropertyCode));
      if (pMatch?.projects?.slug) initialProjectSlug = pMatch.projects.slug;
      else if (enq.project) {
        const found = CRM_PROJECTS.find((p) => enq.project.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(enq.project.toLowerCase()));
        if (found) initialProjectSlug = found.slug;
      }
    }
  } else if (mode === 'visit' && visitId) {
    visit = S.visits.find((x) => x.id === visitId);
    if (visit) {
      customerName = visit.leads?.name || '';
      customerPhone = visit.leads?.phone || '';
      customerEmail = visit.leads?.email || '';
      customerNote = cleanVisitNote(visit.notes);
      initialPropertyId = visit.property_id || '';
      initialPropertyCode = visit.properties?.property_code || '';
      if (visit.properties?.projects?.slug) {
        initialProjectSlug = visit.properties.projects.slug;
      }
    }
  } else if (propertyId) {
    const pMatch = S.inventory.find((x) => x.id === propertyId || x.property_code === propertyId);
    if (pMatch) {
      initialPropertyId = pMatch.id;
      initialPropertyCode = pMatch.property_code;
      if (pMatch.projects?.slug) initialProjectSlug = pMatch.projects.slug;
    }
  }

  const modalTitle = mode === 'enquiry'
    ? `Book Property for ${esc(customerName || 'Customer')}`
    : mode === 'visit'
    ? `Book Property from Site Visit`
    : `+ Record Property Booking`;

  const modalSubtitle = mode === 'enquiry'
    ? `Converts this website enquiry into a confirmed booking. Selected plot marks BOOKED and website updates instantly.`
    : mode === 'visit'
    ? `Customer decided to purchase after site visit! Confirms booking, updates plot to BOOKED, and syncs website.`
    : `Direct customer booking. Instantly updates inventory and synchronizes with the public master plan.`;

  modal(`
    <button class="crm-modal-close" data-close>×</button>
    <div class="crm-eyebrow">CONFIRMED TRANSACTION RECORD</div>
    <h2>${modalTitle}</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: -6px; margin-bottom: 14px;">
      ${modalSubtitle}
    </p>

    <form id="crm-unified-booking-form" class="crm-form">
      <!-- SECTION 1: CUSTOMER INFORMATION -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; display: grid; gap: 8px;">
        <div style="font-size: 11px; font-weight: 800; color: #173f2c; text-transform: uppercase; letter-spacing: 0.5px;">
          Section 1 · Customer Details
        </div>
        ${(mode === 'enquiry' || mode === 'visit') ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><span style="color: #64748b;">Customer:</span> <b>${esc(customerName || '—')}</b></div>
            <div><span style="color: #64748b;">Phone:</span> <b>${esc(customerPhone || '—')}</b></div>
            <div><span style="color: #64748b;">Email:</span> <b>${esc(customerEmail || '—')}</b></div>
            <div><span style="color: #64748b;">Customer Note:</span> <b>${esc(customerNote || '-')}</b></div>
          </div>
          <input type="hidden" name="customer_name" value="${esc(customerName)}">
          <input type="hidden" name="customer_phone" value="${esc(customerPhone)}">
          <input type="hidden" name="customer_email" value="${esc(customerEmail)}">
        ` : `
          <div style="display: grid; gap: 10px;">
            <label>Customer Full Name *
              <input name="customer_name" id="modal-cust-name" required placeholder="e.g. Rahul Kumar">
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <label>Mobile Number (WhatsApp) *
                <input name="customer_phone" id="modal-cust-phone" type="tel" required placeholder="10-digit mobile number" maxlength="10">
              </label>
              <label>Email Address
                <input name="customer_email" id="modal-cust-email" type="email" placeholder="name@example.com">
              </label>
            </div>
          </div>
        `}
      </div>

      <!-- SECTION 2: PROPERTY SELECTION (PROJECT -> PROPERTY/PLOT) -->
      <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 14px; display: grid; gap: 10px;">
        <div style="font-size: 11px; font-weight: 800; color: #173f2c; text-transform: uppercase; letter-spacing: 0.5px;">
          Section 2 · Property Selection (Project ↓ Plot)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <label>Project / Venture *
            <select name="project_slug" id="modal-project-select" required>
              ${CRM_PROJECTS.map((p) => `
                <option value="${p.slug}" ${p.slug === initialProjectSlug ? 'selected' : ''}>${p.name}</option>
              `).join('')}
            </select>
          </label>

          <label>Plot / Property *
            <select name="property_id" id="modal-property-select" required>
              <!-- Populated dynamically based on project -->
            </select>
          </label>
        </div>
      </div>

      <!-- SECTION 3: PROPERTY INFORMATION -->
      <div id="modal-property-info-section" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px;">
        <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
          Section 3 · Selected Property Details
        </div>
        <div id="modal-prop-details-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 12px;">
          <div><span style="color: #64748b; font-size: 11px;">Property:</span> <b id="prop-info-code">—</b></div>
          <div><span style="color: #64748b; font-size: 11px;">Area:</span> <b id="prop-info-area">—</b></div>
          <div><span style="color: #64748b; font-size: 11px;">Facing:</span> <b id="prop-info-facing">—</b></div>
          <div><span style="color: #64748b; font-size: 11px;">Status:</span> <b id="prop-info-status" class="crm-badge status-available">AVAILABLE</b></div>
        </div>
      </div>

      <!-- SECTION 4: FINANCIAL AGREEMENT -->
      <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 14px; display: grid; gap: 12px;">
        <div style="font-size: 11px; font-weight: 800; color: #173f2c; text-transform: uppercase; letter-spacing: 0.5px;">
          Section 4 · Financial Agreement
        </div>

        <div class="crm-price-summary-box">
          <div class="crm-calc-row">
            <span>Official Listed Price:</span>
            <strong id="modal-display-listed">₹0</strong>
            <input type="hidden" name="listed_price" id="modal-input-listed" value="0">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <label>Final Agreed Price (₹) *
            <input name="final_price" id="modal-input-final" type="number" required min="1" placeholder="e.g. 3200000">
          </label>
          <label>Advance Amount (₹) *
            <input name="advance" id="modal-input-advance" type="number" required min="0" placeholder="e.g. 100000">
          </label>
        </div>

        <div class="crm-price-summary-box">
          <div class="crm-calc-row highlight due">
            <span style="font-weight: 700; color: #dc2626;">Remaining Balance Due:</span>
            <strong id="modal-display-remaining" style="font-size: 14px; color: #dc2626; font-weight: 800;">₹0</strong>
            <input type="hidden" name="remaining_amount" id="modal-input-remaining" value="0">
          </div>
        </div>
      </div>

      <!-- SECTION 5: BOOKING NOTES -->
      <div style="display: grid; gap: 6px;">
        <label>Section 5 · Booking Notes / Remarks (Optional)
          <textarea name="notes" id="modal-booking-notes" rows="2" placeholder="Payment receipt, cheque no, special terms, etc."></textarea>
        </label>
      </div>

      <!-- SECTION 6: CONFIRMATION ACTIONS -->
      <div class="crm-modal-actions" style="margin-top: 8px;">
        <button type="button" class="crm-small-btn" data-close>Cancel</button>
        <button type="submit" class="crm-primary" id="modal-confirm-btn" style="background:#15803d; border-color:#15803d; padding: 10px 18px; font-weight: 700;">
          Confirm Booking &amp; Update Website
        </button>
      </div>
    </form>
  `);

  const projSelect = document.getElementById('modal-project-select');
  const propSelect = document.getElementById('modal-property-select');
  const dispListed = document.getElementById('modal-display-listed');
  const inListed = document.getElementById('modal-input-listed');
  const inFinal = document.getElementById('modal-input-final');
  const inAdvance = document.getElementById('modal-input-advance');
  const dispRemain = document.getElementById('modal-display-remaining');
  const inRemain = document.getElementById('modal-input-remaining');

  const infoCode = document.getElementById('prop-info-code');
  const infoArea = document.getElementById('prop-info-area');
  const infoFacing = document.getElementById('prop-info-facing');
  const infoStatus = document.getElementById('prop-info-status');

  function updatePropertiesDropdown(selectedProjSlug, keepPropId = null) {
    const props = getProjectProperties(selectedProjSlug);
    propSelect.innerHTML = '';

    if (!props.length) {
      propSelect.innerHTML = '<option value="">No properties in this project</option>';
      updateSelectedPropertyDetails(null);
      return;
    }

    props.sort((a, b) => (a.property_code || '').localeCompare(b.property_code || '', undefined, { numeric: true }));

    props.forEach((p) => {
      const isCurrentlySelected = (keepPropId && (p.id === keepPropId || p.property_code === keepPropId));
      const isAvailable = p.inventory_status === 'AVAILABLE' || p.inventory_status === 'HOLD' || p.inventory_status === 'RESERVED' || isCurrentlySelected;
      const numPrice = parseNumericPrice(p.price);

      const opt = document.createElement('option');
      opt.value = p.id;
      opt.dataset.price = numPrice;
      opt.dataset.code = p.property_code || '';
      opt.dataset.area = p.area ? `${p.area} ${p.area_unit || 'Sq.Yds'}` : '200 Sq.Yds';
      opt.dataset.facing = p.facing || 'East';
      opt.dataset.status = p.inventory_status || 'AVAILABLE';

      if (!isAvailable) {
        opt.disabled = true;
        opt.textContent = `${p.property_code} · ${p.title || 'Unit'} — [${p.inventory_status} - Unavailable]`;
      } else {
        opt.textContent = `${p.property_code} · ${p.title || 'Unit'} — ${formatIndianCurrency(numPrice)} [${p.inventory_status}]`;
      }

      propSelect.appendChild(opt);
    });

    let target = props.find((p) => keepPropId && (p.id === keepPropId || p.property_code === keepPropId));
    if (!target) target = props.find((p) => p.inventory_status === 'AVAILABLE' || p.inventory_status === 'HOLD' || p.inventory_status === 'RESERVED') || props[0];

    if (target) {
      propSelect.value = target.id;
      updateSelectedPropertyDetails(target);
    }
  }

  function updateSelectedPropertyDetails(prop) {
    if (!prop) {
      infoCode.textContent = '—';
      infoArea.textContent = '—';
      infoFacing.textContent = '—';
      infoStatus.textContent = '—';
      dispListed.textContent = '₹0';
      inListed.value = 0;
      inFinal.value = 0;
      updateCalculations();
      return;
    }

    const numPrice = parseNumericPrice(prop.price) || 3200000;
    infoCode.textContent = prop.property_code || prop.title || 'Unit';
    infoArea.textContent = prop.area ? `${prop.area} ${prop.area_unit || 'Sq.Yds'}` : '200 Sq.Yds';
    infoFacing.textContent = prop.facing || (prop.property_code <= 'P06' ? 'East' : prop.property_code <= 'P12' ? 'West' : 'North');
    infoStatus.textContent = prop.inventory_status || 'AVAILABLE';
    infoStatus.className = `crm-badge ${cls(prop.inventory_status || 'AVAILABLE')}`;

    dispListed.textContent = formatIndianCurrency(numPrice);
    inListed.value = numPrice;
    inFinal.value = numPrice;
    updateCalculations();
  }

  function updateCalculations() {
    const finalVal = parseFloat(inFinal.value) || 0;
    const advVal = parseFloat(inAdvance.value) || 0;
    const remaining = Math.max(0, finalVal - advVal);
    dispRemain.textContent = formatIndianCurrency(remaining);
    inRemain.value = remaining;
  }

  projSelect.addEventListener('change', () => {
    updatePropertiesDropdown(projSelect.value);
  });

  propSelect.addEventListener('change', () => {
    const opt = propSelect.selectedOptions[0];
    const p = S.inventory.find((x) => x.id === opt?.value);
    updateSelectedPropertyDetails(p);
  });

  inFinal.addEventListener('input', updateCalculations);
  inAdvance.addEventListener('input', updateCalculations);

  updatePropertiesDropdown(initialProjectSlug, initialPropertyId || initialPropertyCode);

  document.getElementById('crm-unified-booking-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const finalPrice = parseFloat(data.final_price) || 0;
    const advance = parseFloat(data.advance) || 0;

    if (finalPrice <= 0) {
      showToast('Please enter a valid final agreed price.', true);
      return;
    }
    if (advance < 0) {
      showToast('Advance amount cannot be negative.', true);
      return;
    }
    if (advance > finalPrice) {
      showToast('Advance amount cannot exceed final agreed price.', true);
      return;
    }

    const remaining = Math.max(0, finalPrice - advance);
    const selectedProp = S.inventory.find((x) => x.id === data.property_id);
    const propCode = selectedProp?.property_code || data.property_id;

    try {
      if (mode === 'enquiry' && enquiryId) {
        await api(`/api/crm/enquiries/${enquiryId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'BOOKED',
            property_id: data.property_id,
            final_price: finalPrice,
            advance: advance,
            remaining_amount: remaining,
            amount: advance,
            notes: data.notes
          })
        });
        showToast(`Enquiry successfully confirmed as BOOKED for ${propCode}! Website synced.`);
      } else if (mode === 'visit' && visitId) {
        await api(`/api/crm/site-visits/${visitId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'BOOKED',
            property_id: data.property_id,
            final_price: finalPrice,
            advance: advance,
            remaining_amount: remaining,
            amount: advance,
            notes: data.notes
          })
        });
        showToast(`Site visit converted to BOOKED for ${propCode}! Website synced.`);
      } else {
        if (!data.customer_name || !data.customer_phone) {
          showToast('Customer name and mobile number are required.', true);
          return;
        }
        await api('/api/crm/offline-booking', {
          method: 'POST',
          body: JSON.stringify({
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_email: data.customer_email,
            property_id: data.property_id,
            status: 'BOOKED',
            final_price: finalPrice,
            advance: advance,
            remaining_amount: remaining,
            amount: advance,
            notes: data.notes
          })
        });
        showToast(`Plot ${propCode} booked for ${data.customer_name}! Website synced.`);
      }

      if (selectedProp?.property_code) syncPlotOverride(selectedProp.property_code, 'BOOKED');
      if (selectedProp?.id) syncPlotOverride(selectedProp.id, 'BOOKED');

      document.getElementById('crm-modal')?.remove();
      await load();
      render();
    } catch (err) {
      showToast(err.message, true);
    }
  };
}

function enquiryBookingModal(enquiryId) {
  return openBookingModal({ mode: 'enquiry', enquiryId });
}

async function cancelEnquiry(enquiryId) {
  if (!confirm('Mark this enquiry as CANCEL? (Record will be moved to Cancelled Enquiries; inventory remains unchanged)')) return;
  try {
    await api(`/api/crm/enquiries/${enquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCEL' })
    });
    showToast('Enquiry moved to Cancelled Enquiries. Inventory unchanged.');
    await load();
    render();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function restoreEnquiry(enquiryId) {
  try {
    await api(`/api/crm/enquiries/${enquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'NEW' })
    });
    showToast('Enquiry restored to Active.');
    await load();
    render();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function archiveEnquiry(enquiryId) {
  if (!confirm('Archive and permanently remove this enquiry?')) return;
  try {
    await api(`/api/crm/enquiries/${enquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REMOVE' })
    });
    showToast('Enquiry archived.');
    await load();
    render();
  } catch (err) {
    showToast(err.message, true);
  }
}

function addSiteVisitModal() {
  modal(`
    <button class="crm-modal-close" data-close>×</button>
    <div class="crm-eyebrow">OFFLINE SITE VISIT APPOINTMENT</div>
    <h2>+ Add Site Visit</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: -6px; margin-bottom: 14px;">
      Log an offline customer visit appointment. (Plot remains AVAILABLE).
    </p>
    <form id="offline-visit-form" class="crm-form">
      <label>Customer Name *
        <input name="customer_name" required placeholder="e.g. Rahul Kumar">
      </label>
      <label>Phone Number *
        <input name="customer_phone" type="tel" required placeholder="10-digit mobile number" maxlength="10">
      </label>
      <label>Email Address
        <input name="customer_email" type="email" placeholder="name@example.com">
      </label>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <label>Project / Venture *
          <select name="project_slug" id="visit-modal-project" required>
            ${CRM_PROJECTS.map((p) => `<option value="${p.slug}">${p.name}</option>`).join('')}
          </select>
        </label>
        <label>Plot / Property *
          <select name="property_id" id="visit-modal-property" required>
            <!-- Populated dynamically based on project -->
          </select>
        </label>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <label>Visit Date *
          <input name="visit_date" type="date" required value="${new Date().toISOString().split('T')[0]}">
        </label>
        <label>Visit Time
          <input name="visit_time" type="time" value="11:00">
        </label>
      </div>
      <label>Initial Status
        <select name="status">
          <option value="PENDING" selected>PENDING (Awaiting confirmation)</option>
          <option value="CONFIRMED">CONFIRMED (Send WhatsApp confirmation)</option>
        </select>
      </label>
      <label>Customer Notes
        <textarea name="notes" rows="2" placeholder="How can we help you?"></textarea>
      </label>
      <input type="hidden" name="source" value="Offline" />
      <div class="crm-modal-actions">
        <button type="button" class="crm-small-btn" data-close>Cancel</button>
        <button class="crm-primary">Save Site Visit</button>
      </div>
    </form>
  `);

  const vProj = document.getElementById('visit-modal-project');
  const vProp = document.getElementById('visit-modal-property');

  function updateVisitProps(slug) {
    const props = getProjectProperties(slug);
    vProp.innerHTML = '';
    props.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.property_code} · ${p.title || 'Unit'} (${p.inventory_status})`;
      vProp.appendChild(opt);
    });
  }

  vProj?.addEventListener('change', () => updateVisitProps(vProj.value));
  updateVisitProps(vProj?.value || 'vr-green-meadows');

  document.getElementById('offline-visit-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const scheduledAt = data.visit_date ? `${data.visit_date}T${data.visit_time || '11:00'}:00` : null;
    try {
      await api('/api/crm/site-visits', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_email: data.customer_email,
          property_id: data.property_id,
          scheduled_at: scheduledAt,
          status: data.status,
          notes: data.notes ? `[Offline] ${data.notes}` : '[Offline Site Visit]',
          source: 'Offline'
        })
      });
      document.getElementById('crm-modal')?.remove();
      await load();
      render();
      showToast('Offline site visit added to Site Visits.');
    } catch (err) {
      showToast(err.message, true);
    }
  };
}

function visitBookingModal(visitId) {
  return openBookingModal({ mode: 'visit', visitId });
}

function offlineBookingModal(preselectedPropertyId = '') {
  return openBookingModal({ mode: 'offline', propertyId: preselectedPropertyId });
}

async function openPlotDrawer(p) {
  if (!p) return;
  S.selectedPlotId = p.property_code;
  S.activePlotDetail = p;
  S.plotHistory = [];

  try {
    const h = await api(`/api/crm/inventory/${p.id}/history`);
    S.plotHistory = h.history || [];
  } catch (e) {
    S.plotHistory = [];
  }

  render();
}

function closePlotDrawer() {
  S.activePlotDetail = null;
  render();
}

function showToast(msg, error = false) {
  const x = document.createElement('div');
  x.className = 'crm-toast' + (error ? ' error' : '');
  x.textContent = msg;
  document.body.appendChild(x);
  setTimeout(() => x.remove(), 3500);
}

async function patchVisit(id, status, scheduled_at) {
  try {
    await api(`/api/crm/site-visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, scheduled_at })
    });
    showToast(
      status === 'CONFIRMED'
        ? 'Site visit confirmed & WhatsApp notification sent! (Plot status unaffected)'
        : 'Site visit status updated.'
    );
    await load();
    render();
  } catch (x) {
    showToast(x.message, true);
  }
}

async function patchBooking(id, status) {
  try {
    await api(`/api/crm/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showToast(
      status === 'COMPLETED'
        ? 'Booking marked COMPLETED and plot marked SOLD!'
        : status === 'CANCELLED'
        ? 'Booking cancelled and plot released back to AVAILABLE.'
        : 'Booking status updated.'
    );
    await load();
    render();
  } catch (x) {
    showToast(x.message, true);
  }
}

function bindEnquiryActions() {
  document.querySelectorAll('[data-enquiry-book]').forEach((x) => {
    x.onclick = () => enquiryBookingModal(x.dataset.enquiryBook);
  });
  document.querySelectorAll('[data-enquiry-cancel]').forEach((x) => {
    x.onclick = () => cancelEnquiry(x.dataset.enquiryCancel);
  });
  document.querySelectorAll('[data-enquiry-restore]').forEach((x) => {
    x.onclick = () => restoreEnquiry(x.dataset.enquiryRestore);
  });
  document.querySelectorAll('[data-enquiry-remove]').forEach((x) => {
    x.onclick = () => archiveEnquiry(x.dataset.enquiryRemove);
  });
}

async function sendFeedbackLink({ site_visit_id = null, booking_id = null } = {}) {
  try {
    showToast('Generating secure feedback link & sending WhatsApp...');
    const res = await api('/api/crm/feedback/send', {
      method: 'POST',
      body: JSON.stringify({ site_visit_id, booking_id })
    });

    const msg = res.whatsapp_sent
      ? `Feedback link sent via WhatsApp to ${res.customer_name || 'customer'} (${res.customer_phone})!`
      : `Feedback link generated! (WhatsApp note: ${res.whatsapp_error || 'pending delivery'})`;

    showToast(msg);

    modal(`
      <button class="crm-modal-close" data-close>×</button>
      <div class="crm-eyebrow">CUSTOMER FEEDBACK LINK</div>
      <h2>Feedback Link Generated</h2>
      <p style="color: #475569; font-size: 13px; margin: 4px 0 16px;">
        ${res.whatsapp_sent ? `Dispatched to <strong>${esc(res.customer_phone)}</strong> via WhatsApp Cloud API.` : 'Unique secure link created.'}
      </p>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
        <label style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Customer Feedback URL</label>
        <input 
          id="copy-fb-url-input" 
          value="${esc(res.feedback_url)}" 
          readonly 
          style="width: 100%; box-sizing: border-box; margin-top: 6px; padding: 8px 10px; font-size: 12px; border: 1px solid #94a3b8; border-radius: 6px; background: #fff;" 
        />
      </div>

      <div class="crm-modal-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
        <button type="button" class="crm-small-btn" data-close>Close</button>
        <button type="button" class="crm-primary" id="copy-fb-url-btn">📋 Copy Feedback Link</button>
      </div>
    `);

    document.getElementById('copy-fb-url-btn')?.addEventListener('click', () => {
      const el = document.getElementById('copy-fb-url-input');
      if (el) {
        navigator.clipboard.writeText(el.value).then(() => {
          showToast('Feedback link copied to clipboard!');
        }).catch(() => {
          el.select();
          document.execCommand('copy');
          showToast('Feedback link copied!');
        });
      }
    });
  } catch (err) {
    showToast(err.message || 'Failed to send feedback link.', true);
  }
}

function bindVisitActions() {
  document.querySelectorAll('[data-confirm-visit]').forEach((x) => {
    x.onclick = async () => {
      const v = S.visits.find((y) => y.id === x.dataset.confirmVisit);
      let at = v?.scheduled_at;
      if (!at) {
        at = prompt('Enter scheduled date/time (example: 2026-09-15 11:00 AM):');
        if (!at) return;
      }
      await patchVisit(v.id, 'CONFIRMED', at);
    };
  });
  document.querySelectorAll('[data-visit-book]').forEach((x) => {
    x.onclick = () => visitBookingModal(x.dataset.visitBook);
  });
  document.querySelectorAll('[data-cancel-visit]').forEach((x) => {
    x.onclick = async () => {
      if (confirm('Cancel this site visit request?')) await patchVisit(x.dataset.cancelVisit, 'CANCELLED');
    };
  });
  document.querySelectorAll('[data-complete-visit]').forEach((x) => {
    x.onclick = () => patchVisit(x.dataset.completeVisit, 'COMPLETED');
  });
  document.querySelectorAll('[data-reschedule-visit]').forEach((x) => {
    x.onclick = async () => {
      const at = prompt('New date/time for visit:');
      if (at) await patchVisit(x.dataset.rescheduleVisit, 'RESCHEDULED', at);
    };
  });
  document.querySelectorAll('[data-send-feedback-visit]').forEach((x) => {
    x.onclick = async () => {
      await sendFeedbackLink({ site_visit_id: x.dataset.sendFeedbackVisit });
    };
  });
}

function bindBookingActions() {
  document.querySelectorAll('[data-booking-confirm]').forEach((x) => {
    x.onclick = () => patchBooking(x.dataset.bookingConfirm, 'CONFIRMED');
  });
  document.querySelectorAll('[data-booking-complete]').forEach((x) => {
    x.onclick = () => patchBooking(x.dataset.bookingComplete, 'COMPLETED');
  });
  document.querySelectorAll('[data-booking-cancel]').forEach((x) => {
    x.onclick = async () => {
      if (confirm('Cancel this booking? This will immediately release the plot back to AVAILABLE on the public website.')) {
        await patchBooking(x.dataset.bookingCancel, 'CANCELLED');
      }
    };
  });
  document.querySelectorAll('[data-send-feedback-booking]').forEach((x) => {
    x.onclick = async () => {
      await sendFeedbackLink({ booking_id: x.dataset.sendFeedbackBooking });
    };
  });
}

function bindReviewActions() {
  document.querySelectorAll('[data-review-approve]').forEach((btn) => {
    btn.onclick = async () => {
      try {
        await api(`/api/crm/reviews/${btn.dataset.reviewApprove}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'APPROVED', is_visible: true })
        });
        showToast('Review approved for website & live.');
        await load();
        render();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  });

  document.querySelectorAll('[data-review-hide]').forEach((btn) => {
    btn.onclick = async () => {
      try {
        await api(`/api/crm/reviews/${btn.dataset.reviewHide}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'HIDDEN', is_visible: false })
        });
        showToast('Review hidden from website.');
        await load();
        render();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  });

  document.querySelectorAll('[data-review-resolve]').forEach((btn) => {
    btn.onclick = async () => {
      try {
        await api(`/api/crm/reviews/${btn.dataset.reviewResolve}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'RESOLVED' })
        });
        showToast('Customer feedback marked as resolved.');
        await load();
        render();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  });

  document.querySelectorAll('[data-review-reviewed]').forEach((btn) => {
    btn.onclick = async () => {
      try {
        await api(`/api/crm/reviews/${btn.dataset.reviewReviewed}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'REVIEWED' })
        });
        showToast('Customer feedback marked as reviewed.');
        await load();
        render();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  });
}

function bind() {
  // Mobile navigation hamburger toggle & backdrop
  const menuToggle = document.getElementById('crm-menu-toggle');
  const sidebar = document.getElementById('crm-sidebar');
  const backdrop = document.getElementById('crm-sidebar-backdrop');

  menuToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('open');
  });

  backdrop?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('open');
  });

  document.querySelectorAll('.crm-nav').forEach((x) => {
    x.onclick = () => {
      sidebar?.classList.remove('open');
      backdrop?.classList.remove('open');
      S.tab = x.dataset.tab;
      render();
      if (S.tab === 'inbox' && S.active) messages(S.active).catch((e) => showToast(e.message, true));
    };
  });

  document.querySelectorAll('[data-go]').forEach((x) => {
    x.onclick = () => {
      S.tab = x.dataset.go;
      render();
    };
  });

  // Enquiry Filter (Active vs Cancelled)
  document.querySelectorAll('[data-enquiry-filter]').forEach((btn) => {
    btn.onclick = () => {
      S.enquiryFilter = btn.dataset.enquiryFilter;
      render();
    };
  });

  document.getElementById('crm-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem('vr_crm_key');
    key = '';
    if (timer) clearInterval(timer);
    login(document.getElementById('crm-root'));
  });

  document.getElementById('refresh')?.addEventListener('click', async () => {
    const btn = document.getElementById('refresh');
    if (btn) btn.classList.add('spinning');
    try {
      await load();
      render();
      showToast('CRM data refreshed.');
    } catch (e) {
      showToast(e.message, true);
    }
  });

  // Targeted In-Place Search (Fixes cursor jumping backwards bug)
  const handleSearchInput = (e) => {
    S.search = e.target.value;
    const q = S.search.toLowerCase();

    if (S.tab === 'enquiries') {
      const tbody = document.getElementById('enquiries-table-body');
      const cardsWrap = document.getElementById('enquiries-mobile-cards');
      const countEl = document.querySelector('.crm-card-head h2');
      const activeEnqs = S.enquiries.filter((enq) => enq.status !== 'CANCEL' && enq.status !== 'BOOKED');
      const cancelledEnqs = S.enquiries.filter((enq) => enq.status === 'CANCEL');
      const targetList = S.enquiryFilter === 'cancelled' ? cancelledEnqs : activeEnqs;

      const filtered = targetList.filter((enq) =>
        !q || [enq.name, enq.phone, enq.email, enq.project, enq.property, enq.notes, enq.status].some((v) => String(v || '').toLowerCase().includes(q))
      );

      if (countEl) countEl.textContent = `${filtered.length} ${S.enquiryFilter === 'cancelled' ? 'Cancelled' : 'Active'} Enquiries`;
      if (tbody) tbody.innerHTML = renderEnquiryRows(filtered);
      if (cardsWrap) cardsWrap.innerHTML = renderEnquiryCards(filtered);
      bindEnquiryActions();
    } else if (S.tab === 'visits') {
      const tbody = document.getElementById('visits-table-body');
      const cardsWrap = document.getElementById('visits-mobile-cards');
      const countEl = document.querySelector('.crm-card-head h2');
      const filtered = S.visits.filter((v) => {
        if (S.visitFilter !== 'ALL') {
          if (S.visitFilter === 'PENDING' && v.status !== 'REQUESTED' && v.status !== 'PENDING') return false;
          if (S.visitFilter !== 'PENDING' && v.status !== S.visitFilter) return false;
        }
        if (q) {
          const cust = v.leads?.name || '';
          const phone = v.leads?.phone || '';
          const email = v.leads?.email || '';
          const proj = v.properties?.projects?.name || v.properties?.title || '';
          const code = v.properties?.property_code || '';
          const notes = v.notes || '';
          const cNote = cleanVisitNote(v.notes);
          if (![cust, phone, email, proj, code, notes, cNote].some((val) => val.toLowerCase().includes(q))) return false;
        }
        return true;
      });
      if (countEl) countEl.textContent = `${filtered.length} Site Visits`;
      if (tbody) tbody.innerHTML = renderVisitRows(filtered);
      if (cardsWrap) cardsWrap.innerHTML = renderVisitCards(filtered);
      bindVisitActions();
    } else if (S.tab === 'bookings') {
      const tbody = document.getElementById('bookings-table-body');
      const cardsWrap = document.getElementById('bookings-mobile-cards');
      const countEl = document.querySelector('.crm-card-head h2');
      const filtered = S.bookings.filter((b) => {
        if (S.bookingFilter !== 'ALL' && b.status !== S.bookingFilter) return false;
        if (q) {
          const cust = b.leads?.name || '';
          const phone = b.leads?.phone || '';
          const email = b.leads?.email || '';
          const code = b.properties?.property_code || '';
          const proj = b.properties?.projects?.name || '';
          const ref = b.booking_reference || '';
          const notes = b.notes || '';
          if (![cust, phone, email, code, proj, ref, notes].some((val) => val.toLowerCase().includes(q))) return false;
        }
        return true;
      });
      if (countEl) countEl.textContent = `${filtered.length} Confirmed Bookings`;
      if (tbody) tbody.innerHTML = renderBookingRows(filtered);
      if (cardsWrap) cardsWrap.innerHTML = renderBookingCards(filtered);
      bindBookingActions();
    } else if (S.tab === 'reviews') {
      const tbody = document.getElementById('reviews-table-body');
      const cardsWrap = document.getElementById('reviews-mobile-cards');
      const filtered = S.reviews.filter((r) => {
        if (S.reviewFilter !== 'ALL') {
          if (S.reviewFilter === 'SHOW' && !r.is_visible) return false;
          if (S.reviewFilter === 'HIDE' && r.is_visible) return false;
          if (S.reviewFilter === 'NEEDS_ATTENTION' && r.status !== 'NEEDS ATTENTION') return false;
          if (S.reviewFilter === 'NEW' && r.status !== 'NEW') return false;
          if (S.reviewFilter !== 'SHOW' && S.reviewFilter !== 'HIDE' && S.reviewFilter !== 'NEEDS_ATTENTION' && S.reviewFilter !== 'NEW' && r.status !== S.reviewFilter) return false;
        }
        if (q && ![r.reviewer_name, r.review_text, r.project_name, r.source, r.property_code].some((v) => String(v || '').toLowerCase().includes(q))) {
          return false;
        }
        return true;
      });
      if (tbody) tbody.innerHTML = renderReviewRows(filtered);
      if (cardsWrap) cardsWrap.innerHTML = renderReviewCards(filtered);
      bindReviewActions();
    }
  };

  document.getElementById('enquiry-search')?.addEventListener('input', handleSearchInput);
  document.getElementById('visit-search')?.addEventListener('input', handleSearchInput);
  document.getElementById('booking-search')?.addEventListener('input', handleSearchInput);
  document.getElementById('review-search')?.addEventListener('input', handleSearchInput);

  document.getElementById('visit-filter')?.addEventListener('change', (e) => {
    S.visitFilter = e.target.value;
    render();
  });

  document.getElementById('booking-filter')?.addEventListener('change', (e) => {
    S.bookingFilter = e.target.value;
    render();
  });

  document.getElementById('review-filter')?.addEventListener('change', (e) => {
    S.reviewFilter = e.target.value;
    render();
  });

  document.getElementById('sync-google-reviews')?.addEventListener('click', async () => {
    try {
      showToast('Syncing Google Reviews...');
      const res = await api('/api/crm/reviews/sync-google', { method: 'POST' });
      showToast(res.message || 'Google Reviews synced.');
      await load();
      render();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Project selector pills
  document.querySelectorAll('[data-crm-project]').forEach((x) => {
    x.onclick = () => {
      S.selectedProject = x.dataset.crmProject;
      render();
    };
  });

  // View switch (Master Plan vs Table)
  document.querySelectorAll('[data-inv-view]').forEach((x) => {
    x.onclick = () => {
      S.inventoryViewMode = x.dataset.invView;
      render();
    };
  });

  // Interactive Plot Click in SVG Master Plan
  document.querySelectorAll('.plot-item').forEach((x) => {
    x.onclick = () => {
      const plotId = x.dataset.plotId;
      let prop = S.inventory.find((y) => y.property_code === plotId || y.title?.includes(plotId));
      if (!prop) {
        prop = {
          id: plotId,
          property_code: plotId,
          title: `Plot ${plotId}`,
          inventory_status: (x.dataset.status || 'AVAILABLE').toUpperCase(),
          area: 200,
          area_unit: 'Sq.Yds',
          price: 3200000,
          projects: { name: 'VR Green Meadows', slug: 'vr-green-meadows' }
        };
      }
      openPlotDrawer(prop);
    };
  });

  // Interactive Villa Click in SVG Master Plan
  document.querySelectorAll('.vmp-lot-group, .vmp-villa-interactive').forEach((x) => {
    x.onclick = (e) => {
      e.stopPropagation();
      const villaId = x.dataset.villaId || x.closest('[data-villa-id]')?.dataset.villaId;
      if (!villaId) return;
      let prop = S.inventory.find((y) => y.property_code?.toLowerCase() === villaId.toLowerCase());
      if (!prop) {
        prop = {
          id: villaId,
          property_code: villaId.toUpperCase(),
          title: `Villa ${villaId.toUpperCase()}`,
          inventory_status: (x.dataset.status || 'AVAILABLE').toUpperCase(),
          property_type: 'VILLA',
          price: 18500000,
          projects: { name: 'VR Luxury Villas', slug: 'vr-luxury-villas' }
        };
      }
      openPlotDrawer(prop);
    };
  });

  // Open plot drawer from table
  document.querySelectorAll('[data-open-plot]').forEach((x) => {
    x.onclick = () => {
      const p = S.inventory.find((y) => y.id === x.dataset.openPlot);
      if (p) openPlotDrawer(p);
    };
  });

  // Close plot drawer
  document.querySelectorAll('[data-drawer-close]').forEach((x) => {
    x.onclick = closePlotDrawer;
  });
  document.getElementById('crm-drawer-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'crm-drawer-backdrop') closePlotDrawer();
  });

  // Drawer Price Update
  document.getElementById('drawer-save-price')?.addEventListener('click', async () => {
    const priceInput = document.getElementById('drawer-edit-price');
    const newPrice = parseFloat(priceInput?.value);
    const prop = S.activePlotDetail;
    if (!prop || isNaN(newPrice) || newPrice <= 0) {
      showToast('Please enter a valid price amount.', true);
      return;
    }
    try {
      await api(`/api/crm/inventory/${prop.id}/price`, {
        method: 'PATCH',
        body: JSON.stringify({ price: newPrice })
      });
      showToast(`Listed price updated to ${formatIndianCurrency(newPrice)}! Website synced.`);
      prop.price = newPrice;
      await load();
      render();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Plot drawer status transitions (Manual Owner Control)
  document.querySelectorAll('[data-drawer-status]').forEach((x) => {
    x.onclick = async () => {
      const targetStatus = x.dataset.drawerStatus;
      const prop = S.activePlotDetail;
      if (!prop) return;
      const reason = prompt(`Reason for setting ${prop.property_code} to ${label(targetStatus)}:`) || 'Owner manual status change via CRM';
      try {
        await api(`/api/crm/inventory/${prop.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: targetStatus, reason })
        });
        syncPlotOverride(prop.property_code, targetStatus);
        syncPlotOverride(prop.id, targetStatus);
        showToast(`Plot ${prop.property_code} status changed to ${targetStatus}! Master plan updated.`);
        await load();
        render();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  });

  document.querySelectorAll('[data-drawer-offline]').forEach((x) => {
    x.onclick = () => {
      closePlotDrawer();
      offlineBookingModal(x.dataset.drawerOffline);
    };
  });

  document.getElementById('inventory-filter')?.addEventListener('change', (e) => {
    S.inventoryFilter = e.target.value;
    render();
  });

  document.getElementById('inventory-refresh')?.addEventListener('click', async () => {
    const btn = document.getElementById('inventory-refresh');
    if (btn) btn.classList.add('spinning');
    try {
      await load();
      render();
      showToast('Inventory reloaded.');
    } catch (e) {
      showToast(e.message, true);
    }
  });

  document.getElementById('add-visit')?.addEventListener('click', () => addSiteVisitModal());
  document.getElementById('add-booking')?.addEventListener('click', () => offlineBookingModal());
  document.getElementById('add-offline-booking')?.addEventListener('click', () => offlineBookingModal());

  document.querySelectorAll('[data-offline-book]').forEach((x) => {
    x.onclick = () => offlineBookingModal(x.dataset.offlineBook);
  });

  bindEnquiryActions();
  bindVisitActions();
  bindBookingActions();
  bindReviewActions();

  document.querySelectorAll('[data-conversation]').forEach((x) => {
    x.onclick = () => messages(x.dataset.conversation).catch((e) => showToast(e.message, true));
  });

  document.getElementById('ai-toggle')?.addEventListener('change', async (e) => {
    try {
      await api(`/api/crm/conversations/${S.active}`, {
        method: 'PATCH',
        body: JSON.stringify({ ai_enabled: e.target.checked })
      });
      await load();
      render();
      await messages(S.active);
    } catch (x) {
      showToast(x.message, true);
    }
  });

  document.getElementById('toggle-chat')?.addEventListener('click', async () => {
    const c = S.conversations.find((x) => x.id === S.active);
    try {
      await api(`/api/crm/conversations/${S.active}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: c?.status === 'open' ? 'closed' : 'open' })
      });
      await load();
      render();
      await messages(S.active);
    } catch (x) {
      showToast(x.message, true);
    }
  });

  document.getElementById('chat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.disabled = true;
    try {
      await api(`/api/crm/messages/${S.active}`, {
        method: 'POST',
        body: JSON.stringify({ body: text })
      });
      input.value = '';
      await messages(S.active);
    } catch (x) {
      showToast(x.message, true);
    } finally {
      input.disabled = false;
    }
  });

  document.getElementById('reminder-settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
      remind48: document.getElementById('remind-48')?.checked,
      remind24: document.getElementById('remind-24')?.checked,
      remindDay: document.getElementById('remind-day')?.checked
    };
    localStorage.setItem('vr_crm_reminder_settings', JSON.stringify(settings));
    showToast('Reminder preferences saved successfully!');
  });
}

function render() {
  const root = document.getElementById('crm-root');
  if (root) {
    const activeEl = document.activeElement;
    let activeId = null;
    let selectionStart = null;
    let selectionEnd = null;

    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      activeId = activeEl.id || null;
      try {
        selectionStart = activeEl.selectionStart;
        selectionEnd = activeEl.selectionEnd;
      } catch (e) { }
    }

    root.innerHTML = shell(body());
    bind();

    if (activeId) {
      const restoredEl = document.getElementById(activeId);
      if (restoredEl) {
        restoredEl.focus();
        try {
          if (selectionStart !== null && selectionEnd !== null) {
            restoredEl.setSelectionRange(selectionStart, selectionEnd);
          }
        } catch (e) { }
      }
    }

    if (S.tab === 'inbox' && S.active && !S.messages.length) {
      messages(S.active).catch((e) => showToast(e.message, true));
    }
  }
}

function start() {
  if (timer) clearInterval(timer);
  timer = setInterval(async () => {
    try {
      const activeEl = document.activeElement;
      const isUserTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      const isModalOpen = Boolean(document.getElementById('crm-modal'));

      await load();
      if (!isUserTyping && !isModalOpen) {
        render();
      }
    } catch (e) {
      console.warn('[crm]', e.message);
    }
  }, 30000);
}

export function renderCrmPage() {
  return {
    html: '<div id="crm-root"></div>',
    init: () => {
      const root = document.getElementById('crm-root');
      if (!key) return login(root);
      load()
        .then(() => {
          render();
          start();
        })
        .catch((e) => login(root, e.message));
    }
  };
}

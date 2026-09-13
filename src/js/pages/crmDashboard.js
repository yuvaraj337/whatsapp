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
  leads: [],
  conversations: [],
  visits: [],
  inventory: [],
  bookings: [],
  messages: [],
  active: null,
  search: '',
  leadFilter: 'all',
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
        <p>Private workspace for enquiries, leads, WhatsApp conversations, site visits, bookings and inventory.</p>
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
    ['leads', 'Leads', '◉'],
    ['inbox', 'WhatsApp Inbox', '◌'],
    ['visits', 'Site Visits', '⌖'],
    ['inventory', 'Inventory', '▤'],
    ['bookings', 'Bookings', '✓'],
    ['reviews', 'Reviews', '★'],
    ['reminders', 'Reminders', '⏰']
  ];

  const descMap = {
    overview: 'A single view of sales activity and performance.',
    enquiries: 'Customer enquiries from website contact forms, brochures, and showcase modals.',
    leads: 'Track leads with full project and property context through sales qualification.',
    inbox: 'Manage WhatsApp customer conversations and AI handoff.',
    visits: 'Review site visit requests. Confirming a visit NEVER modifies plot inventory.',
    inventory: 'Interactive Master Plan and live plot status control with full manual owner authority.',
    bookings: 'Track confirmed plot bookings, advance payments, and customer records.',
    reviews: 'Manage and approve customer reviews and Google ratings displayed on the public website.',
    reminders: 'Configure automated WhatsApp site visit reminder rules.'
  };

  return `
    <main class="crm-app">
      <aside class="crm-sidebar">
        <div class="crm-side-brand">
          <img src="/images/vr-logo.png" alt="Logo" class="crm-logo-img" style="width:36px;height:36px;border-radius:50%;object-fit:contain;margin-right:10px;" />
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
              ${n[0] === 'enquiries' && S.leads.filter((l) => (l.status || 'new') === 'new').length ? `<em>${S.leads.filter((l) => (l.status || 'new') === 'new').length}</em>` : ''}
              ${n[0] === 'reviews' && S.summary?.pendingReviews ? `<em>${S.summary.pendingReviews}</em>` : ''}
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
          <div>
            <div class="crm-eyebrow">Real Estate Brothers group · OPERATIONS</div>
            <h1>${label(S.tab)}</h1>
            <p>${descMap[S.tab] || 'Manage operations'}</p>
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
  return `
    <div class="crm-stats">
      ${stat('Total Enquiries / Leads', s.totalLeads || 0, `${s.newLeads || 0} new`, '✉')}
      ${stat('Open WhatsApp', s.openConversations || 0, 'needs attention', '◌')}
      ${stat('Visit Requests', s.siteVisitRequests || 0, `${s.confirmedVisits || 0} confirmed`, '⌖')}
      ${stat('Qualified Leads', s.qualifiedLeads || 0, 'sales-ready', '★')}
    </div>
    <div class="crm-overview-grid">
      <section class="crm-card">
        <div class="crm-card-head">
          <div>
            <h2>Lead Pipeline</h2>
            <p>Current sales stages</p>
          </div>
          <button class="crm-link" data-go="leads">View all →</button>
        </div>
        <div class="crm-pipeline">
          ${LEAD_STATUSES.map((x) => {
            const n = S.leads.filter((l) => (l.status || 'new') === x).length;
            return `
              <div>
                <span>${label(x)}</span>
                <strong>${n}</strong>
                <div class="crm-bar">
                  <i style="width:${Math.min(100, (n / Math.max(1, S.leads.length)) * 100)}%"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
      <section class="crm-card">
        <div class="crm-card-head">
          <div>
            <h2>Inventory Status</h2>
            <p>Database source of truth</p>
          </div>
          <button class="crm-link" data-go="inventory">Manage Master Plan →</button>
        </div>
        <div class="crm-inventory-summary">
          ${[['available', i.available || 0], ['hold', (i.hold || 0) + (i.reserved || 0)], ['booked', i.booked || 0], ['sold', i.sold || 0]].map((x) => `
            <div>
              <strong>${x[1]}</strong>
              <span>${label(x[0])}</span>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>Recent Enquiries</h2>
          <p>Latest customer interest with project context</p>
        </div>
        <button class="crm-link" data-go="enquiries">View all →</button>
      </div>
      <div class="crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Project &amp; Property</th>
              <th>Source</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            ${S.leads.slice(0, 8).map((l) => `
              <tr data-open-lead="${l.id}">
                <td>
                  <div class="crm-person">
                    <span>${initials(l.name)}</span>
                    <div>
                      <b>${esc(l.name || 'Unknown')}</b>
                      <small>${esc(l.email || 'No email')}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <a href="https://wa.me/${String(l.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
                    ${esc(l.phone || '—')}
                  </a>
                </td>
                <td>
                  <b>${esc(l.project || 'General')}</b>
                  <small class="crm-cell-sub">${esc(l.property && l.property !== '—' ? 'Plot ' + l.property : '')}</small>
                </td>
                <td><span class="crm-badge">${esc(l.source || 'website')}</span></td>
                <td><span class="crm-badge ${cls(l.status || 'new')}">${label(l.status || 'new')}</span></td>
                <td>${date(l.updated_at)}</td>
              </tr>
            `).join('') || `<tr><td colspan="6"><div class="crm-empty">No leads yet.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function enquiries() {
  const q = S.search.toLowerCase();
  const rows = S.leads.filter((l) => {
    if (q && ![l.name, l.phone, l.email, l.project, l.property, l.source, l.notes].some((v) => String(v || '').toLowerCase().includes(q))) return false;
    return true;
  });

  return `
    <div class="crm-toolbar">
      <div class="crm-search">
        <span>⌕</span>
        <input id="enquiry-search" value="${esc(S.search)}" placeholder="Search customer, phone, property or enquiry message…">
      </div>
      <button class="crm-primary" id="add-lead">+ Add Enquiry</button>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>${rows.length} Enquiries</h2>
          <p>Submissions from website forms, brochure downloads, and property showcase modals.</p>
        </div>
      </div>
      <div class="crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Project &amp; Property</th>
              <th>Source</th>
              <th>Enquiry Message / Notes</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="enquiries-table-body">
            ${renderEnquiryRows(rows)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderEnquiryRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="8"><div class="crm-empty">No enquiries match your search.</div></td></tr>`;
  }
  return rows.map((l) => `
    <tr>
      <td>
        <div class="crm-person">
          <span>${initials(l.name)}</span>
          <div>
            <b>${esc(l.name || 'Unknown')}</b>
            <small>${esc(l.email || 'No email')}</small>
          </div>
        </div>
      </td>
      <td>
        <a href="https://wa.me/${String(l.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
          ${esc(l.phone || '—')}
        </a>
      </td>
      <td>
        <b>${esc(l.project || 'General')}</b>
        <small class="crm-cell-sub">${esc(l.property && l.property !== '—' ? 'Plot ' + l.property : '')}</small>
      </td>
      <td><span class="crm-badge">${esc(l.source || 'Website Form')}</span></td>
      <td style="max-width: 260px; white-space: normal; line-height: 1.45;">
        ${esc(l.notes || 'General enquiry')}
      </td>
      <td>
        <select class="crm-inline-select ${cls(l.status || 'new')}" data-lead-status="${l.id}">
          ${LEAD_STATUSES.map((x) => `<option value="${x}" ${(l.status || 'new') === x ? 'selected' : ''}>${label(x)}</option>`).join('')}
        </select>
      </td>
      <td>${date(l.created_at)}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="crm-small-btn" data-convert-visit="${l.id}" title="Book Site Visit for this lead">📅 Visit</button>
          <button class="crm-small-btn" data-open-lead="${l.id}">Edit</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function leads() {
  const q = S.search.toLowerCase();
  const rows = S.leads.filter((l) =>
    (S.leadFilter === 'all' || (l.status || 'new') === S.leadFilter) &&
    (!q || [l.name, l.phone, l.email, l.project, l.property, l.source, l.notes].some((v) => String(v || '').toLowerCase().includes(q)))
  );

  return `
    <div class="crm-toolbar">
      <div class="crm-search">
        <span>⌕</span>
        <input id="lead-search" value="${esc(S.search)}" placeholder="Search name, phone, project or email…">
      </div>
      <select id="lead-filter">
        <option value="all">All stages</option>
        ${LEAD_STATUSES.map((x) => `<option value="${x}" ${S.leadFilter === x ? 'selected' : ''}>${label(x)}</option>`).join('')}
      </select>
      <button class="crm-primary" id="add-lead">+ Add lead</button>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>${rows.length} leads</h2>
          <p>Every lead clearly displays associated project and property context.</p>
        </div>
      </div>
      <div class="crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Phone</th>
              <th>Project &amp; Property</th>
              <th>Source</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="leads-table-body">
            ${renderLeadRows(rows)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderLeadRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="7"><div class="crm-empty">No leads match this filter.</div></td></tr>`;
  }
  return rows.map((l) => `
    <tr>
      <td>
        <div class="crm-person">
          <span>${initials(l.name)}</span>
          <div>
            <b>${esc(l.name || 'Unknown')}</b>
            <small>${esc(l.email || 'No email')}</small>
          </div>
        </div>
      </td>
      <td>
        <a href="https://wa.me/${String(l.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
          ${esc(l.phone || '—')}
        </a>
      </td>
      <td>
        <b>${esc(l.project || 'Real Estate Brothers group')}</b>
        <small class="crm-cell-sub">${esc(l.property && l.property !== '—' ? 'Plot ' + l.property : '')}</small>
      </td>
      <td><span class="crm-badge">${esc(l.source || 'website')}</span></td>
      <td>
        <select class="crm-inline-select ${cls(l.status || 'new')}" data-lead-status="${l.id}">
          ${LEAD_STATUSES.map((x) => `<option value="${x}" ${(l.status || 'new') === x ? 'selected' : ''}>${label(x)}</option>`).join('')}
        </select>
      </td>
      <td>${date(l.created_at)}</td>
      <td>
        <button class="crm-small-btn" data-open-lead="${l.id}">Open</button>
      </td>
    </tr>
  `).join('');
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
              <p>Lead record</p>
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
  const rows = S.visits.filter((v) => {
    if (S.visitFilter === 'ALL') return true;
    if (S.visitFilter === 'PENDING' && (v.status === 'REQUESTED' || v.status === 'PENDING')) return true;
    return v.status === S.visitFilter;
  });

  return `
    <div class="crm-toolbar">
      <select id="visit-filter">
        <option value="ALL">All visit statuses</option>
        <option value="PENDING" ${S.visitFilter === 'PENDING' ? 'selected' : ''}>Pending Review</option>
        <option value="CONFIRMED" ${S.visitFilter === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
        <option value="RESCHEDULED" ${S.visitFilter === 'RESCHEDULED' ? 'selected' : ''}>Rescheduled</option>
        <option value="COMPLETED" ${S.visitFilter === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        <option value="CANCELLED" ${S.visitFilter === 'CANCELLED' ? 'selected' : ''}>Cancelled / Rejected</option>
      </select>
      <button class="crm-primary" id="add-visit">+ Site visit request</button>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>Site Visits</h2>
          <p>Customer site visits are requests. Confirming a visit dispatches WhatsApp notification and does NOT alter plot status.</p>
        </div>
      </div>
      <div class="crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Property</th>
              <th>Source</th>
              <th>Requested</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((v) => {
              const src = v.source || (v.notes && v.notes.includes('WhatsApp') ? 'WhatsApp AI' : 'Website');
              const displayStatus = v.status === 'REQUESTED' ? 'PENDING' : v.status;
              const statusClass = displayStatus === 'PENDING' ? 'status-hold' : cls(v.status);

              return `
                <tr>
                  <td>
                    <div class="crm-person">
                      <span>${initials(v.leads?.name)}</span>
                      <div>
                        <b>${esc(v.leads?.name || 'Unknown')}</b>
                        <small>
                          <a href="https://wa.me/${String(v.leads?.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 600; text-decoration: none;">
                            ${esc(v.leads?.phone || '—')} 💬
                          </a>
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <b>${esc(v.properties?.title || v.properties?.property_code || '—')}</b>
                    <small class="crm-cell-sub">${esc(v.properties?.projects?.name || '')}</small>
                  </td>
                  <td>
                    <span class="crm-badge" style="${src === 'WhatsApp AI' ? 'background:#dcfce7; color:#15803d;' : 'background:#e0f2fe; color:#0369a1;'}">
                      ${esc(src)}
                    </span>
                  </td>
                  <td>${date(v.requested_at)}</td>
                  <td><b>${date(v.scheduled_at)}</b></td>
                  <td><span class="crm-badge ${statusClass}">${displayStatus}</span></td>
                  <td style="max-width: 220px; white-space: normal; font-size: 12px; line-height: 1.4;">${esc(v.notes || '—')}</td>
                  <td>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      ${v.status === 'REQUESTED' || v.status === 'RESCHEDULED' ? `
                        <button class="crm-action success" data-confirm-visit="${v.id}" title="Confirm site visit & send WhatsApp to customer">Confirm</button>
                        <button class="crm-action danger" data-cancel-visit="${v.id}" title="Reject site visit">Reject</button>
                      ` : v.status === 'CONFIRMED' ? `
                        <button class="crm-action" data-complete-visit="${v.id}">Complete</button>
                        <button class="crm-action" data-reschedule-visit="${v.id}">Reschedule</button>
                      ` : '—'}
                    </div>
                  </td>
                </tr>
              `;
            }).join('') || `<tr><td colspan="8"><div class="crm-empty">No site visits.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
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
    <!-- 1. Projects List Selector Pills (Section 6 & 12) -->
    <div class="crm-project-pills">
      ${CRM_PROJECTS.map((p) => `
        <button class="crm-project-pill ${S.selectedProject === p.slug ? 'active' : ''}" data-crm-project="${p.slug}">
          ${p.name}
        </button>
      `).join('')}
    </div>

    <!-- 2. Inventory Toolbar -->
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

    <!-- 3. Content View: Master Plan or Table -->
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>${currentProj.name}</h2>
          <p>Click any plot to view customer details, record offline bookings, and control manual status with <strong>no automatic hold expiry</strong>.</p>
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
  } catch (e) {}

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

  // Fallback interactive grid for other projects
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
          }).join('') || `<tr><td colspan="7"><div class="crm-empty">No inventory found.</div></td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderPlotDrawerHtml() {
  const p = S.activePlotDetail;
  if (!p) return '';

  const status = p.inventory_status || 'AVAILABLE';
  const b = p.active_booking;

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
              <span>Price</span>
              <strong>${p.price ? '₹' + Number(p.price).toLocaleString('en-IN') : '₹32,00,000'}</strong>
            </div>
            <div>
              <span>Facing</span>
              <strong>${p.facing || (p.property_code <= 'P06' ? 'East' : p.property_code <= 'P12' ? 'West' : 'North')}</strong>
            </div>
          </div>

          <!-- Active Customer Information Card (Section 6 & 11) -->
          ${b || status === 'BOOKED' || status === 'HOLD' || status === 'SOLD' ? `
            <div class="crm-drawer-section">
              <h3>Customer Information</h3>
              <div class="crm-drawer-customer-card">
                <div class="crm-drawer-customer-row">
                  <span>Name:</span>
                  <b>${esc(b?.customer_name || 'Recorded Customer')}</b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Phone:</span>
                  <b>
                    <a href="https://wa.me/${String(b?.customer_phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" style="color: #128C7E; font-weight: 700; text-decoration: none;">
                      ${esc(b?.customer_phone || '—')} 💬
                    </a>
                  </b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Email:</span>
                  <b>${esc(b?.customer_email || '—')}</b>
                </div>
                <div class="crm-drawer-customer-row">
                  <span>Source:</span>
                  <b class="crm-badge">${esc(b?.source || 'Offline')}</b>
                </div>
                ${b?.booking_reference ? `
                  <div class="crm-drawer-customer-row">
                    <span>Reference:</span>
                    <b>${esc(b.booking_reference)}</b>
                  </div>
                ` : ''}
                ${b?.amount ? `
                  <div class="crm-drawer-customer-row">
                    <span>Advance Paid:</span>
                    <b>₹${Number(b.amount).toLocaleString('en-IN')}</b>
                  </div>
                ` : ''}
                ${b?.booked_at ? `
                  <div class="crm-drawer-customer-row">
                    <span>Date:</span>
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

          <!-- Audit History Timeline (Section 24) -->
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

          <!-- Owner Manual Status Actions (Sections 7 & 11) -->
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
  const rows = S.bookings.filter((b) => S.bookingFilter === 'ALL' || b.status === S.bookingFilter);
  return `
    <div class="crm-toolbar">
      <select id="booking-filter">
        <option value="ALL">All bookings</option>
        ${BOOKING_STATUSES.map((x) => `<option value="${x}" ${S.bookingFilter === x ? 'selected' : ''}>${label(x)}</option>`).join('')}
      </select>
    </div>
    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>Bookings &amp; Reservations</h2>
          <p>Confirmed customer plot bookings and payment records.</p>
        </div>
      </div>
      <div class="crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Property</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((b) => `
              <tr>
                <td>
                  <div class="crm-person">
                    <span>${initials(b.leads?.name)}</span>
                    <div>
                      <b>${esc(b.leads?.name || 'Unknown')}</b>
                      <small>${esc(b.leads?.phone || '')}</small>
                    </div>
                  </div>
                </td>
                <td>${esc(b.properties?.property_code || '—')}</td>
                <td>${esc(b.booking_reference || '—')}</td>
                <td><span class="crm-badge ${cls(b.status)}">${label(b.status)}</span></td>
                <td>${b.amount ? `${esc(b.currency || 'INR')} ${esc(b.amount)}` : '—'}</td>
                <td>
                  ${b.status === 'PENDING' ? `
                    <button class="crm-action success" data-booking-confirm="${b.id}">Confirm</button>
                    <button class="crm-action danger" data-booking-cancel="${b.id}">Cancel</button>
                  ` : b.status === 'CONFIRMED' ? `
                    <button class="crm-action" data-booking-complete="${b.id}">Complete</button>
                    <button class="crm-action danger" data-booking-cancel="${b.id}">Cancel</button>
                  ` : '—'}
                </td>
              </tr>
            `).join('') || `<tr><td colspan="6"><div class="crm-empty">No bookings.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
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
            <p style="margin: 0 0 8px;">Hello <strong>Ramesh Varma</strong>,</p>
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
      if (S.reviewFilter !== 'SHOW' && S.reviewFilter !== 'HIDE' && r.status !== S.reviewFilter) return false;
    }
    if (q && ![r.reviewer_name, r.review_text, r.project_name, r.source].some((v) => String(v || '').toLowerCase().includes(q))) {
      return false;
    }
    return true;
  });

  const totalCount = S.reviews.length;
  const pendingCount = S.reviews.filter((r) => r.status === 'PENDING').length;
  const approvedCount = S.reviews.filter((r) => r.status === 'APPROVED' && r.is_visible).length;
  const hiddenCount = S.reviews.filter((r) => r.status === 'HIDDEN' || !r.is_visible).length;

  return `
    <div class="crm-toolbar">
      <div class="crm-search">
        <span>⌕</span>
        <input id="review-search" value="${esc(S.search)}" placeholder="Search reviewer, text, or project…">
      </div>
      <select id="review-filter">
        <option value="ALL" ${S.reviewFilter === 'ALL' ? 'selected' : ''}>All Reviews (${totalCount})</option>
        <option value="PENDING" ${S.reviewFilter === 'PENDING' ? 'selected' : ''}>Pending Approval (${pendingCount})</option>
        <option value="APPROVED" ${S.reviewFilter === 'APPROVED' ? 'selected' : ''}>Approved &amp; Live (${approvedCount})</option>
        <option value="HIDDEN" ${S.reviewFilter === 'HIDDEN' ? 'selected' : ''}>Hidden (${hiddenCount})</option>
      </select>
      <button class="crm-primary" id="sync-google-reviews">↻ Sync Google Reviews</button>
    </div>

    <div class="crm-overview-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
      <article class="crm-stat">
        <div class="crm-stat-icon">★</div>
        <div>
          <span>Total Reviews</span>
          <strong>${totalCount}</strong>
          <small>Google &amp; Direct Sources</small>
        </div>
      </article>
      <article class="crm-stat">
        <div class="crm-stat-icon" style="color: #f59e0b;">⏳</div>
        <div>
          <span>Pending Approval</span>
          <strong style="color: #d97706;">${pendingCount}</strong>
          <small>Awaiting Owner Approval</small>
        </div>
      </article>
      <article class="crm-stat">
        <div class="crm-stat-icon" style="color: #10b981;">✓</div>
        <div>
          <span>Live on Website</span>
          <strong style="color: #059669;">${approvedCount}</strong>
          <small>Approved &amp; Visible</small>
        </div>
      </article>
      <article class="crm-stat">
        <div class="crm-stat-icon" style="color: #6b7280;">👁</div>
        <div>
          <span>Hidden</span>
          <strong>${hiddenCount}</strong>
          <small>Suppressed from Public</small>
        </div>
      </article>
    </div>

    <section class="crm-card">
      <div class="crm-card-head">
        <div>
          <h2>Review Approval Management</h2>
          <p>Only reviews marked as <strong>APPROVED</strong> and <strong>SHOW</strong> appear on the public website. Customers cannot submit reviews publicly.</p>
        </div>
      </div>
      <div class="crm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Review Text</th>
              <th>Project / Unit</th>
              <th>Source</th>
              <th>Status</th>
              <th>Website Visibility</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reviews-table-body">
            ${renderReviewRows(rows)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderReviewRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="9"><div class="crm-empty">No reviews match your filter.</div></td></tr>`;
  }
  return rows.map((r) => {
    const isApproved = r.status === 'APPROVED';
    const isVisible = Boolean(r.is_visible);
    const starStr = '★'.repeat(Math.min(5, Math.max(1, r.rating || 5))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, r.rating || 5))));

    return `
      <tr>
        <td>
          <div class="crm-person">
            <span>${initials(r.reviewer_name)}</span>
            <div>
              <b>${esc(r.reviewer_name || 'Google User')}</b>
              <small>${esc(r.source || 'Google')}</small>
            </div>
          </div>
        </td>
        <td style="color: #f59e0b; font-weight: 700; white-space: nowrap;">
          ${starStr} <small style="color:#6b7280;">(${r.rating || 5}/5)</small>
        </td>
        <td style="max-width: 280px; white-space: normal; line-height: 1.45; font-size: 13px;">
          ${esc(r.review_text || '')}
        </td>
        <td>
          <b>${esc(r.project_name || 'VR Real Estates')}</b>
          ${r.property_code ? `<small class="crm-cell-sub">Plot ${esc(r.property_code)}</small>` : ''}
        </td>
        <td>
          <span class="crm-badge" style="background:#e0f2fe; color:#0369a1;">${esc(r.source || 'Google')}</span>
        </td>
        <td>
          <span class="crm-badge ${cls(r.status)}">${label(r.status)}</span>
        </td>
        <td>
          <span class="crm-badge" style="${isVisible ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'}">
            ${isVisible ? '● SHOW' : '○ HIDE'}
          </span>
        </td>
        <td>${date(r.review_date || r.created_at)}</td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${!isApproved || !isVisible ? `
              <button class="crm-small-btn" data-review-approve="${r.id}" style="background:#dcfce7; border-color:#22c55e; color:#15803d; font-weight:600;">
                ✓ Approve &amp; Show
              </button>
            ` : ''}
            ${isVisible ? `
              <button class="crm-small-btn" data-review-hide="${r.id}" style="background:#fee2e2; border-color:#ef4444; color:#b91c1c;">
                Hide
              </button>
            ` : `
              <button class="crm-small-btn" data-review-show="${r.id}">
                Show
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function body() {
  return ({
    overview,
    enquiries,
    leads,
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
    api('/api/crm/leads'),
    api('/api/crm/conversations'),
    api('/api/crm/site-visits'),
    api('/api/crm/inventory'),
    api('/api/crm/bookings'),
    api('/api/crm/reviews').catch(() => ({ reviews: [] }))
  ]);
  S.summary = a;
  S.leads = b.leads || [];
  S.conversations = c.conversations || [];
  S.visits = d.visits || [];
  S.inventory = e.properties || [];
  S.bookings = f.bookings || [];
  S.reviews = g.reviews || [];

  // If active plot is open, keep it updated
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

function leadModal(l) {
  modal(`
    <button class="crm-modal-close" data-close>×</button>
    <div class="crm-eyebrow">LEAD RECORD</div>
    <h2>${l ? 'Edit Lead' : 'Add Lead'}</h2>
    <form id="lead-form" class="crm-form">
      <label>Full Name *
        <input name="name" required value="${esc(l?.name || '')}">
      </label>
      <label>Phone Number *
        <input name="phone" value="${esc(l?.phone || '')}" ${l ? 'readonly' : ''} placeholder="10-digit mobile number">
      </label>
      <label>Email Address
        <input name="email" type="email" value="${esc(l?.email || '')}">
      </label>
      <label>Source
        <input name="source" value="${esc(l?.source || 'crm')}">
      </label>
      <label>Status
        <select name="status">
          ${LEAD_STATUSES.map((x) => `<option value="${x}" ${(l?.status || 'new') === x ? 'selected' : ''}>${label(x)}</option>`).join('')}
        </select>
      </label>
      <label>Notes / Requirements
        <textarea name="notes" rows="4">${esc(l?.notes || '')}</textarea>
      </label>
      <div class="crm-modal-actions">
        <button type="button" class="crm-small-btn" data-close>Cancel</button>
        <button class="crm-primary">Save Lead</button>
      </div>
    </form>
  `);
  document.getElementById('lead-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api(l ? `/api/crm/leads/${l.id}` : '/api/crm/leads', {
        method: l ? 'PATCH' : 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
      });
      document.getElementById('crm-modal')?.remove();
      await load();
      render();
      showToast('Lead saved successfully.');
    } catch (x) {
      showToast(x.message, true);
    }
  };
}

function visitModal(preselectedLeadId = '') {
  const leads = S.leads.filter((x) => x.phone);
  const props = S.inventory.filter((x) => x.inventory_status === 'AVAILABLE' || x.inventory_status === 'RESERVED');
  modal(`
    <button class="crm-modal-close" data-close>×</button>
    <div class="crm-eyebrow">SITE VISIT</div>
    <h2>Create Site Visit Request</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: -6px; margin-bottom: 14px;">
      Site visits are visitor appointments and NEVER modify plot inventory status.
    </p>
    <form id="visit-form" class="crm-form">
      <label>Customer / Lead
        <select name="lead_id" required>
          ${leads.map((x) => `
            <option value="${x.id}" ${x.id === preselectedLeadId ? 'selected' : ''}>
              ${esc(x.name || x.phone)} · ${esc(x.phone)}
            </option>
          `).join('')}
        </select>
      </label>
      <label>Property
        <select name="property_id" required>
          ${props.map((x) => `
            <option value="${x.id}">
              ${esc(x.property_code)} · ${esc(x.title || '')} (${esc(x.projects?.name || '')})
            </option>
          `).join('')}
        </select>
      </label>
      <label>Preferred Date &amp; Time
        <input name="scheduled_at" type="datetime-local">
      </label>
      <label>Visit Notes
        <textarea name="notes" rows="3" placeholder="Pickup location, visitor preferences, etc."></textarea>
      </label>
      <div class="crm-modal-actions">
        <button type="button" class="crm-small-btn" data-close>Cancel</button>
        <button class="crm-primary">Create Request</button>
      </div>
    </form>
  `);
  document.getElementById('visit-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/crm/site-visits', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
      });
      document.getElementById('crm-modal')?.remove();
      await load();
      render();
      showToast('Site visit request created.');
    } catch (x) {
      showToast(x.message, true);
    }
  };
}

function offlineBookingModal(preselectedPropertyId = '') {
  const availableProps = S.inventory.filter((x) => x.inventory_status === 'AVAILABLE' || x.id === preselectedPropertyId);
  modal(`
    <button class="crm-modal-close" data-close>×</button>
    <div class="crm-eyebrow">OFFLINE CUSTOMER BOOKING</div>
    <h2>Record Plot / Unit Booking</h2>
    <p style="color: #6B7280; font-size: 0.88rem; margin-top: -8px; margin-bottom: 16px;">
      Direct customer booking. Instantly updates inventory and synchronizes with the public master plan.
    </p>
    <form id="offline-booking-form" class="crm-form">
      <label>Customer Full Name *
        <input name="customer_name" required placeholder="e.g. Ramesh Varma" />
      </label>
      <label>Mobile Number (WhatsApp) *
        <input name="customer_phone" type="tel" required placeholder="e.g. 9876543210" maxlength="10" />
      </label>
      <label>Email Address (Optional)
        <input name="customer_email" type="email" placeholder="customer@example.com" />
      </label>
      <label>Select Property / Plot *
        <select name="property_id" required>
          ${availableProps.map((p) => `
            <option value="${p.id}" ${p.id === preselectedPropertyId ? 'selected' : ''}>
              ${esc(p.property_code)} · ${esc(p.title || p.projects?.name || 'Unit')} (${p.inventory_status})
            </option>
          `).join('')}
        </select>
      </label>
      <label>Booking Status *
        <select name="status">
          <option value="BOOKED" selected>BOOKED (Confirmed Plot Booking)</option>
          <option value="HOLD">HOLD (Owner Manual Hold - No Auto Expiry)</option>
          <option value="SOLD">SOLD (Full Settlement Done)</option>
          <option value="BLOCKED">BLOCKED (Admin Restricted)</option>
        </select>
      </label>
      <label>Advance Amount Received (₹)
        <input name="amount" type="number" placeholder="e.g. 100000" />
      </label>
      <label>Booking Notes / Cheque / Transaction Details
        <textarea name="notes" rows="2" placeholder="Payment receipt no, branch walk-in, etc."></textarea>
      </label>
      <div class="crm-modal-actions">
        <button type="button" class="crm-small-btn" data-close>Cancel</button>
        <button class="crm-primary">Save &amp; Update Inventory</button>
      </div>
    </form>
  `);

  document.getElementById('offline-booking-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      await api('/api/crm/offline-booking', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      const p = S.inventory.find((x) => x.id === data.property_id);
      if (p) {
        syncPlotOverride(p.property_code, data.status);
        syncPlotOverride(p.id, data.status);
      }
      showToast(`Plot successfully updated for ${data.customer_name}! Master plan synced.`);
      document.getElementById('crm-modal')?.remove();
      await load();
      render();
    } catch (err) {
      showToast(err.message, true);
    }
  };
}

async function openPlotDrawer(p) {
  if (!p) return;
  S.selectedPlotId = p.property_code;
  S.activePlotDetail = p;
  S.plotHistory = [];

  // Fetch history asynchronously
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
    showToast(status === 'CONFIRMED' ? 'Booking confirmed & WhatsApp sent to customer!' : 'Booking status updated.');
    await load();
    render();
  } catch (x) {
    showToast(x.message, true);
  }
}

function bindLeadActions() {
  document.querySelectorAll('[data-open-lead]').forEach((x) => {
    x.onclick = () => {
      const l = S.leads.find((y) => y.id === x.dataset.openLead);
      if (l) leadModal(l);
    };
  });
  document.querySelectorAll('[data-lead-status]').forEach((x) => {
    x.onchange = async () => {
      try {
        await api(`/api/crm/leads/${x.dataset.leadStatus}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: x.value })
        });
        await load();
        render();
        showToast('Lead status updated.');
      } catch (e) {
        showToast(e.message, true);
      }
    };
  });
}

function bindEnquiryActions() {
  bindLeadActions();
  document.querySelectorAll('[data-convert-visit]').forEach((x) => {
    x.onclick = () => visitModal(x.dataset.convertVisit);
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
        showToast('Review approved & visible on website.');
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
          body: JSON.stringify({ is_visible: false })
        });
        showToast('Review hidden from website.');
        await load();
        render();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  });

  document.querySelectorAll('[data-review-show]').forEach((btn) => {
    btn.onclick = async () => {
      try {
        await api(`/api/crm/reviews/${btn.dataset.reviewShow}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_visible: true })
        });
        showToast('Review is now visible on website.');
        await load();
        render();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  });
}

function bind() {
  // Navigation tabs
  document.querySelectorAll('[data-tab]').forEach((x) => {
    x.onclick = () => {
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

  document.getElementById('crm-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem('vr_crm_key');
    key = '';
    if (timer) clearInterval(timer);
    login(document.getElementById('crm-root'));
  });

  document.getElementById('refresh')?.addEventListener('click', async () => {
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
    if (S.tab === 'leads') {
      const tbody = document.getElementById('leads-table-body');
      const countEl = document.querySelector('.crm-card-head h2');
      const filtered = S.leads.filter((l) =>
        (S.leadFilter === 'all' || (l.status || 'new') === S.leadFilter) &&
        (!q || [l.name, l.phone, l.email, l.project, l.property, l.source, l.notes].some((v) => String(v || '').toLowerCase().includes(q)))
      );
      if (countEl) countEl.textContent = `${filtered.length} leads`;
      if (tbody) {
        tbody.innerHTML = renderLeadRows(filtered);
        bindLeadActions();
      }
    } else if (S.tab === 'enquiries') {
      const tbody = document.getElementById('enquiries-table-body');
      const countEl = document.querySelector('.crm-card-head h2');
      const filtered = S.leads.filter((l) =>
        !q || [l.name, l.phone, l.email, l.project, l.property, l.source, l.notes].some((v) => String(v || '').toLowerCase().includes(q))
      );
      if (countEl) countEl.textContent = `${filtered.length} Enquiries`;
      if (tbody) {
        tbody.innerHTML = renderEnquiryRows(filtered);
        bindEnquiryActions();
      }
    } else if (S.tab === 'reviews') {
      const tbody = document.getElementById('reviews-table-body');
      const filtered = S.reviews.filter((r) => {
        if (S.reviewFilter !== 'ALL') {
          if (S.reviewFilter === 'SHOW' && !r.is_visible) return false;
          if (S.reviewFilter === 'HIDE' && r.is_visible) return false;
          if (S.reviewFilter !== 'SHOW' && S.reviewFilter !== 'HIDE' && r.status !== S.reviewFilter) return false;
        }
        if (q && ![r.reviewer_name, r.review_text, r.project_name, r.source].some((v) => String(v || '').toLowerCase().includes(q))) {
          return false;
        }
        return true;
      });
      if (tbody) {
        tbody.innerHTML = renderReviewRows(filtered);
        bindReviewActions();
      }
    }
  };

  document.getElementById('lead-search')?.addEventListener('input', handleSearchInput);
  document.getElementById('enquiry-search')?.addEventListener('input', handleSearchInput);
  document.getElementById('review-search')?.addEventListener('input', handleSearchInput);

  document.getElementById('lead-filter')?.addEventListener('change', (e) => {
    S.leadFilter = e.target.value;
    render();
  });

  document.getElementById('visit-filter')?.addEventListener('change', (e) => {
    S.visitFilter = e.target.value;
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
    x.onclick = () => offlineBookingModal(x.dataset.drawerOffline);
  });

  document.getElementById('inventory-filter')?.addEventListener('change', (e) => {
    S.inventoryFilter = e.target.value;
    render();
  });

  document.getElementById('inventory-refresh')?.addEventListener('click', async () => {
    await load();
    render();
    showToast('Inventory reloaded.');
  });

  document.getElementById('booking-filter')?.addEventListener('change', (e) => {
    S.bookingFilter = e.target.value;
    render();
  });

  document.getElementById('add-lead')?.addEventListener('click', () => leadModal());
  document.getElementById('add-visit')?.addEventListener('click', () => visitModal());
  document.getElementById('add-offline-booking')?.addEventListener('click', () => offlineBookingModal());

  document.querySelectorAll('[data-offline-book]').forEach((x) => {
    x.onclick = () => offlineBookingModal(x.dataset.offlineBook);
  });

  bindEnquiryActions();
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

  document.querySelectorAll('[data-booking-confirm]').forEach((x) => {
    x.onclick = () => patchBooking(x.dataset.bookingConfirm, 'CONFIRMED');
  });

  document.querySelectorAll('[data-booking-complete]').forEach((x) => {
    x.onclick = () => patchBooking(x.dataset.bookingComplete, 'COMPLETED');
  });

  document.querySelectorAll('[data-booking-cancel]').forEach((x) => {
    x.onclick = async () => {
      if (confirm('Cancel this booking and release inventory?')) await patchBooking(x.dataset.bookingCancel, 'CANCELLED');
    };
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
      } catch (e) {}
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
        } catch (e) {}
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

import { api } from '../api/client.js';
import { openSiteVisitFlow } from './sharedBookSiteVisit.js';

// ============================================================================
// 100% CODE-DRIVEN 3D ARCHITECTURAL MASTER PLAN & OPEN PLOTS ENGINE
// Visual and functional match to design reference mockup
// ============================================================================

/**
 * Generates dimensional 3D spherical trees with layered canopy depth, multiple puffs, and soft shadows
 */
function renderTreeSvg(cx, cy, r, id = '', type = 'tree') {
  if (type === 'flower-pink') {
    return `
      <g class="mp-tree mp-flower" data-tree="${id}">
        <ellipse cx="${cx + 1}" cy="${cy + 2}" rx="${r * 0.9}" ry="${r * 0.8}" fill="rgba(14, 38, 18, 0.25)" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#EC4899" />
        <circle cx="${cx - r * 0.2}" cy="${cy - r * 0.2}" r="${r * 0.6}" fill="#F472B6" />
        <circle cx="${cx + r * 0.15}" cy="${cy - r * 0.15}" r="${r * 0.3}" fill="#FBCFE8" />
      </g>
    `;
  }
  if (type === 'flower-yellow') {
    return `
      <g class="mp-tree mp-flower" data-tree="${id}">
        <ellipse cx="${cx + 1}" cy="${cy + 2}" rx="${r * 0.9}" ry="${r * 0.8}" fill="rgba(14, 38, 18, 0.25)" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#EAB308" />
        <circle cx="${cx - r * 0.2}" cy="${cy - r * 0.2}" r="${r * 0.6}" fill="#FDE047" />
        <circle cx="${cx + r * 0.15}" cy="${cy - r * 0.15}" r="${r * 0.3}" fill="#FEF08A" />
      </g>
    `;
  }
  return `
    <g class="mp-tree" data-tree="${id}">
      <!-- Soft Ambient Shadow -->
      <ellipse cx="${cx + r * 0.22}" cy="${cy + r * 0.26}" rx="${r * 1.12}" ry="${r * 0.9}" fill="rgba(10, 28, 12, 0.38)" />
      <!-- Base Foliage Shadow -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#mp-tree-base)" />
      <!-- Mid Foliage Body -->
      <circle cx="${cx - r * 0.08}" cy="${cy - r * 0.08}" r="${r * 0.85}" fill="url(#mp-tree-mid)" />
      <!-- Top Canopy Highlight Puffs -->
      <circle cx="${cx - r * 0.22}" cy="${cy - r * 0.22}" r="${r * 0.5}" fill="url(#mp-tree-top)" />
      <circle cx="${cx + r * 0.18}" cy="${cy - r * 0.12}" r="${r * 0.38}" fill="url(#mp-tree-top)" opacity="0.9" />
      <circle cx="${cx - r * 0.05}" cy="${cy + r * 0.15}" r="${r * 0.35}" fill="url(#mp-tree-top)" opacity="0.75" />
    </g>
  `;
}

/**
 * Generates perimeter tree line around the boundary with alternating trees and flower shrubs
 */
function renderPerimeterTreeLine() {
  let trees = '';
  const topY = 22;
  const bottomY = 678;
  const leftX = 24;
  const rightX = 856;
  const radius = 14;

  // Top perimeter row
  for (let x = 32; x <= 850; x += 28) {
    trees += renderTreeSvg(x, topY, radius, `top-${x}`);
    if (x % 56 === 0) {
      trees += renderTreeSvg(x + 14, topY + 4, 7, `top-fl-${x}`, (x % 112 === 0) ? 'flower-pink' : 'flower-yellow');
    }
  }

  // Bottom perimeter row (leaving gap for Main Entrance at x: 350-530)
  for (let x = 32; x <= 850; x += 28) {
    if (x >= 350 && x <= 530) continue;
    trees += renderTreeSvg(x, bottomY, radius, `bot-${x}`);
    if (x % 56 === 0) {
      trees += renderTreeSvg(x + 14, bottomY - 4, 7, `bot-fl-${x}`, (x % 112 === 0) ? 'flower-pink' : 'flower-yellow');
    }
  }

  // Left perimeter column
  for (let y = 40; y <= 660; y += 28) {
    trees += renderTreeSvg(leftX, y, radius, `left-${y}`);
    if (y % 56 === 0) {
      trees += renderTreeSvg(leftX + 4, y + 14, 7, `left-fl-${y}`, (y % 112 === 0) ? 'flower-pink' : 'flower-yellow');
    }
  }

  // Right perimeter column
  for (let y = 40; y <= 660; y += 28) {
    trees += renderTreeSvg(rightX, y, radius, `right-${y}`);
    if (y % 56 === 0) {
      trees += renderTreeSvg(rightX - 4, y + 14, 7, `right-fl-${y}`, (y % 112 === 0) ? 'flower-pink' : 'flower-yellow');
    }
  }

  // Buffer tree cluster above entrance (y: 590 to 626)
  for (let x = 270; x <= 810; x += 30) {
    trees += renderTreeSvg(x, 622, 11, `buf-${x}`);
    if (x % 60 === 0) {
      trees += renderTreeSvg(x + 15, 620, 6, `buf-fl-${x}`, 'flower-pink');
    }
  }

  return trees;
}

// ============================================================================
// CALIBRATED PLOT GEOMETRY (Referenced directly to 1024x831 master plan artwork)
// Each plot coordinates match the exact visible plot grass boundaries
// ============================================================================
export const PLOT_COORDINATES = {
  // Row 1 (y: 124, height: 88) - 6 Plots
  P01: { x: 247, y: 124, width: 78, height: 88 },
  P02: { x: 330, y: 124, width: 77, height: 88 },
  P03: { x: 413, y: 124, width: 78, height: 88 },
  P04: { x: 496, y: 124, width: 78, height: 88 },
  P05: { x: 579, y: 124, width: 78, height: 88 },
  P06: { x: 662, y: 124, width: 78, height: 88 },

  // Row 2 (y: 299, height: 92) - 6 Plots
  P07: { x: 247, y: 299, width: 78, height: 92 },
  P08: { x: 330, y: 299, width: 77, height: 92 },
  P09: { x: 413, y: 299, width: 78, height: 92 },
  P10: { x: 496, y: 299, width: 78, height: 92 },
  P11: { x: 579, y: 299, width: 78, height: 92 },
  P12: { x: 662, y: 299, width: 78, height: 92 },

  // Row 3 (y: 478, height: 91) - 6 Plots
  P13: { x: 247, y: 478, width: 78, height: 91 },
  P14: { x: 330, y: 478, width: 77, height: 91 },
  P15: { x: 413, y: 478, width: 78, height: 91 },
  P16: { x: 496, y: 478, width: 78, height: 91 },
  P17: { x: 579, y: 478, width: 78, height: 91 },
  P18: { x: 662, y: 478, width: 78, height: 91 },

  // Extra perimeter plots if present in dataset (Columns 7 & 8)
  P19: { x: 745, y: 124, width: 78, height: 88 },
  P20: { x: 828, y: 124, width: 78, height: 88 },
  P21: { x: 745, y: 299, width: 78, height: 92 },
  P22: { x: 828, y: 299, width: 78, height: 92 },
  P23: { x: 745, y: 478, width: 78, height: 91 },
  P24: { x: 828, y: 478, width: 78, height: 91 },
};

/**
 * Pixel-Perfect Interactive Master Plan SVG
 * Overlays interactive data-driven plot zones & status engine over the photorealistic 3D Master Layout
 */
export function renderMasterPlanSvg(plots = [], selectedPlotId = 'P18', prefix = 'mp') {
  let overrides = {};
  try {
    overrides = JSON.parse(localStorage.getItem('vr_plot_status_overrides') || '{}');
  } catch (e) {}

  // Render 18 Interactive Data-Driven Plot Overlays accurately following artwork geometry
  const plotsToRender = plots.slice(0, 18);
  const plotsSvgHtml = plotsToRender.map((p) => {
    const geo = PLOT_COORDINATES[p.id] || { x: 247, y: 124, width: 78, height: 88 };
    const { x, y, width, height } = geo;
    const isSelected = p.id.toUpperCase() === selectedPlotId.toUpperCase();
    const effectiveStatus = (overrides[p.id] || overrides[p.num] || p.status || 'available').toLowerCase();
    const isAvailable = effectiveStatus === 'available';
    const isReserved = effectiveStatus === 'reserved' || effectiveStatus === 'booked' || effectiveStatus === 'hold';
    const isSold = effectiveStatus === 'sold';

    // Phase 6 & 7: Subtle, semi-transparent overlays preserving background master-plan artwork
    let strokeColor = 'rgba(34, 197, 94, 0.55)';
    let strokeWidth = '1.2';
    let fillColor = 'rgba(34, 197, 94, 0.08)';
    let textColor = '#0F261C';
    let subColor = '#4B5563';

    if (isSelected) {
      strokeColor = '#0284C7';
      strokeWidth = '2.5';
      fillColor = 'rgba(2, 132, 199, 0.16)';
      textColor = '#0369A1';
      subColor = '#0284C7';
    } else if (isReserved) {
      strokeColor = 'rgba(239, 68, 68, 0.5)';
      strokeWidth = '1.4';
      fillColor = 'rgba(239, 68, 68, 0.12)';
      textColor = '#7F1D1D';
      subColor = '#991B1B';
    } else if (isSold) {
      strokeColor = 'rgba(220, 38, 38, 0.6)';
      strokeWidth = '1.5';
      fillColor = 'rgba(220, 38, 38, 0.18)';
      textColor = '#881337';
      subColor = '#9F1239';
    }

    // Centered label coordinates
    const cx = x + width / 2;
    const cy = y + height / 2;
    const pillW = 56;
    const pillH = 32;
    const pillX = cx - pillW / 2;
    const pillY = cy - pillH / 2 - (isSold || isReserved ? 5 : 0);

    return `
      <g class="plot-item ${isSelected ? 'plot-selected' : ''}" 
         data-plot-id="${p.id}" 
         data-status="${p.status}"
         data-size="${p.size}"
         data-facing="${p.facing}"
         data-road="${p.road}"
         data-price="${p.price}"
         role="button"
         tabindex="0"
         aria-label="Plot ${p.num}, ${p.size} Sq.Yds, ${p.status}">
        
        <!-- Plot Exact Boundary Overlay & Semi-Transparent Status Color -->
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="3" 
              fill="${fillColor}" 
              stroke="${strokeColor}" 
              stroke-width="${strokeWidth}" 
              class="plot-rect" />

        <!-- Centered Plot Info Pill -->
        <g class="plot-label-pill" transform="translate(${pillX}, ${pillY})">
          <rect x="0" y="0" width="${pillW}" height="${pillH}" rx="5" 
                fill="rgba(255, 255, 255, 0.92)" 
                stroke="${isSelected ? '#0284C7' : (isSold ? 'rgba(239, 68, 68, 0.5)' : (isReserved ? 'rgba(245, 158, 11, 0.5)' : 'rgba(34, 197, 94, 0.45)'))}" 
                stroke-width="${isSelected ? '1.8' : '1'}" />
          
          <!-- Plot ID -->
          <text x="${pillW / 2}" y="14" 
                fill="${textColor}" 
                font-family="'Plus Jakarta Sans', sans-serif" 
                font-size="11.5" 
                font-weight="800" 
                text-anchor="middle"
                class="plot-num-text">
            ${p.num}
          </text>

          <!-- Plot Size Subtitle -->
          <text x="${pillW / 2}" y="26" 
                fill="${subColor}" 
                font-family="'Plus Jakarta Sans', sans-serif" 
                font-size="8" 
                font-weight="700" 
                text-anchor="middle">
            ${p.size} Sq.Yds
          </text>
        </g>

        <!-- Status Badge Indicator for Sold/Booked -->
        ${isSold ? `
          <g transform="translate(${cx - 18}, ${y + height - 16})">
            <rect x="0" y="0" width="36" height="13" rx="3" fill="#EF4444" />
            <text x="18" y="9.5" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="800" text-anchor="middle">SOLD</text>
          </g>
        ` : (isReserved ? `
          <g transform="translate(${cx - 22}, ${y + height - 16})">
            <rect x="0" y="0" width="44" height="13" rx="3" fill="#EF4444" />
            <text x="22" y="9.5" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="800" text-anchor="middle">BOOKED</text>
          </g>
        ` : '')}
      </g>
    `;
  }).join('');

  return `
    <svg class="master-plan-svg" viewBox="0 0 1024 831" xmlns="http://www.w3.org/2000/svg" id="${prefix}-svg">
      <defs>
        <!-- Drop Shadows & Glow Filters -->
        <filter id="${prefix}-soft-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#0E2412" flood-opacity="0.3" />
        </filter>
        <filter id="${prefix}-glow-blue" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0284C7" flood-opacity="0.65" />
        </filter>
        <filter id="${prefix}-glow-amber" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#F59E0B" flood-opacity="0.65" />
        </filter>
        <filter id="${prefix}-glow-rose" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#F43F5E" flood-opacity="0.65" />
        </filter>
      </defs>

      <!-- ═════════════════ 1. HIGH-RESOLUTION 3D ARCHITECTURAL MASTER PLAN BACKGROUND ═════════════════ -->
      <image href="/images/plots/vr_plots_master_layout_3d.png" x="0" y="0" width="1024" height="831" preserveAspectRatio="xMidYMid slice" />

      <!-- ═════════════════ 2. 18 INTERACTIVE PLOTS LAYER (P01 to P18) ═════════════════ -->
      <g class="mp-plots-layer" id="${prefix}-plots-group">
        ${plotsSvgHtml}
      </g>
    </svg>
  `;
}

/**
 * Generates the complete 3-column Open Plots UI
 */
export function renderPlotMasterPlan(project) {
  let overrides = {};
  try {
    overrides = JSON.parse(localStorage.getItem('vr_plot_status_overrides') || '{}');
  } catch (e) {}

  const rawPlots = project.plots || [];
  const plots = rawPlots.map((p) => {
    const eff = overrides[p.id] || overrides[p.num];
    return eff ? { ...p, status: eff.toLowerCase() } : p;
  });
  const defaultPlot = plots.find(p => p.isDefaultSelected) || plots.find(p => p.id === 'P18') || plots[0];

  return `
    <section class="master-plan-section" id="master-plan-section">
      <div class="mp-container">
        
        <!-- Page Title & Header -->
        <div class="mp-section-title-wrap">
          <h2 class="mp-main-page-title">Open Plots</h2>
          <p class="mp-main-page-sub">Find and choose your perfect plot</p>
        </div>

        <!-- 3-Column Grid Dashboard -->
        <div class="mp-layout-grid">
          
          <!-- Column 1: Find Your Plot Filters -->
          <div class="mp-filter-card">
            <div class="filter-card-header">
              <h3 class="filter-title">Find Your Plot</h3>
              <button type="button" class="filter-reset-btn" id="mp-filter-reset">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                <span>Reset</span>
              </button>
            </div>

            <form id="mp-filter-form" class="filter-form">
              <div class="filter-group">
                <label class="filter-label">Plot Size (Sq. Yds)</label>
                <div class="select-wrap">
                  <select id="filter-size" class="filter-select">
                    <option value="all">Any Size</option>
                    <option value="180">180 Sq.Yds</option>
                    <option value="200">200 Sq.Yds</option>
                    <option value="220">220 Sq.Yds</option>
                    <option value="250">250 Sq.Yds</option>
                  </select>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Budget</label>
                <div class="select-wrap">
                  <select id="filter-budget" class="filter-select">
                    <option value="all">Any Budget</option>
                    <option value="30">Under ₹30 Lakhs</option>
                    <option value="35">₹30L - ₹35 Lakhs</option>
                    <option value="40">Above ₹35 Lakhs</option>
                  </select>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Facing</label>
                <div class="select-wrap">
                  <select id="filter-facing" class="filter-select">
                    <option value="all">Any Facing</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Road Width</label>
                <div class="select-wrap">
                  <select id="filter-road" class="filter-select">
                    <option value="all">Any Width</option>
                    <option value="30 ft">30 ft Road</option>
                    <option value="40 ft">40 ft Road</option>
                  </select>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Availability</label>
                <div class="checkbox-options">
                  <label class="custom-checkbox">
                    <input type="checkbox" id="avail-available" value="available" checked>
                    <span class="chk-box avail"></span>
                    <span class="chk-lbl">Available</span>
                  </label>
                  <label class="custom-checkbox">
                    <input type="checkbox" id="avail-reserved" value="reserved">
                    <span class="chk-box booked"></span>
                    <span class="chk-lbl">Booked</span>
                  </label>
                  <label class="custom-checkbox">
                    <input type="checkbox" id="avail-sold" value="sold">
                    <span class="chk-box sold"></span>
                    <span class="chk-lbl">Sold</span>
                  </label>
                </div>
              </div>

              <button type="button" id="mp-apply-btn" class="mp-apply-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                <span>Apply Filters</span>
              </button>
            </form>
          </div>

          <!-- Column 2: Interactive 3D Master Plan Center -->
          <div class="mp-viewport-card" id="mp-viewport-container">
            <!-- Stage Header: Legend Bar -->
            <div class="mp-stage-header">
              <div class="mp-legend-bar">
                <div class="legend-item"><span class="legend-dot available"></span> Available</div>
                <div class="legend-item"><span class="legend-dot reserved"></span> Booked</div>
                <div class="legend-item"><span class="legend-dot sold"></span> Sold</div>
              </div>
            </div>

            <!-- Map Stage Wrapper -->
            <div class="mp-stage-wrap" id="mp-stage-wrap">
              <!-- Compass Rose Top Left -->
              <div class="mp-compass-badge" title="Orientation: North">
                <div class="compass-n-circle">
                  <span class="compass-n-text">N</span>
                  <div class="compass-marker">▲</div>
                </div>
              </div>

              <!-- Collapsible Floating Controls Top Right (Phase 10 & 11) -->
              <div class="mp-floating-controls-wrap" id="mp-controls-wrap">
                <button type="button" class="mp-ctrl-main-btn" id="mp-toggle-controls" title="Map Controls" aria-label="Toggle map controls" aria-expanded="false">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path>
                  </svg>
                </button>
                <div class="mp-ctrl-expanded" id="mp-ctrl-expanded" style="display: none;">
                  <button type="button" class="mp-ctrl-btn" id="mp-zoom-in" title="Zoom In" aria-label="Zoom In">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                  <button type="button" class="mp-ctrl-btn" id="mp-zoom-out" title="Zoom Out" aria-label="Zoom Out">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                  </button>
                  <button type="button" class="mp-ctrl-btn" id="mp-zoom-reset" title="Reset View" aria-label="Reset view">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                      <path d="M3 3v5h5"/>
                    </svg>
                  </button>
                  <button type="button" class="mp-ctrl-btn" id="mp-toggle-fullscreen" title="Full Screen View" aria-label="Full Screen View">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 100% Vector Interactive Layout Canvas -->
              <div class="mp-canvas-scroll" id="mp-canvas-scroll">
                <div class="mp-canvas-transform" id="mp-canvas-transform">
                  ${renderMasterPlanSvg(plots, defaultPlot.id)}
                </div>
              </div>
            </div>

            <!-- Mobile Quick Actions -->
            <div class="mp-mobile-quick-actions">
              <button class="mp-mob-btn primary" onclick="window.openPlotSiteVisit ? window.openPlotSiteVisit('${defaultPlot.id}') : (window.openSiteVisitFlow ? window.openSiteVisitFlow() : window.openSiteVisitModal('${project.name}'))">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Book a Site Visit</span>
              </button>
              <a href="https://maps.google.com" target="_blank" rel="noopener" class="mp-mob-btn secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>

          <!-- Column 3: Selected Plot Details Panel -->
          <div class="mp-details-card" id="mp-details-card">
            ${renderPlotDetailsContent(defaultPlot, project.name)}
          </div>

        </div>

        <!-- Bottom Feature Values Bar -->
        <div class="mp-bottom-feature-bar">
          <div class="mp-feature-pills-list">
            <div class="mp-feat-pill">
              <span class="mp-feat-icon">🌿</span>
              <span>Premium Plots</span>
            </div>
            <div class="mp-feat-pill">
              <span class="mp-feat-icon">🏡</span>
              <span>Modern Amenities</span>
            </div>
            <div class="mp-feat-pill">
              <span class="mp-feat-icon">🛡️</span>
              <span>HMDA Approved</span>
            </div>
            <div class="mp-feat-pill">
              <span class="mp-feat-icon">🌲</span>
              <span>Green Surroundings</span>
            </div>
            <div class="mp-feat-pill">
              <span class="mp-feat-icon">💚</span>
              <span>A Better Tomorrow</span>
            </div>
          </div>
          <div class="mp-bottom-tagline">
            <em>Your Space. A Brighter Future.</em>
          </div>
        </div>

      </div>
    </section>

    <!-- Fullscreen Modal Overlay -->
    <div class="mp-fullscreen-modal" id="mp-fullscreen-modal" style="display: none;">
      <div class="fs-header">
        <button type="button" class="fs-exit-btn" id="fs-exit-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          <span>Exit Full Screen</span>
        </button>
        <span class="fs-title">${project.name} &bull; 3D Master Plan</span>
        <div class="fs-legend">
          <span class="legend-dot available"></span> Available
          <span class="legend-dot reserved"></span> Booked
          <span class="legend-dot sold"></span> Sold
        </div>
      </div>

      <div class="fs-body">
        <div class="fs-stage" id="fs-stage">
          <div class="mp-floating-controls-wrap fs-controls" id="fs-controls-wrap">
            <button type="button" class="mp-ctrl-main-btn" id="fs-toggle-controls" title="Map Controls" aria-label="Toggle map controls" aria-expanded="false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path>
              </svg>
            </button>
            <div class="mp-ctrl-expanded" id="fs-ctrl-expanded" style="display: none;">
              <button type="button" class="mp-ctrl-btn" id="fs-zoom-in" title="Zoom In" aria-label="Zoom In"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>
              <button type="button" class="mp-ctrl-btn" id="fs-zoom-out" title="Zoom Out" aria-label="Zoom Out"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></button>
              <button type="button" class="mp-ctrl-btn" id="fs-zoom-reset" title="Reset View" aria-label="Reset View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
            </div>
          </div>
          
          <div class="fs-canvas-scroll" id="fs-canvas-scroll">
            <div class="fs-canvas-transform" id="fs-canvas-transform">
              ${renderMasterPlanSvg(plots, defaultPlot.id, 'fs')}
            </div>
          </div>
        </div>

        <div class="fs-plot-panel" id="fs-plot-panel">
          ${renderPlotDetailsContent(defaultPlot, project.name, true)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Right Plot Details Card with Data-Driven Protection
 */
export function renderPlotDetailsContent(plot, projectName, isFullscreen = false) {
  if (!plot) return '<div class="no-plot-selected">Select a plot from the master plan to view details.</div>';

  const isAvailable = plot.status === 'available';
  const isReserved = plot.status === 'reserved' || plot.status === 'booked';
  const isSold = plot.status === 'sold';

  let statusLabel = 'Available';
  let statusBadgeClass = 'status-badge available';
  let statusIcon = '✓';
  let actionButtonsHtml = '';

  if (isAvailable) {
    statusLabel = 'Available';
    statusBadgeClass = 'status-badge available';
    statusIcon = '✓';
    actionButtonsHtml = `
      <button type="button" class="pd-btn primary-choose" onclick="window.openPlotEnquiry('${plot.id}')">
        <span>Send Enquiry</span>
        <span class="btn-arrow">&rarr;</span>
      </button>

      <button type="button" class="pd-btn secondary-visit" onclick="window.openPlotSiteVisit('${plot.id}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Book a Site Visit</span>
      </button>
    `;
  } else if (isReserved) {
    statusLabel = 'Booked';
    statusBadgeClass = 'status-badge reserved';
    statusIcon = '⏳';
    actionButtonsHtml = `
      <div class="pd-protection-alert warning">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>This plot is currently booked. You may inquire for cancellation waitlist.</span>
      </div>
      <button type="button" class="pd-btn secondary-visit" onclick="window.openPlotEnquiry('${plot.id}')">
        <span>Inquire for Waitlist</span>
      </button>
    `;
  } else if (isSold) {
    statusLabel = 'Sold Out';
    statusBadgeClass = 'status-badge sold';
    statusIcon = '✕';
    actionButtonsHtml = `
      <div class="pd-protection-alert danger">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <span>This plot has been sold and is no longer available for booking.</span>
      </div>
      <button type="button" class="pd-btn disabled-btn" disabled>
        <span>Unit Unavailable</span>
      </button>
    `;
  }

  return `
    <div class="plot-details-wrapper" data-active-plot="${plot.id}">
      
      <!-- Card Header -->
      <div class="pd-header">
        <h3 class="pd-title">Plot Details</h3>
        <button type="button" class="pd-close-btn" id="${isFullscreen ? 'fs' : 'mp'}-details-close" title="Close Plot Details">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Status Pill -->
      <div class="pd-status-row">
        <span class="${statusBadgeClass}">
          <span class="status-icon">${statusIcon}</span>
          <span>${statusLabel}</span>
        </span>
      </div>

      <!-- Plot Main ID & Dimensions -->
      <div class="pd-main-id">
        <div class="pd-plot-number">${plot.num}</div>
        <div class="pd-plot-sub">${plot.size} Sq.Yds (${plot.dim})</div>
      </div>

      <!-- Price Box -->
      <div class="pd-price-box">
        <div class="pd-price-val">${plot.price}</div>
        <div class="pd-price-rate">(${plot.rate})</div>
      </div>

      <!-- Specifications Grid (2 columns) -->
      <div class="pd-specs-grid">
        <div class="pd-spec-item">
          <div class="spec-icon-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A3B2B" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <div class="spec-info">
            <span class="spec-label">Facing</span>
            <span class="spec-value">${plot.facing}</span>
          </div>
        </div>

        <div class="pd-spec-item">
          <div class="spec-icon-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A3B2B" stroke-width="2"><path d="M4 19L8 5m8 14l4-14M10 9h4m-5 6h6"/></svg>
          </div>
          <div class="spec-info">
            <span class="spec-label">Road Width</span>
            <span class="spec-value">${plot.road}</span>
          </div>
        </div>

        <div class="pd-spec-item">
          <div class="spec-icon-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A3B2B" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </div>
          <div class="spec-info">
            <span class="spec-label">Dimensions</span>
            <span class="spec-value">${plot.dim}</span>
          </div>
        </div>

        <div class="pd-spec-item">
          <div class="spec-icon-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A3B2B" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
          </div>
          <div class="spec-info">
            <span class="spec-label">Plot Area</span>
            <span class="spec-value">${plot.size} Sq.Yds</span>
          </div>
        </div>

        <div class="pd-spec-item">
          <div class="spec-icon-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A3B2B" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="spec-info">
            <span class="spec-label">Approval</span>
            <span class="spec-value">${plot.approval}</span>
          </div>
        </div>

        <div class="pd-spec-item">
          <div class="spec-icon-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A3B2B" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="spec-info">
            <span class="spec-label">Location</span>
            <span class="spec-value">${plot.location}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pd-actions">
        ${actionButtonsHtml}

        <a href="https://maps.google.com/?q=Shadnagar+Hyderabad" target="_blank" rel="noopener" class="pd-btn flat-maps">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>View on Google Maps</span>
        </a>
      </div>

    </div>
  `;
}

/**
 * Controller & Event Binding for Interactive Open Plots Master Plan
 */
export function initPlotMasterPlan(project) {
  const plots = project.plots || [];
  let currentZoom = 1;
  let currentFsZoom = 1;

  // Send Enquiry Handler matching Villas Send Enquiry screen & flow
  window.openPlotEnquiry = function (plotId) {
    const plot = (plots || []).find(p => p.id === plotId) || plots[0];
    if (!plot) return;

    if (plot.status === 'sold') {
      alert('This plot has been sold and is no longer available for enquiry.');
      return;
    }

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const today = new Date();
    const defaultDateStr = today.toISOString().split('T')[0];

    modalContainer.innerHTML = `
      <div class="plot-enquiry-overlay" id="plot-enquiry-overlay">
        <div class="villas-form-card" style="margin: 0; max-height: 90vh; overflow-y: auto; width: 100%; max-width: 520px; animation: plotScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          <div class="villas-form-header">
            <h1 class="villas-form-title">Send Enquiry</h1>
            <button type="button" class="villas-btn-close" onclick="window.closePlotEnquiry()" aria-label="Close form">
              &times;
            </button>
          </div>
          <p class="villas-form-subtitle">Get in touch with our team. We will call you shortly.</p>

          <form id="plot-enquiry-form" onsubmit="window.submitPlotEnquiry(event, '${plot.id}')">
            <div class="villas-form-group">
              <label class="villas-form-label">Full Name <span class="req">*</span></label>
              <input type="text" class="villas-input" id="plot-enquiry-name" placeholder="Enter your name" required />
            </div>

            <div class="villas-form-group">
              <label class="villas-form-label">Mobile Number <span class="req">*</span></label>
              <input type="tel" class="villas-input" id="plot-enquiry-phone" placeholder="Enter mobile number" required />
            </div>

            <div class="villas-form-group">
              <label class="villas-form-label">Email</label>
              <input type="email" class="villas-input" id="plot-enquiry-email" placeholder="Enter your email" />
            </div>

            <div class="villas-form-group">
              <label class="villas-form-label">Preferred Date</label>
              <input type="date" class="villas-input" id="plot-enquiry-date" value="${defaultDateStr}" />
            </div>

            <div class="villas-form-group">
              <label class="villas-form-label">Message (Optional)</label>
              <textarea class="villas-textarea" id="plot-enquiry-message" rows="3" placeholder="I am interested in Plot ${plot.num}..."></textarea>
            </div>

            <!-- Selected Property Card (Corresponds directly to selected plot) -->
            <div class="villas-selected-prop-card">
              <img src="/images/journey/gallery_entrance.jpg" alt="Plot ${plot.num}" class="villas-selected-prop-thumb" />
              <div class="villas-selected-prop-meta">
                <div class="villas-selected-prop-eyebrow">Selected Property</div>
                <div class="villas-selected-prop-name">Plot ${plot.num} &bull; ${plot.size} Sq.Yds</div>
                <div class="villas-selected-prop-loc">${project.name || 'VR Green Meadows'}, Shadnagar</div>
                <div class="villas-selected-prop-price">${plot.price} <span style="font-size:0.8rem; font-weight:normal; color:#6B7280;">(${plot.rate})</span></div>
              </div>
            </div>

            <!-- Consent Checkboxes -->
            <div class="villas-consent-group">
              <label class="villas-checkbox-label">
                <input type="checkbox" id="plot-enquiry-whatsapp" checked />
                <span>I agree to be contacted via call/WhatsApp</span>
              </label>
              <label class="villas-checkbox-label">
                <input type="checkbox" id="plot-enquiry-terms" checked required />
                <span>I accept the Terms &amp; Privacy Policy</span>
              </label>
            </div>

            <button type="submit" class="villas-btn-primary" style="width: 100%;">
              Submit Enquiry
            </button>
          </form>
        </div>
      </div>
    `;

    const overlay = document.getElementById('plot-enquiry-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closePlotEnquiry();
      }
    });
  };

  window.closePlotEnquiry = function () {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) modalContainer.innerHTML = '';
  };

  window.submitPlotEnquiry = async function (event, plotId) {
    if (event) event.preventDefault();
    const plot = (plots || []).find(p => p.id === plotId) || plots[0];
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const name = document.getElementById('plot-enquiry-name')?.value?.trim() || '';
    const phone = document.getElementById('plot-enquiry-phone')?.value?.trim() || '';
    const email = document.getElementById('plot-enquiry-email')?.value?.trim() || '';
    const date = document.getElementById('plot-enquiry-date')?.value?.trim() || '';
    const msg = document.getElementById('plot-enquiry-message')?.value?.trim() || '';
    const cleanPlotCode = plot?.num ? 'P' + String(plot.num).replace(/\D/g, '').padStart(2, '0') : (plot?.id || 'P01');

    const form = document.getElementById('plot-enquiry-form');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Enquiry...';
    }

    try {
      await api.createBooking({
        type: 'enquiry',
        name,
        phone,
        email,
        date: date || 'Immediate Enquiry',
        projectName: project.name || 'VR Green Meadows',
        propertyCode: cleanPlotCode,
        propertyTitle: `Plot ${plot.num}`,
        propertyType: 'PLOT',
        message: msg || `Enquiry for Plot ${plot.num} in ${project.name || 'VR Green Meadows'}`,
        notes: msg || `Enquiry for Plot ${plot.num} in ${project.name || 'VR Green Meadows'}`,
        source: 'Website'
      });
    } catch (err) {
      console.warn('[plot-enquiry] API sync warning:', err?.message || err);
    }

    modalContainer.innerHTML = `
      <div class="plot-enquiry-overlay" id="plot-enquiry-overlay">
        <div class="villas-success-card" style="margin: 0; max-height: 90vh; overflow-y: auto; width: 100%; max-width: 480px; animation: plotScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          <!-- Big Mint Checkmark Icon -->
          <div class="villas-success-checkmark-wrap">
            <div class="villas-success-check-inner">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <h1 class="villas-success-title">Enquiry Submitted!</h1>
          <p class="villas-success-sub">
            Thank you for your interest in <strong>Plot ${plot ? plot.num : ''}</strong>.<br />
            Our team will contact you shortly.
          </p>

          <!-- What Happens Next 3 Steps Box -->
          <div class="villas-next-steps-box">
            <div class="villas-next-steps-title">What happens next?</div>
            
            <div class="villas-step-row">
              <div class="villas-step-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
              </div>
              <div class="villas-step-content">
                <span class="villas-step-num">1</span> Our team will review your details.
              </div>
            </div>

            <div class="villas-step-row">
              <div class="villas-step-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div class="villas-step-content">
                <span class="villas-step-num">2</span> You will receive a call from our sales team.
              </div>
            </div>

            <div class="villas-step-row">
              <div class="villas-step-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              </div>
              <div class="villas-step-content">
                <span class="villas-step-num">3</span> Get ready to explore your dream plot!
              </div>
            </div>
          </div>

          <!-- Back to Master Plan Button -->
          <button type="button" class="villas-btn-back-project" onclick="window.closePlotEnquiry()" style="margin-top: 18px; width: 100%;">
            Back to Master Plan
          </button>
        </div>
      </div>
    `;

    const overlay = document.getElementById('plot-enquiry-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closePlotEnquiry();
      }
    });
  };

  // Strict Booking Protection
  window.openPlotSiteVisit = function (plotId) {
    const plot = (plots || []).find(p => p.id === plotId) || plots[0];
    if (!plot) return;

    if (plot.status === 'sold' || plot.status === 'reserved' || plot.status === 'booked') {
      alert('This plot is not currently available for booking.');
      return;
    }

    const cleanPlotCode = plot?.num ? 'P' + String(plot.num).replace(/\D/g, '').padStart(2, '0') : (plot?.id || 'P01');

    openSiteVisitFlow({
      id: cleanPlotCode,
      propertyCode: cleanPlotCode,
      projectName: project.name || 'VR Green Meadows',
      unitName: `Plot ${plot.num}`,
      location: project.location || 'Shadnagar, Hyderabad',
      price: plot.price,
      priceSub: `(${plot.rate})`,
      size: `${plot.size} Sq.Yds`,
      facing: `${plot.facing} Facing`,
      beds: `${plot.road} Road`,
      baths: plot.approval,
      balconies: plot.location,
      status: plot.status.charAt(0).toUpperCase() + plot.status.slice(1),
      image: '/images/journey/gallery_entrance.jpg',
      thumb: '/images/journey/gallery_entrance.jpg'
    }, 'form');
  };

  const detailsCard = document.getElementById('mp-details-card');
  const fsPlotPanel = document.getElementById('fs-plot-panel');
  const fsModal = document.getElementById('mp-fullscreen-modal');
  const fsToggleBtn = document.getElementById('mp-toggle-fullscreen');
  const fsExitBtn = document.getElementById('fs-exit-btn');

  // Mathematical Synchronized Pan/Zoom Engine (Phases 4, 8, 9, 12)
  function createPanZoomController(scrollId, transformId) {
    const scrollEl = document.getElementById(scrollId);
    const contentEl = document.getElementById(transformId);
    if (!scrollEl || !contentEl) return null;

    let scale = 1.0;
    let panX = 0;
    let panY = 0;
    const minScale = 1.0;
    const maxScale = 2.8;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialPanX = 0;
    let initialPanY = 0;
    let pointerMoved = false;

    // Multi-touch pinch tracking (Phase 9)
    const activeTouches = new Map();
    let initialPinchDist = 0;
    let initialPinchScale = 1.0;
    let pinchCenter = { x: 0, y: 0 };

    // Double-tap tracking
    let lastTapTime = 0;
    let lastTapPos = { x: 0, y: 0 };

    function clampPan() {
      const rect = scrollEl.getBoundingClientRect();
      const contentW = rect.width * scale;
      const contentH = rect.height * scale;

      const minX = rect.width - contentW;
      const minY = rect.height - contentH;

      if (minX >= 0) {
        panX = minX / 2;
      } else {
        panX = Math.min(0, Math.max(minX, panX));
      }

      if (minY >= 0) {
        panY = minY / 2;
      } else {
        panY = Math.min(0, Math.max(minY, panY));
      }
    }

    function applyTransform(smooth = false) {
      clampPan();
      contentEl.style.transition = smooth ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
      contentEl.style.transformOrigin = '0 0';
      contentEl.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }

    function zoomAt(targetScale, focalX, focalY, smooth = true) {
      const newScale = Math.min(Math.max(targetScale, minScale), maxScale);
      const rect = scrollEl.getBoundingClientRect();

      const fx = focalX !== undefined ? focalX : rect.width / 2;
      const fy = focalY !== undefined ? focalY : rect.height / 2;

      const contentX = (fx - panX) / scale;
      const contentY = (fy - panY) / scale;

      scale = newScale;
      panX = fx - contentX * scale;
      panY = fy - contentY * scale;

      applyTransform(smooth);
    }

    function resetView() {
      scale = 1.0;
      panX = 0;
      panY = 0;
      applyTransform(true);
    }

    // Pointer Events for Desktop Mouse & Mobile Touch
    scrollEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activeTouches.size === 1) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialPanX = panX;
        initialPanY = panY;
        pointerMoved = false;
        scrollEl.classList.add('is-dragging');
      } else if (activeTouches.size === 2) {
        isDragging = false;
        const pts = Array.from(activeTouches.values());
        initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialPinchScale = scale;
        const rect = scrollEl.getBoundingClientRect();
        pinchCenter = {
          x: (pts[0].x + pts[1].x) / 2 - rect.left,
          y: (pts[0].y + pts[1].y) / 2 - rect.top,
        };
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!activeTouches.has(e.pointerId)) return;
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activeTouches.size === 1 && isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.hypot(dx, dy) > 6) {
          pointerMoved = true;
        }
        if (scale > 1.0 || pointerMoved) {
          panX = initialPanX + dx;
          panY = initialPanY + dy;
          applyTransform(false);
        }
      } else if (activeTouches.size === 2) {
        pointerMoved = true;
        const pts = Array.from(activeTouches.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (initialPinchDist > 0) {
          const factor = currentDist / initialPinchDist;
          zoomAt(initialPinchScale * factor, pinchCenter.x, pinchCenter.y, false);
        }
      }
    });

    const onPointerUp = (e) => {
      if (activeTouches.has(e.pointerId)) {
        activeTouches.delete(e.pointerId);
      }
      if (activeTouches.size === 0) {
        isDragging = false;
        scrollEl.classList.remove('is-dragging');
        applyTransform(true);
      } else if (activeTouches.size === 1) {
        const remaining = Array.from(activeTouches.values())[0];
        startX = remaining.x;
        startY = remaining.y;
        initialPanX = panX;
        initialPanY = panY;
        isDragging = true;
      }
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Double-tap zoom towards tapped location (Phase 9)
    scrollEl.addEventListener('click', (e) => {
      const now = Date.now();
      const rect = scrollEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (now - lastTapTime < 320 && Math.hypot(clickX - lastTapPos.x, clickY - lastTapPos.y) < 25) {
        e.preventDefault();
        e.stopPropagation();
        if (scale > 1.25) {
          resetView();
        } else {
          zoomAt(2.1, clickX, clickY, true);
        }
        lastTapTime = 0;
      } else {
        lastTapTime = now;
        lastTapPos = { x: clickX, y: clickY };
      }
    });

    // Window resize handler: Keep overlays and transform aligned (Phase 4 & Phase 27 Test 9)
    window.addEventListener('resize', () => {
      applyTransform(true);
    });

    return {
      zoomIn: () => zoomAt(scale + 0.35, undefined, undefined, true),
      zoomOut: () => zoomAt(scale - 0.35, undefined, undefined, true),
      reset: resetView,
      hasMoved: () => pointerMoved,
      getScale: () => scale
    };
  }

  const normalController = createPanZoomController('mp-canvas-scroll', 'mp-canvas-transform');
  const fsController = createPanZoomController('fs-canvas-scroll', 'fs-canvas-transform');

  // Wire up Collapsible Floating Controls (Phase 10 & 11)
  function bindCollapsibleControls(prefix, controller) {
    const controlsWrap = document.getElementById(`${prefix}-controls-wrap`);
    const toggleBtn = document.getElementById(`${prefix}-toggle-controls`);
    const expandedControls = document.getElementById(`${prefix}-ctrl-expanded`);
    const zoomInBtn = document.getElementById(`${prefix}-zoom-in`);
    const zoomOutBtn = document.getElementById(`${prefix}-zoom-out`);
    const zoomResetBtn = document.getElementById(`${prefix}-zoom-reset`);

    if (toggleBtn && expandedControls) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = expandedControls.style.display !== 'none';
        if (isOpen) {
          expandedControls.style.display = 'none';
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.classList.remove('active');
        } else {
          expandedControls.style.display = 'flex';
          toggleBtn.setAttribute('aria-expanded', 'true');
          toggleBtn.classList.add('active');
        }
      });

      document.addEventListener('click', (e) => {
        if (controlsWrap && !controlsWrap.contains(e.target)) {
          expandedControls.style.display = 'none';
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.classList.remove('active');
        }
      });
    }

    if (zoomInBtn && controller) zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); controller.zoomIn(); });
    if (zoomOutBtn && controller) zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); controller.zoomOut(); });
    if (zoomResetBtn && controller) zoomResetBtn.addEventListener('click', (e) => { e.stopPropagation(); controller.reset(); });
  }

  bindCollapsibleControls('mp', normalController);
  bindCollapsibleControls('fs', fsController);

  // Fullscreen toggle
  if (fsToggleBtn && fsModal) {
    fsToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fsModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (fsController) fsController.reset();
    });
  }

  if (fsExitBtn && fsModal) {
    fsExitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fsModal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  // Plot Selection function (Phase 6, 7, 13)
  function selectPlot(plotId) {
    const plot = plots.find(p => p.id === plotId);
    if (!plot) return;

    if (detailsCard) {
      detailsCard.innerHTML = renderPlotDetailsContent(plot, project.name, false);
      detailsCard.classList.add('mobile-open');
      attachCloseListeners();
    }

    if (fsPlotPanel) {
      fsPlotPanel.innerHTML = renderPlotDetailsContent(plot, project.name, true);
      fsPlotPanel.style.display = 'block';
      attachCloseListeners();
    }

    // Update SVG selection highlights in both normal and fullscreen SVG
    document.querySelectorAll('.plot-item').forEach(el => {
      const isThisPlot = el.getAttribute('data-plot-id') === plotId;
      const rect = el.querySelector('.plot-rect');
      const text = el.querySelector('.plot-num-text');
      const status = el.getAttribute('data-status');

      if (isThisPlot) {
        el.classList.add('plot-selected');
        if (rect) {
          rect.setAttribute('fill', 'rgba(2, 132, 199, 0.16)');
          rect.setAttribute('stroke', '#0284C7');
          rect.setAttribute('stroke-width', '2.5');
        }
        if (text) {
          text.setAttribute('fill', '#0369A1');
          text.setAttribute('font-weight', '900');
        }
      } else {
        el.classList.remove('plot-selected');
        let normalFill = 'rgba(34, 197, 94, 0.08)';
        let normalStroke = 'rgba(34, 197, 94, 0.55)';
        let normalText = '#0F261C';
        let strokeW = '1.2';

        if (status === 'reserved' || status === 'booked') {
          normalFill = 'rgba(239, 68, 68, 0.12)';
          normalStroke = 'rgba(239, 68, 68, 0.5)';
          normalText = '#7F1D1D';
          strokeW = '1.4';
        } else if (status === 'sold') {
          normalFill = 'rgba(220, 38, 38, 0.18)';
          normalStroke = 'rgba(220, 38, 38, 0.6)';
          normalText = '#881337';
          strokeW = '1.5';
        }

        if (rect) {
          rect.setAttribute('fill', normalFill);
          rect.setAttribute('stroke', normalStroke);
          rect.setAttribute('stroke-width', strokeW);
        }
        if (text) {
          text.setAttribute('fill', normalText);
          text.setAttribute('font-weight', '800');
        }
      }
    });
  }

  // Attach plot click listeners with tap vs drag disambiguation (Phase 9 & 13)
  document.querySelectorAll('.plot-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Disambiguate tap vs drag
      if (normalController && normalController.hasMoved()) {
        return; // Dragging/panning, do not select plot
      }
      const plotId = item.getAttribute('data-plot-id');
      selectPlot(plotId);
    });
  });

  // Attach Close Button Listeners
  function attachCloseListeners() {
    const normalClose = document.getElementById('mp-details-close');
    const fsClose = document.getElementById('fs-details-close');

    if (normalClose) {
      normalClose.addEventListener('click', () => {
        if (detailsCard) detailsCard.classList.remove('mobile-open');
      });
    }

    if (fsClose) {
      fsClose.addEventListener('click', () => {
        if (fsPlotPanel) fsPlotPanel.style.display = 'none';
      });
    }
  }

  attachCloseListeners();

  // Filters Logic
  const sizeSelect = document.getElementById('filter-size');
  const budgetSelect = document.getElementById('filter-budget');
  const facingSelect = document.getElementById('filter-facing');
  const roadSelect = document.getElementById('filter-road');
  const availAvail = document.getElementById('avail-available');
  const availRes = document.getElementById('avail-reserved');
  const availSold = document.getElementById('avail-sold');
  const applyBtn = document.getElementById('mp-apply-btn');
  const resetBtn = document.getElementById('mp-filter-reset');

  function applyFilters() {
    const selectedSize = sizeSelect ? sizeSelect.value : 'all';
    const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
    const selectedFacing = facingSelect ? facingSelect.value : 'all';
    const selectedRoad = roadSelect ? roadSelect.value : 'all';

    const allowedStatuses = [];
    if (availAvail && availAvail.checked) allowedStatuses.push('available');
    if (availRes && availRes.checked) {
      allowedStatuses.push('reserved');
      allowedStatuses.push('booked');
    }
    if (availSold && availSold.checked) allowedStatuses.push('sold');

    document.querySelectorAll('.plot-item').forEach(item => {
      const size = parseInt(item.getAttribute('data-size'), 10);
      const facing = item.getAttribute('data-facing');
      const road = item.getAttribute('data-road');
      const status = item.getAttribute('data-status');

      let match = true;

      if (selectedSize !== 'all' && size !== parseInt(selectedSize, 10)) match = false;
      if (selectedFacing !== 'all' && facing !== selectedFacing) match = false;
      if (selectedRoad !== 'all' && road !== selectedRoad) match = false;
      if (allowedStatuses.length > 0 && !allowedStatuses.includes(status)) match = false;

      if (selectedBudget === '30' && size > 180) match = false;
      if (selectedBudget === '35' && (size < 200 || size > 220)) match = false;
      if (selectedBudget === '40' && size < 250) match = false;

      if (match) {
        item.style.opacity = '1';
        item.style.pointerEvents = 'auto';
      } else {
        item.style.opacity = '0.15';
        item.style.pointerEvents = 'none';
      }
    });
  }

  if (applyBtn) applyBtn.addEventListener('click', applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (sizeSelect) sizeSelect.value = 'all';
      if (budgetSelect) budgetSelect.value = 'all';
      if (facingSelect) facingSelect.value = 'all';
      if (roadSelect) roadSelect.value = 'all';
      if (availAvail) availAvail.checked = true;
      if (availRes) availRes.checked = false;
      if (availSold) availSold.checked = false;
      applyFilters();
    });
  }

  // CRM & Real-time Live Status Synchronization Helper
  window._updatePlotStatus = function (plotId, newStatus) {
    const normStatus = String(newStatus || 'available').toLowerCase();
    const target = plots.find(p => p.id.toUpperCase() === plotId.toUpperCase() || p.num?.toUpperCase() === plotId.toUpperCase());
    if (!target) return;
    target.status = normStatus;

    document.querySelectorAll(`.plot-item[data-plot-id="${target.id}"]`).forEach(el => {
      el.setAttribute('data-status', normStatus);
      const isSelected = el.classList.contains('plot-selected');
      const rect = el.querySelector('.plot-rect');
      const text = el.querySelector('.plot-num-text');

      if (!isSelected && rect) {
        if (normStatus === 'available') {
          rect.setAttribute('fill', 'rgba(34, 197, 94, 0.08)');
          rect.setAttribute('stroke', 'rgba(34, 197, 94, 0.55)');
          rect.setAttribute('stroke-width', '1.2');
          rect.removeAttribute('filter');
          if (text) text.setAttribute('fill', '#0F261C');
        } else if (normStatus === 'hold' || normStatus === 'reserved') {
          rect.setAttribute('fill', 'rgba(245, 158, 11, 0.12)');
          rect.setAttribute('stroke', 'rgba(245, 158, 11, 0.55)');
          rect.setAttribute('stroke-width', '1.4');
          rect.removeAttribute('filter');
          if (text) text.setAttribute('fill', '#B45309');
        } else if (normStatus === 'booked') {
          rect.setAttribute('fill', 'rgba(239, 68, 68, 0.12)');
          rect.setAttribute('stroke', 'rgba(239, 68, 68, 0.5)');
          rect.setAttribute('stroke-width', '1.4');
          rect.removeAttribute('filter');
          if (text) text.setAttribute('fill', '#7F1D1D');
        } else if (normStatus === 'sold') {
          rect.setAttribute('fill', 'rgba(220, 38, 38, 0.18)');
          rect.setAttribute('stroke', 'rgba(220, 38, 38, 0.6)');
          rect.setAttribute('stroke-width', '1.5');
          rect.removeAttribute('filter');
          if (text) text.setAttribute('fill', '#881337');
        } else if (normStatus === 'blocked') {
          rect.setAttribute('fill', 'rgba(100, 116, 139, 0.15)');
          rect.setAttribute('stroke', 'rgba(100, 116, 139, 0.5)');
          rect.setAttribute('stroke-width', '1.4');
          rect.removeAttribute('filter');
          if (text) text.setAttribute('fill', '#475569');
        }
      }
    });

    const activeWrapper = document.querySelector('.plot-details-wrapper');
    if (activeWrapper && activeWrapper.getAttribute('data-active-plot') === target.id) {
      if (detailsCard) detailsCard.innerHTML = renderPlotDetailsContent(target, project.name, false);
      if (fsPlotPanel) fsPlotPanel.innerHTML = renderPlotDetailsContent(target, project.name, true);
      attachCloseListeners();
    }
  };

  // Listen to live CRM plot status changes
  window.addEventListener('vr_plot_status_changed', (e) => {
    if (e.detail?.propertyId && e.detail?.status) {
      window._updatePlotStatus(e.detail.propertyId, e.detail.status);
    }
  });

  // Fetch live properties from backend API on initial load
  fetch('/api/properties?type=PLOT')
    .then(r => r.json())
    .then(payload => {
      if (payload.data && Array.isArray(payload.data)) {
        payload.data.forEach(p => {
          if (p.property_code && p.inventory_status) {
            window._updatePlotStatus(p.property_code, p.inventory_status);
          }
        });
      }
    })
    .catch(() => {});
}


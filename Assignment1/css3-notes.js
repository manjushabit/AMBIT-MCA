/* ============================================================
   css3-notes.js  —  VTU CSS3 & RWD Notes Interactive Demos
   ============================================================ */

/* ═══════════════════════════════════════════════════════════
   DEMO 1 — Selector Playground
   ═══════════════════════════════════════════════════════════ */
const SEL_INFO = {
  '*'                  : ['sel-hi-all', 'targets every element on the page'],
  'p'                  : ['sel-hi-p',   'targets all <p> paragraph elements'],
  '.highlight'         : ['sel-hi-cls', 'targets elements with class="highlight"'],
  '#special'           : ['sel-hi-id',  'targets the single element with id="special"'],
  'li:nth-child(2n)'   : ['sel-hi-nth', 'targets even-numbered list items (2, 4, 6…)'],
  'li:first-child'     : ['sel-hi-first','targets the first <li> inside its parent'],
  'a:hover'            : ['sel-hi-hover','targets <a> links when hovered (try hovering the link!)'],
  'p::before'          : ['sel-hi-before','inserts generated content before every <p>'],
};

const ALL_HI_CLASSES = [
  'sel-hi-all','sel-hi-p','sel-hi-cls','sel-hi-id',
  'sel-hi-nth','sel-hi-first','sel-hi-hover','sel-hi-before'
];

window.runSelector = function (btn, sel) {
  /* Update button active state */
  document.querySelectorAll('.sel-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  /* Remove all highlight classes */
  const preview = document.getElementById('sel-preview');
  ALL_HI_CLASSES.forEach(c => preview.classList.remove(c));

  /* Apply new highlight */
  const [cls, desc] = SEL_INFO[sel] || ['', 'unknown selector'];
  if (cls) preview.classList.add(cls);

  /* Update info bar */
  document.getElementById('sel-code').textContent = sel;
  document.getElementById('sel-info').innerHTML =
    `Selector: <code>${sel}</code> — ${desc}`;
};

/* ═══════════════════════════════════════════════════════════
   DEMO 2 — Box Model Sliders
   ═══════════════════════════════════════════════════════════ */
window.updateBox = function () {
  const m = +document.getElementById('bm-margin').value;
  const p = +document.getElementById('bm-padding').value;
  const b = +document.getElementById('bm-border').value;

  /* Update labels */
  document.getElementById('bm-margin-val').textContent = m + 'px';
  document.getElementById('bm-border-val').textContent = b + 'px';
  document.getElementById('bm-pad-val').textContent    = p + 'px';
  document.getElementById('bm-m-out').textContent = m + 'px';
  document.getElementById('bm-p-out').textContent = p + 'px';
  document.getElementById('bm-b-out').textContent = b + 'px';

  /* Update visual sizes */
  const marginEl  = document.querySelector('.bm-margin');
  const borderEl  = document.querySelector('.bm-border');
  const paddingEl = document.querySelector('.bm-padding');

  marginEl.style.padding  = m + 'px';
  borderEl.style.padding  = b + 'px';
  borderEl.style.borderWidth = Math.max(1, b / 2) + 'px';
  paddingEl.style.padding = p + 'px';
};

/* ═══════════════════════════════════════════════════════════
   DEMO 3 — Positioning Explorer
   ═══════════════════════════════════════════════════════════ */
const POS_CONFIGS = {
  static: {
    style    : {},
    explain  : 'Static: default normal flow. The top / left / right / bottom properties have no effect.',
  },
  relative: {
    style    : { position:'relative', top:'20px', left:'24px' },
    explain  : 'Relative: offset 20px down and 24px right from its normal position. Space is still reserved in the flow.',
  },
  absolute: {
    style    : { position:'absolute', top:'8px', right:'12px' },
    explain  : 'Absolute: removed from normal flow. Positioned relative to its nearest positioned ancestor (the dashed container).',
  },
  sticky: {
    style    : { position:'sticky', top:'0px' },
    explain  : 'Sticky: behaves like relative until it reaches top:0 on scroll, then sticks like fixed. Great for table headers.',
  },
};

window.setPos = function (btn, type) {
  document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const target = document.getElementById('pos-target');
  const label  = document.getElementById('pos-label');
  const cfg    = POS_CONFIGS[type];

  /* Reset all position styles */
  Object.assign(target.style, {
    position:'', top:'', left:'', right:'', bottom:''
  });
  /* Apply new */
  Object.assign(target.style, cfg.style);
  label.textContent = 'position: ' + type;

  document.getElementById('pos-explain').textContent = cfg.explain;
};

/* ═══════════════════════════════════════════════════════════
   DEMO 4 — Flexbox Playground
   ═══════════════════════════════════════════════════════════ */
window.updateFlex = function () {
  const dir  = document.getElementById('fp-dir').value;
  const jc   = document.getElementById('fp-jc').value;
  const ai   = document.getElementById('fp-ai').value;
  const wrap = document.getElementById('fp-wrap').value;
  const gap  = document.getElementById('fp-gap').value;

  document.getElementById('fp-gap-out').textContent = gap + 'px';

  const canvas = document.getElementById('fp-canvas');
  Object.assign(canvas.style, {
    flexDirection  : dir,
    justifyContent : jc,
    alignItems     : ai,
    flexWrap       : wrap,
    gap            : gap + 'px',
  });

  document.getElementById('fp-code-out').textContent =
    `.container {\n  display: flex;\n  flex-direction: ${dir};\n  justify-content: ${jc};\n  align-items: ${ai};\n  flex-wrap: ${wrap};\n  gap: ${gap}px;\n}`;
};

/* Initial render */
updateFlex();

/* ═══════════════════════════════════════════════════════════
   DEMO 5 — CSS Grid Builder
   ═══════════════════════════════════════════════════════════ */
window.updateGrid = function () {
  const cols    = +document.getElementById('gp-cols').value;
  const items   = +document.getElementById('gp-items').value;
  const gap     = +document.getElementById('gp-gap').value;
  const autofit = document.getElementById('gp-autofit').checked;

  document.getElementById('gp-cols-out').textContent  = cols;
  document.getElementById('gp-items-out').textContent = items;
  document.getElementById('gp-gap-out').textContent   = gap + 'px';

  const canvas     = document.getElementById('gp-canvas');
  const colsValue  = autofit
    ? `repeat(auto-fit, minmax(${Math.floor(600 / cols) - gap}px, 1fr))`
    : `repeat(${cols}, 1fr)`;

  canvas.style.gridTemplateColumns = colsValue;
  canvas.style.gap                 = gap + 'px';

  /* Re-build items */
  canvas.innerHTML = '';
  for (let i = 1; i <= items; i++) {
    const el = document.createElement('div');
    el.className   = 'gp-item';
    el.textContent = 'Item ' + i;
    el.dataset.spanned = 'no';
    el.onclick = function () {
      if (this.dataset.spanned === 'yes') {
        this.style.gridColumn  = '';
        this.dataset.spanned   = 'no';
        this.classList.remove('span2');
        this.textContent = 'Item ' + i;
      } else {
        this.style.gridColumn = 'span 2';
        this.dataset.spanned  = 'yes';
        this.classList.add('span2');
        this.textContent = 'Item ' + i + ' (span 2)';
      }
    };
    canvas.appendChild(el);
  }

  document.getElementById('gp-code-out').textContent =
    `.grid {\n  display: grid;\n  grid-template-columns: ${colsValue};\n  gap: ${gap}px;\n}`;
};

updateGrid();

/* ═══════════════════════════════════════════════════════════
   DEMO 6 — Breakpoint Simulator
   ═══════════════════════════════════════════════════════════ */
const BP_TIERS = [
  { max:  479, label:'xs — Phone (< 480px)',     color:'#ef4444', cols:1, sidebar:false, ham:true,  navlinks:false, rule:'Single-column layout, hamburger nav' },
  { max:  767, label:'sm — Phone landscape',     color:'#f59e0b', cols:1, sidebar:false, ham:true,  navlinks:false, rule:'Single column, hamburger nav' },
  { max: 1023, label:'md — Tablet (768–1023px)', color:'#10b981', cols:2, sidebar:true,  ham:false, navlinks:true,  rule:'Sidebar visible, 2-col cards, full nav' },
  { max: 1279, label:'lg — Desktop (1024–1279px)',color:'#6366f1', cols:3, sidebar:true,  ham:false, navlinks:true,  rule:'3-col cards, full nav, max-width container' },
  { max:99999, label:'xl — Large desktop (≥ 1280px)',color:'#8b5cf6',cols:3,sidebar:true, ham:false, navlinks:true, rule:'Centered content, max-width 1200px, 3-col cards' },
];

window.updateBP = function () {
  const w = +document.getElementById('bp-width').value;
  document.getElementById('bp-w-out').textContent = w + 'px';

  const device = document.getElementById('bp-device');
  device.style.width = Math.min(w, 900) + 'px';

  const tier = BP_TIERS.find(t => w <= t.max) || BP_TIERS[BP_TIERS.length - 1];

  /* Nav */
  document.getElementById('bp-ham').style.display      = tier.ham ? 'block' : 'none';
  document.getElementById('bp-navlinks').style.display = tier.navlinks ? 'flex' : 'none';
  /* Sidebar */
  document.getElementById('bp-sidebar').style.display  = tier.sidebar ? 'block' : 'none';
  /* Cards */
  document.getElementById('bp-card-row').style.gridTemplateColumns = `repeat(${tier.cols}, 1fr)`;

  /* Labels */
  const chip = document.getElementById('bp-current-chip');
  chip.textContent     = tier.label;
  chip.style.background = tier.color + '22';
  chip.style.color      = tier.color;
  chip.style.borderColor= tier.color + '44';
  document.getElementById('bp-rule').textContent = tier.rule;
};

updateBP();

/* ═══════════════════════════════════════════════════════════
   DEMO 7 — Fluid vs Fixed Grid
   ═══════════════════════════════════════════════════════════ */
let fluidMode = 'fluid';
let isDragging = false;
let dragStartX = 0;
let dragStartW = 0;

window.setFluidMode = function (mode) {
  fluidMode = mode;
  document.getElementById('fd-fluid-btn').classList.toggle('active', mode === 'fluid');
  document.getElementById('fd-fixed-btn').classList.toggle('active', mode === 'fixed');
  applyFluidGrid();
};

function applyFluidGrid () {
  const grid = document.getElementById('fd-grid');
  if (fluidMode === 'fluid') {
    grid.style.display             = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
    grid.style.overflow            = 'hidden';
  } else {
    grid.style.display             = 'grid';
    grid.style.gridTemplateColumns = 'repeat(6, 300px)';
    grid.style.overflow            = 'auto';
  }
  grid.style.gap = '10px';
}

/* Drag-to-resize the fd-handle */
const handle = document.getElementById('fd-handle');
const resizeWrap = document.querySelector('.fd-resize-wrap');

handle.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartW = resizeWrap.offsetWidth;
  document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const newW = Math.max(200, Math.min(900, dragStartW + e.clientX - dragStartX));
  resizeWrap.style.width = newW + 'px';
});
document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.userSelect = '';
});

/* Touch support */
handle.addEventListener('touchstart', e => {
  isDragging = true;
  dragStartX = e.touches[0].clientX;
  dragStartW = resizeWrap.offsetWidth;
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const newW = Math.max(200, Math.min(900, dragStartW + e.touches[0].clientX - dragStartX));
  resizeWrap.style.width = newW + 'px';
}, { passive: true });
document.addEventListener('touchend', () => { isDragging = false; });

applyFluidGrid();

/* ── Initial selector highlight ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const firstBtn = document.querySelector('.sel-btn.active');
  if (firstBtn) runSelector(firstBtn, '*');
});

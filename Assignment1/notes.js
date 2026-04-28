/* ============================================================
   notes.js  –  VTU Notes Page Interactive Demos
   ============================================================ */

/* ═══════════════════════════════════════════════════════════
   DEMO 1 — Custom Video Player (canvas simulation)
   ═══════════════════════════════════════════════════════════ */
(function initVideoPlayer() {
  const canvas  = document.getElementById('player-canvas');
  const ctx     = canvas.getContext('2d');
  const TOTAL   = 120; // seconds
  let   elapsed = 0;
  let   playing = false;
  let   rafId   = null;
  let   lastTs  = null;
  let   volume  = 0.8;
  let   speed   = 1;

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ec4899','#14b8a6'];

  function drawFrame() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0a0e1a');
    bg.addColorStop(1, '#111827');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Animated waveform
    const t     = elapsed / TOTAL;
    const bands = 60;
    const bw    = W / bands;
    for (let i = 0; i < bands; i++) {
      const amp  = playing
        ? 0.2 + 0.8 * Math.abs(Math.sin((i + elapsed * 8) * 0.3))
        : 0.05 + 0.05 * Math.sin(i * 0.5);
      const h    = amp * H * 0.55;
      const x    = i * bw;
      const hue  = (i * 6 + elapsed * 30) % 360;
      const col  = `hsl(${hue},80%,60%)`;
      ctx.fillStyle = col;
      ctx.globalAlpha = playing ? 0.7 : 0.25;
      ctx.beginPath();
      ctx.roundRect(x + 1, (H - h) / 2, bw - 2, h, 3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Progress arc
    const cx = W / 2, cy = H / 2, r = 70;
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth   = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    const prog = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    prog.addColorStop(0, '#6366f1');
    prog.addColorStop(1, '#10b981');
    ctx.strokeStyle = prog;
    ctx.lineWidth   = 6;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t);
    ctx.stroke();

    // Center label
    ctx.fillStyle  = '#fff';
    ctx.font       = `bold 20px "JetBrains Mono", monospace`;
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(playing ? '▶  Playing' : '⏸  Paused', cx, cy);

    // Time overlay bottom-left
    ctx.fillStyle    = 'rgba(255,255,255,.45)';
    ctx.font         = '13px "JetBrains Mono", monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${fmtSec(elapsed)} / ${fmtSec(TOTAL)}  ·  ${speed}×  ·  Vol ${Math.round(volume * 100)}%`, 16, H - 12);

    updateControls();
  }

  function fmtSec(s) {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function updateControls() {
    const pct = elapsed / TOTAL * 100;
    document.getElementById('p-bar').style.width    = pct + '%';
    document.getElementById('p-thumb').style.left   = pct + '%';
    document.getElementById('p-time').textContent   = `${fmtSec(elapsed)} / ${fmtSec(TOTAL)}`;
    document.getElementById('play-pause-btn').textContent = playing ? '⏸' : '▶';
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs   = ts;
    elapsed  = Math.min(elapsed + dt * speed, TOTAL);
    if (elapsed >= TOTAL) { playing = false; elapsed = 0; }
    drawFrame();
    if (playing) rafId = requestAnimationFrame(loop);
  }

  window.playerPlay = function () {
    playing = !playing;
    document.getElementById('player-overlay').classList.toggle('hidden', playing);
    if (playing) { lastTs = null; rafId = requestAnimationFrame(loop); }
    else         { drawFrame(); }
  };
  window.playerVolume = function (v) { volume = v / 100; drawFrame(); };
  window.playerSpeed  = function (s) { speed  = +s; };
  window.playerSeek   = function (e) {
    const bar = document.getElementById('p-progress');
    const pct = Math.max(0, Math.min(1, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
    elapsed   = pct * TOTAL;
    drawFrame();
  };

  drawFrame();
})();

/* ═══════════════════════════════════════════════════════════
   DEMO 2 — Canvas Painter
   ═══════════════════════════════════════════════════════════ */
(function initCanvasPainter() {
  const canvas = document.getElementById('draw-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let drawing  = false;
  let tool     = 'pen';
  let startX   = 0, startY = 0;
  let snapshot = null;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    const src  = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * scaleX, y: (src.clientY - r.top) * scaleY };
  }

  function applyStyle() {
    ctx.strokeStyle = document.getElementById('draw-color').value;
    ctx.fillStyle   = document.getElementById('draw-color').value;
    ctx.lineWidth   = +document.getElementById('draw-size').value;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }

  canvas.addEventListener('mousedown',  onStart);
  canvas.addEventListener('mousemove',  onMove);
  canvas.addEventListener('mouseup',    onEnd);
  canvas.addEventListener('mouseleave', onEnd);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); onStart(e); }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); onMove(e);  }, { passive: false });
  canvas.addEventListener('touchend',   e => { e.preventDefault(); onEnd(e);   }, { passive: false });

  function onStart(e) {
    drawing  = true;
    const p  = getPos(e);
    startX   = p.x; startY = p.y;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyStyle();
    if (tool === 'pen') { ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    if (tool === 'text') {
      const t = prompt('Enter text:') || 'Hello!';
      ctx.font      = `${+document.getElementById('draw-size').value * 5 + 12}px Satoshi, sans-serif`;
      ctx.fillText(t, p.x, p.y);
    }
  }

  function onMove(e) {
    if (!drawing) return;
    const p = getPos(e);
    applyStyle();
    if (tool === 'pen') {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeRect(startX, startY, p.x - startX, p.y - startY);
    } else if (tool === 'circle') {
      ctx.putImageData(snapshot, 0, 0);
      const r = Math.hypot(p.x - startX, p.y - startY);
      ctx.beginPath();
      ctx.arc(startX, startY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function onEnd() { drawing = false; }

  window.setTool = function (t) {
    tool = t;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tool-' + t);
    if (btn) btn.classList.add('active');
    canvas.style.cursor = t === 'text' ? 'text' : 'crosshair';
  };

  window.clearCanvas = function () {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  window.downloadCanvas = function () {
    const a  = document.createElement('a');
    a.href   = canvas.toDataURL('image/png');
    a.download = 'vtu-canvas.png';
    a.click();
  };

  document.getElementById('draw-size').addEventListener('input', function () {
    document.getElementById('size-label').textContent = this.value + 'px';
  });
})();

/* ═══════════════════════════════════════════════════════════
   DEMO 3 — Animation (bouncing balls)
   ═══════════════════════════════════════════════════════════ */
(function initAnimation() {
  const canvas = document.getElementById('anim-canvas');
  const ctx    = canvas.getContext('2d');
  let   rafId  = null;
  let   paused = false;

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ec4899','#14b8a6','#f43f5e','#a855f7'];

  function mkBall() {
    const r = 14 + Math.random() * 18;
    return {
      x: r + Math.random() * (canvas.width  - r * 2),
      y: r + Math.random() * (canvas.height - r * 2),
      vx: (Math.random() - .5) * 5,
      vy: (Math.random() - .5) * 5,
      r,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  let balls = Array.from({ length: 6 }, mkBall);

  function draw() {
    if (paused) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // bg
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, W, H);

    balls.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x - b.r < 0)    { b.x = b.r;      b.vx = Math.abs(b.vx); }
      if (b.x + b.r > W)    { b.x = W - b.r;  b.vx = -Math.abs(b.vx); }
      if (b.y - b.r < 0)    { b.y = b.r;      b.vy = Math.abs(b.vy); }
      if (b.y + b.r > H)    { b.y = H - b.r;  b.vy = -Math.abs(b.vy); }

      const g = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .3, b.r * .1, b.x, b.y, b.r);
      g.addColorStop(0, b.color + 'ee');
      g.addColorStop(1, b.color + '44');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.shadowBlur  = 18;
      ctx.shadowColor = b.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    rafId = requestAnimationFrame(draw);
  }

  draw();

  window.animToggle  = function () { paused = !paused; if (!paused) draw(); };
  window.animAddBall = function () { if (balls.length < 20) balls.push(mkBall()); };
  window.animReset   = function () { balls = Array.from({ length: 6 }, mkBall); if (paused) { paused = false; draw(); } };
})();

/* ═══════════════════════════════════════════════════════════
   DEMO 4 — SVG bar click
   ═══════════════════════════════════════════════════════════ */
window.svgBarClick = function (g, label, pct) {
  document.querySelectorAll('.svg-bar rect').forEach(r => {
    r.setAttribute('opacity', '0.5');
  });
  g.querySelector('rect').setAttribute('opacity', '1');
  const tip = document.getElementById('svg-tooltip');
  tip.textContent = `${label}: ${pct}%`;
  tip.style.display = 'block';
  setTimeout(() => {
    tip.style.display = 'none';
    document.querySelectorAll('.svg-bar rect').forEach(r => r.setAttribute('opacity', '0.92'));
  }, 1800);
};

/* ═══════════════════════════════════════════════════════════
   DEMO 5 — Geolocation
   ═══════════════════════════════════════════════════════════ */
window.getLocation = function () {
  const status = document.getElementById('geo-status');
  const card   = document.getElementById('geo-card');
  status.textContent = '⏳ Requesting location permission…';
  card.style.display = 'none';

  if (!('geolocation' in navigator)) {
    status.textContent = '❌ Geolocation is not supported by this browser.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      const c = pos.coords;
      document.getElementById('geo-lat').textContent    = c.latitude.toFixed(6) + '°';
      document.getElementById('geo-lng').textContent    = c.longitude.toFixed(6) + '°';
      document.getElementById('geo-acc-val').textContent = c.accuracy.toFixed(1) + ' m';
      document.getElementById('geo-alt').textContent    = c.altitude ? c.altitude.toFixed(1) + ' m' : 'N/A';
      document.getElementById('geo-ts').textContent     = new Date(pos.timestamp).toLocaleTimeString();
      document.getElementById('geo-method').textContent = c.accuracy < 50 ? 'GPS' : c.accuracy < 200 ? 'Wi-Fi / Cell' : 'IP Address';
      card.style.display   = 'grid';
      status.textContent   = '✅ Location retrieved successfully!';
    },
    function (err) {
      const msgs = ['Unknown error', 'Permission denied by user', 'Position unavailable', 'Request timed out'];
      status.textContent = `❌ Error ${err.code}: ${msgs[err.code] || err.message}`;
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
};

/* ═══════════════════════════════════════════════════════════
   DEMO 6 — Web Storage Explorer
   ═══════════════════════════════════════════════════════════ */
function renderStorage() {
  const list = document.getElementById('storage-list');
  list.innerHTML = '';
  const count = localStorage.length;
  if (!count) {
    list.innerHTML = '<div class="s-empty">localStorage is empty — add some items above!</div>';
    return;
  }
  for (let i = 0; i < count; i++) {
    const k   = localStorage.key(i);
    const raw = localStorage.getItem(k);
    let type  = 'string';
    try { const p = JSON.parse(raw); type = Array.isArray(p) ? 'array' : typeof p; } catch (_) {}

    const row       = document.createElement('div');
    row.className   = 's-row';
    row.innerHTML   = `
      <span class="s-row-key">${escHtml(k)}</span>
      <span class="s-row-val">${escHtml(raw.length > 60 ? raw.substring(0, 60) + '…' : raw)}</span>
      <span class="s-row-type">${type}</span>
      <button class="s-del-btn" onclick="storageDeleteKey('${escHtml(k)}')">🗑 Del</button>`;
    list.appendChild(row);
  }
}

function escHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function setMsg(msg, ok = true) {
  const el  = document.getElementById('s-msg');
  el.textContent = msg;
  el.className   = 's-msg ' + (ok ? 'ok' : 'error');
  setTimeout(() => { el.textContent = ''; }, 2400);
}

window.storageSet = function () {
  const k = document.getElementById('s-key').value.trim();
  const v = document.getElementById('s-value').value;
  if (!k) { setMsg('⚠ Key is required.', false); return; }
  localStorage.setItem(k, v);
  setMsg(`✅ Saved "${k}"`);
  renderStorage();
};
window.storageGet = function () {
  const k = document.getElementById('s-key').value.trim();
  if (!k) { setMsg('⚠ Key is required.', false); return; }
  const v = localStorage.getItem(k);
  if (v === null) { setMsg(`⚠ Key "${k}" not found.`, false); return; }
  document.getElementById('s-value').value = v;
  setMsg(`📖 Got "${k}" = "${v}"`);
};
window.storageRemove = function () {
  const k = document.getElementById('s-key').value.trim();
  if (!k) { setMsg('⚠ Key is required.', false); return; }
  localStorage.removeItem(k);
  setMsg(`🗑 Deleted "${k}"`);
  renderStorage();
};
window.storageClear = function () {
  if (!confirm('Clear all localStorage entries?')) return;
  localStorage.clear();
  setMsg('💥 All entries cleared.');
  renderStorage();
};
window.storageDeleteKey = function (k) {
  localStorage.removeItem(k);
  renderStorage();
};

renderStorage();

/* ═══════════════════════════════════════════════════════════
   DEMO 7 — Web Workers (inline Blob)
   ═══════════════════════════════════════════════════════════ */
const WORKER_CODE = `
  self.onmessage = function(e) {
    const n = e.data.n;
    const start = Date.now();
    const result = fib(n);
    self.postMessage({ result, ms: Date.now() - start, n });
  };
  function fib(n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
  }
`;

let activeWorker = null;

window.runWorker = function () {
  if (activeWorker) activeWorker.terminate();
  const n = +document.getElementById('fib-n').value;
  document.getElementById('worker-val').textContent   = '⏳ Computing…';
  document.getElementById('worker-time').textContent  = '';
  document.getElementById('worker-status').textContent = `🧵 Worker running fib(${n})…`;

  // Start spinner to show UI is NOT blocked
  document.getElementById('spin-box').classList.add('spinning');
  document.getElementById('spin-label').textContent = 'Spinning ✓ — UI is NOT blocked!';

  const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
  const url  = URL.createObjectURL(blob);
  const worker = new Worker(url);
  activeWorker = worker;

  worker.onmessage = function (e) {
    document.getElementById('worker-val').textContent  = e.data.result.toLocaleString();
    document.getElementById('worker-time').textContent = `⏱ ${e.data.ms} ms`;
    document.getElementById('worker-status').textContent = `✅ Worker finished fib(${e.data.n}) = ${e.data.result.toLocaleString()}`;
    document.getElementById('spin-box').classList.remove('spinning');
    document.getElementById('spin-label').textContent = 'Done! UI was responsive throughout.';
    URL.revokeObjectURL(url);
  };

  worker.onerror = function (e) {
    document.getElementById('worker-status').textContent = '❌ Worker error: ' + e.message;
  };

  worker.postMessage({ n });
};

window.runMainThread = function () {
  const n = +document.getElementById('fib-n').value;
  document.getElementById('main-val').textContent  = '⏳ Computing (UI frozen)…';
  document.getElementById('spin-label').textContent = '⚠️ UI is BLOCKED right now…';

  // Short delay to let the DOM update, then block
  setTimeout(() => {
    function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }
    const t0     = performance.now();
    const result = fib(n);
    const ms     = Math.round(performance.now() - t0);
    document.getElementById('main-val').textContent  = result.toLocaleString();
    document.getElementById('main-time').textContent = `⏱ ${ms} ms`;
    document.getElementById('spin-label').textContent = '⚠️ UI was frozen during main-thread calc!';
  }, 50);
};

/* ═══════════════════════════════════════════════════════════
   DEMO 8 — Offline / Service Worker Simulation
   ═══════════════════════════════════════════════════════════ */
(function initOfflineDemo() {
  const log = document.getElementById('od-log-entries');
  const cachedFiles = ['/', '/style.css', '/notes.js', '/landing.html', '/login.html'];

  function addLog(event, msg) {
    const now    = new Date().toLocaleTimeString();
    const entry  = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">${now}</span><span class="log-event">[${event}]</span><span class="log-msg">${msg}</span>`;
    log.prepend(entry);
    if (log.children.length > 15) log.lastChild.remove();
  }

  function updateStatus() {
    const online = navigator.onLine;
    const dot    = document.getElementById('od-dot');
    const text   = document.getElementById('od-status-text');
    const sub    = document.getElementById('od-status-sub');
    dot.className     = 'od-dot' + (online ? '' : ' offline');
    text.textContent  = online ? '🟢 Online' : '🔴 Offline';
    sub.textContent   = online ? 'Connected to network' : 'No network connection';
    addLog(online ? 'ONLINE' : 'OFFLINE', online ? 'Network connection restored.' : 'Network connection lost!');
  }

  function renderCache() {
    const list = document.getElementById('cache-list');
    list.innerHTML = cachedFiles.map(f =>
      `<div class="cache-item"><div class="cache-item-dot"></div>${f}</div>`
    ).join('');
  }

  window.swSimCache = function () {
    const files = ['/images/logo.png', '/data/courses.json', '/fonts/satoshi.woff2', '/api/student.json'];
    const f = files[Math.floor(Math.random() * files.length)];
    if (!cachedFiles.includes(f)) {
      cachedFiles.push(f);
      renderCache();
      addLog('CACHE', `Cached: ${f}`);
    }
  };

  window.swClearCache = function () {
    cachedFiles.length = 0;
    renderCache();
    addLog('CACHE', 'All cached files removed.');
  };

  window.addEventListener('online',  updateStatus);
  window.addEventListener('offline', updateStatus);

  updateStatus();
  renderCache();
  addLog('SW', 'Service Worker simulation initialised.');
  addLog('INSTALL', 'Caching core assets…');
  addLog('ACTIVATE', 'SW ready to intercept requests.');
  addLog('FETCH', 'Serving / from cache (offline-first).');
})();

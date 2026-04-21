/* ============================================================
   landing.js  –  VTU Portal Dashboard / Landing Page Logic
   ============================================================ */

/** Track password visibility state. */
let pwVisible = false;

/* ── Helpers ─────────────────────────────────────────────── */

/**
 * Format an ISO date string (YYYY-MM-DD) to a human-readable form.
 * @param {string} iso
 * @returns {string}
 */
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[+m - 1]} ${y}`;
}

/**
 * Set the avatar element: photo if available, otherwise initials.
 * @param {string} elId   - element id
 * @param {string} photo  - data URL or null
 * @param {string} initials
 */
function setAvatar(elId, photo, initials) {
  const el = document.getElementById(elId);
  if (photo) {
    el.innerHTML = `<img src="${photo}" alt="Profile photo">`;
  } else {
    el.textContent = initials;
  }
}

/**
 * Insert content or an empty-state span.
 * @param {string} elId
 * @param {string} value
 */
function setOrEmpty(elId, value) {
  const el = document.getElementById(elId);
  el.innerHTML = value
    ? `<span>${value}</span>`
    : '<span class="empty">Not set</span>';
}

/* ── Public Actions ──────────────────────────────────────── */

/** Sign out: clear session and return to login. */
function logout() {
  sessionStorage.removeItem('vtu_student');
  window.location.href = 'login.html';
}

/** Toggle password dots ↔ plain text. */
function togglePw() {
  const s = JSON.parse(sessionStorage.getItem('vtu_student') || '{}');
  pwVisible = !pwVisible;

  document.getElementById('pw-stars').textContent = pwVisible
    ? s.password
    : '•'.repeat(Math.min((s.password || '').length, 10));

  document.querySelector('.pw-btn').textContent = pwVisible ? 'Hide' : 'Show';
}

/* ── Page Init ───────────────────────────────────────────── */

/**
 * Load student data from sessionStorage and populate every
 * dynamic element on the landing page.
 */
function init() {
  const raw = sessionStorage.getItem('vtu_student');

  /* Redirect to login if no session exists */
  if (!raw) {
    window.location.href = 'login.html';
    return;
  }

  const s        = JSON.parse(raw);
  const firstName = s.name.split(' ')[0];
  const initials  = s.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  /* ── Navigation bar ── */
  setAvatar('nav-av', s.photo, initials);
  document.getElementById('nav-nm').textContent = firstName;

  /* ── Hero band ── */
  document.getElementById('h-fname').textContent = firstName;
  document.getElementById('h-sub').textContent   =
    `Great to see you, ${s.name}. Your dashboard is all set.`;
  document.getElementById('h-course').textContent = s.course || '—';
  document.getElementById('h-city').textContent   = s.city   || '—';
  document.getElementById('h-email').textContent  = s.email  || '—';

  /* ── Profile card ── */
  setAvatar('prof-av', s.photo, initials);
  document.getElementById('prof-name').textContent        = s.name;
  document.getElementById('prof-email').textContent       = s.email;
  document.getElementById('prof-course-tag').textContent  = '📗 ' + s.course;
  document.getElementById('pw-stars').textContent         =
    '•'.repeat(Math.min((s.password || '').length, 10));

  /* Extra profile fields */
  setOrEmpty('pf-dob',    s.dob ? fmtDate(s.dob) : '');
  setOrEmpty('pf-gender', s.gender);
  document.getElementById('pf-city').textContent = s.city || '—';

  /* Favourite colour */
  document.getElementById('pf-swatch').style.background =
    s.favColor || '#6366f1';
  document.getElementById('pf-colorname').textContent =
    s.colorName || '—';

  /* Courses undertaking */
  const coursesEl = document.getElementById('pf-courses');
  if (s.courses && s.courses.length) {
    const shown = s.courses.slice(0, 3)
      .map(c => `<span style="display:block;font-size:12px;color:var(--teal);font-weight:500">· ${c}</span>`)
      .join('');
    const extra = s.courses.length > 3
      ? `<span style="font-size:11px;color:var(--muted)">+${s.courses.length - 3} more</span>`
      : '';
    coursesEl.innerHTML = shown + extra;
  } else {
    coursesEl.innerHTML = '<span class="empty">Not set</span>';
  }
}

/* Run on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', init);

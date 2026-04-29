/* ============================================================
   edit-profile.js  –  VTU Portal Edit Profile Page Logic
   ============================================================ */

/* ── Colour Palette ─────────────────────────────────────── */

/** Preset swatches shown below the colour picker. */
const PALETTE = [
  { h: '#ef4444', n: 'Red'        },
  { h: '#f97316', n: 'Orange'     },
  { h: '#f59e0b', n: 'Amber'      },
  { h: '#22c55e', n: 'Green'      },
  { h: '#14b8a6', n: 'Teal'       },
  { h: '#06b6d4', n: 'Cyan'       },
  { h: '#3b82f6', n: 'Blue'       },
  { h: '#5c6ef8', n: 'Indigo Blue'},
  { h: '#8b5cf6', n: 'Violet'     },
  { h: '#d946ef', n: 'Fuchsia'    },
  { h: '#ec4899', n: 'Pink'       },
  { h: '#1e293b', n: 'Slate Dark' },
];

/* ── State ──────────────────────────────────────────────── */
let selectedGender = '';
let pendingPhoto   = null;
let pwVisible      = false;

/* ── Colour helpers ─────────────────────────────────────── */

/**
 * Highlight the preset swatch that matches the current hex.
 * @param {string} hex
 */
function syncPresetActive(hex) {
  document.querySelectorAll('.preset').forEach(p => {
    p.classList.toggle('active', p.dataset.hex.toLowerCase() === hex.toLowerCase());
  });
}

/**
 * Update the colour name label, swatch dot, and picker input.
 * @param {string} hex
 * @param {string} [name] - optional override; looked up from PALETTE if omitted
 */
function onColorInput(hex, name) {
  if (!name) {
    name = PALETTE.find(c => c.h.toLowerCase() === hex.toLowerCase())?.n || hex;
  }
  document.getElementById('cn-swatch').style.background = hex;
  document.getElementById('cn-label').textContent       = name;
  document.getElementById('cn-label').style.color       = hex;
  syncPresetActive(hex);
}

/**
 * Render preset swatch buttons and mark the active one.
 */
function buildPresets() {
  const container = document.getElementById('presets');
  container.innerHTML = '';

  PALETTE.forEach(c => {
    const btn        = document.createElement('div');
    btn.className    = 'preset';
    btn.style.background = c.h;
    btn.title        = c.n;
    btn.dataset.hex  = c.h;
    btn.dataset.name = c.n;

    btn.addEventListener('click', () => {
      document.getElementById('m-color').value = c.h;
      onColorInput(c.h, c.n);
      container.querySelectorAll('.preset').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
    });

    container.appendChild(btn);
  });

  syncPresetActive(document.getElementById('m-color').value);
}

/* ── Gender ─────────────────────────────────────────────── */

/**
 * Visually select a gender option.
 * @param {string} val
 * @param {HTMLElement} el – the label element clicked
 */
function selectGender(val, el) {
  selectedGender = val;
  document.querySelectorAll('.g-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

/* ── Course checkboxes ───────────────────────────────────── */

/**
 * Toggle the checked state of a course checkbox item.
 * @param {HTMLElement} el – the label.c-check element
 */
function toggleCourse(el) {
  el.classList.toggle('checked');
  el.querySelector('input').checked = el.classList.contains('checked');
}

/* ── Photo upload ────────────────────────────────────────── */

/**
 * Handle a file chosen via any photo input.
 * Reads the file as a data URL, stores it in pendingPhoto,
 * and updates the header avatar + zone preview.
 * @param {Event} e
 */
function handlePhoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    pendingPhoto = ev.target.result;

    /* Header avatar */
    const ha = document.getElementById('ptb-avatar');
    ha.innerHTML = `<img src="${pendingPhoto}" alt="Profile photo"><div class="avatar-edit-hint">✏️</div>`;

    /* Upload zone preview */
    document.getElementById('pz-preview').innerHTML =
      `<img src="${pendingPhoto}" alt="Preview">`;
  };
  reader.readAsDataURL(file);
}

/* ── Password visibility ─────────────────────────────────── */

/** Toggle the read-only password field between dots and plain text. */
function togglePw() {
  const field = document.getElementById('pw-field');
  const btn   = document.querySelector('.pw-eye');
  pwVisible   = !pwVisible;

  field.type      = pwVisible ? 'text' : 'password';
  btn.textContent = pwVisible ? '🙈' : '👁';
}

/* ── Toast ───────────────────────────────────────────────── */

/**
 * Show the success toast for a brief duration.
 * @param {string} msg
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── Save ────────────────────────────────────────────────── */

/**
 * Read all editable form values, merge them into the student record
 * stored in sessionStorage, show a toast, then redirect to the
 * landing page.
 */
function saveProfile() {
  const raw = sessionStorage.getItem('vtu_student');
  if (!raw) return;

  const s = JSON.parse(raw);

  s.dob       = document.getElementById('m-dob').value;
  s.city      = document.getElementById('m-city').value.trim() || s.city;
  s.gender    = selectedGender || s.gender;
  s.favColor  = document.getElementById('m-color').value;
  s.colorName = document.getElementById('cn-label').textContent;

  /* Collect checked courses */
  s.courses = [];
  document.querySelectorAll('.c-check.checked').forEach(el => {
    s.courses.push(el.querySelector('input').value);
  });

  /* Apply pending photo */
  if (pendingPhoto) s.photo = pendingPhoto;

  sessionStorage.setItem('vtu_student', JSON.stringify(s));
  showToast('Profile updated! Redirecting…');
  setTimeout(() => { window.location.href = 'landing.html'; }, 1600);
}

/* ── Initialise ──────────────────────────────────────────── */

/**
 * Load current student data from sessionStorage and populate
 * every form field. Redirect to login if no session exists.
 */
function init() {
  const raw = sessionStorage.getItem('vtu_student');
  if (!raw) { window.location.href = 'login.html'; return; }

  const s        = JSON.parse(raw);
  const initials = s.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  /* Header avatar */
  const ha = document.getElementById('ptb-avatar');
  if (s.photo) {
    ha.innerHTML = `<img src="${s.photo}" alt="Profile photo"><div class="avatar-edit-hint">✏️</div>`;
  } else {
    /* Text node inside the div */
    ha.childNodes[0].textContent = initials;
  }
  document.getElementById('ptb-email').textContent = s.email;

  /* Read-only fields */
  document.getElementById('ro-name').value   = s.name;
  document.getElementById('ro-email').value  = s.email;
  document.getElementById('pw-field').value  = s.password;
  document.getElementById('ro-course').value = s.course;

  /* Editable fields */
  document.getElementById('m-dob').max   = new Date().toISOString().split('T')[0];
  document.getElementById('m-dob').value = s.dob  || '';
  document.getElementById('m-city').value= s.city || '';

  /* Gender */
  if (s.gender) {
    document.querySelectorAll('.g-opt').forEach(opt => {
      if (opt.querySelector('input').value === s.gender) {
        selectedGender = s.gender;
        opt.classList.add('selected');
      }
    });
  }

  /* Courses */
  const savedCourses = s.courses || [];
  document.querySelectorAll('.c-check').forEach(el => {
    const val = el.querySelector('input').value;
    if (savedCourses.includes(val)) {
      el.classList.add('checked');
      el.querySelector('input').checked = true;
    }
  });

  /* Photo zone */
  if (s.photo) {
    document.getElementById('pz-preview').innerHTML =
      `<img src="${s.photo}" alt="Preview">`;
  }

  /* Colour */
  const col = s.favColor || '#5c6ef8';
  document.getElementById('m-color').value = col;
  onColorInput(col, s.colorName || '');
  buildPresets();
}

/* Run after DOM is ready */
document.addEventListener('DOMContentLoaded', init);

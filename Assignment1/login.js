/* ============================================================
   login.js  –  VTU Portal Login Page Logic
   ============================================================ */

/**
 * Toggle the password input between visible / hidden text.
 */
function toggleEye() {
  const pwField = document.getElementById('f-pass');
  const eyeBtn  = document.querySelector('.eye-btn');

  if (pwField.type === 'password') {
    pwField.type   = 'text';
    eyeBtn.textContent = '🙈';
  } else {
    pwField.type   = 'password';
    eyeBtn.textContent = '👁';
  }
}

/**
 * Show an error message in the error banner.
 * @param {string} msg
 */
function showError(msg) {
  const banner = document.getElementById('err');
  const text   = document.getElementById('err-msg');
  text.textContent = msg;
  banner.classList.add('show');
}

/**
 * Hide the error banner.
 */
function hideError() {
  document.getElementById('err').classList.remove('show');
}

/**
 * Validate form fields and, on success, persist student data
 * in sessionStorage then navigate to the landing page.
 * @param {Event} e – form submit event
 * @returns {boolean} false (always, to prevent native submission)
 */
function doLogin(e) {
  e.preventDefault();
  hideError();

  /* ── Gather values ── */
  const name   = document.getElementById('f-name').value.trim();
  const email  = document.getElementById('f-email').value.trim();
  const pass   = document.getElementById('f-pass').value;
  const course = document.getElementById('f-course').value;
  const city   = document.getElementById('f-city').value.trim();

  /* ── Validate ── */
  if (!name) {
    showError('Please enter your full name.');
    return false;
  }
  if (!email || !email.includes('@') || !email.includes('.')) {
    showError('Enter a valid email address.');
    return false;
  }
  if (pass.length < 6) {
    showError('Password must be at least 6 characters.');
    return false;
  }
  if (!course) {
    showError('Please select your course.');
    return false;
  }

  /* ── Persist student record ── */
  const student = {
    name,
    email,
    password : pass,
    course,
    city     : city || '—',
    /* Profile fields filled in on edit-profile page */
    dob       : '',
    gender    : '',
    courses   : [],
    favColor  : '#6366f1',
    colorName : 'Indigo',
    photo     : null
  };

  sessionStorage.setItem('vtu_student', JSON.stringify(student));

  /* ── Navigate ── */
  window.location.href = 'landing.html';
  return false;
}

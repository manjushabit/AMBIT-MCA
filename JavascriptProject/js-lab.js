/* ============================================================
   js-lab.js  —  JS Lab sandbox runner
   Intercepts console.log and runs user code safely
   ============================================================ */

/* ── Sandbox runner ──────────────────────────────────────── */

/**
 * Run the code in a sandbox textarea and display output.
 * @param {string} sandboxId  — the id of the sandbox wrapper div
 */
function runSandbox(sandboxId) {
  const codeEl  = document.getElementById(sandboxId + '-code');
  const outEl   = document.getElementById(sandboxId + '-out');
  const code    = codeEl.value;

  /* Collect log lines */
  const lines   = [];
  const fakeLog = (...args) => {
    lines.push(
      args.map(a => {
        if (a === null)      return 'null';
        if (a === undefined) return 'undefined';
        if (typeof a === 'object') {
          try { return JSON.stringify(a, null, 2); } catch { return String(a); }
        }
        return String(a);
      }).join(' ')
    );
  };

  /* Run with intercepted console.log */
  try {
    /* Build a safe runner — only intercept console.log */
    const runner = new Function('console', code);
    runner({ log: fakeLog, warn: fakeLog, error: fakeLog, info: fakeLog });

    if (lines.length === 0) {
      outEl.textContent = '(no output — add console.log() calls)';
      outEl.className   = 'output-text empty';
    } else {
      outEl.textContent = lines.join('\n');
      outEl.className   = 'output-text';
    }
  } catch (err) {
    outEl.textContent = '⚠ ' + err.message;
    outEl.className   = 'output-text error';
  }
}

/* ── Tab key support in textareas ────────────────────────── */
document.querySelectorAll('.sandbox-editor').forEach(ta => {
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      ta.value    = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 2;
    }

    /* Ctrl+Enter or Cmd+Enter to run */
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const sandboxId = ta.id.replace('-code', '');
      runSandbox(sandboxId);
    }
  });
});

/* ── Sidebar active link on scroll ──────────────────────── */
const sections    = document.querySelectorAll('.topic-section[id]');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      sidebarLinks.forEach(link => {
        const isActive = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', isActive);
      });
    }
  });
}, { rootMargin: '-20% 0px -75% 0px' });

sections.forEach(s => observer.observe(s));

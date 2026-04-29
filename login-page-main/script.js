// Shared app state keys for localStorage.
const STORAGE_KEYS = {
  AUTH: "novadeskAuthUser",
  THEME: "novadeskTheme"
};

const DUMMY_USERS = [
  { username: "admin", password: "admin123", displayName: "Admin" },
  { username: "staff1", password: "1234", displayName: "Staff1" },
  { username: "staff2", password: "1234", displayName: "Staff2" }
];

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  bindThemeToggle();

  if (isLoginPage()) {
    bindLoginPage();
  }

  if (isDashboardPage()) {
    guardDashboardRoute();
    bindDashboardPage();
  }
});

function isLoginPage() {
  return window.location.pathname.toLowerCase().includes("index.html") || window.location.pathname.endsWith("/");
}

function isDashboardPage() {
  return window.location.pathname.toLowerCase().includes("dashboard.html");
}

function initTheme() {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (storedTheme === "light") {
    document.body.classList.add("light-theme");
  }
  updateThemeIcon();
}

function bindThemeToggle() {
  const themeBtn = document.getElementById("themeToggle");
  if (!themeBtn) return;

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const newTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const iconEl = document.querySelector("#themeToggle .icon");
  if (!iconEl) return;
  const isLight = document.body.classList.contains("light-theme");
  iconEl.textContent = isLight ? "☀️" : "🌙";
}

function bindLoginPage() {
  // If already logged in, send user directly to dashboard.
  const existingUser = getStoredAuthUser();
  if (existingUser) {
    window.location.href = "dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const loginBtn = document.getElementById("loginBtn");
  const errorMessage = document.getElementById("errorMessage");

  if (!loginForm || !usernameInput || !passwordInput || !togglePasswordBtn || !loginBtn || !errorMessage) {
    return;
  }

  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePasswordBtn.textContent = isPassword ? "Hide" : "Show";
    togglePasswordBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideError(errorMessage);

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showError(errorMessage, "Please enter both username and password.");
      return;
    }

    setLoginLoading(loginBtn, true);

    // Simulate a quick API call for modern UX.
    window.setTimeout(() => {
      const matchedUser = DUMMY_USERS.find(
        (user) => user.username === username && user.password === password
      );

      if (!matchedUser) {
        setLoginLoading(loginBtn, false);
        showError(errorMessage, "Invalid credentials. Please try again.");
        return;
      }

      localStorage.setItem(
        STORAGE_KEYS.AUTH,
        JSON.stringify({
          username: matchedUser.username,
          displayName: matchedUser.displayName
        })
      );

      window.location.href = "dashboard.html";
    }, 850);
  });
}

function setLoginLoading(loginBtn, isLoading) {
  loginBtn.classList.toggle("loading", isLoading);
  loginBtn.disabled = isLoading;
}

function showError(target, message) {
  target.textContent = message;
  target.classList.add("show");
}

function hideError(target) {
  target.textContent = "";
  target.classList.remove("show");
}

function guardDashboardRoute() {
  const authUser = getStoredAuthUser();
  if (!authUser) {
    window.location.href = "index.html";
  }
}

function bindDashboardPage() {
  const authUser = getStoredAuthUser();
  if (!authUser) return;

  const welcomeMessage = document.getElementById("welcomeMessage");
  const topbarUsername = document.getElementById("topbarUsername");
  const logoutBtnSide = document.getElementById("logoutBtnSide");
  const logoutBtnTop = document.getElementById("logoutBtnTop");

  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome, ${authUser.displayName}`;
  }

  if (topbarUsername) {
    topbarUsername.textContent = authUser.displayName;
  }

  [logoutBtnSide, logoutBtnTop].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", logout);
  });

  initDashboardMedia(authUser);
  initDashboardCanvas(authUser);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  window.location.href = "index.html";
}

function initDashboardMedia(_authUser) {
  // Audio/video elements already have sources + controls in HTML.
  // This function exists so we can extend dashboard media behavior later.
  const audioEl = document.getElementById("dashboardAudio");
  const videoEl = document.getElementById("dashboardVideo");

  // If elements exist, mark them as initialized (helps debugging).
  if (audioEl) audioEl.dataset.initialized = "true";
  if (videoEl) videoEl.dataset.initialized = "true";
}

function initDashboardCanvas(authUser) {
  const canvas = document.getElementById("dashboardCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const state = {
    w: 0,
    h: 0,
    dpr: window.devicePixelRatio || 1,
    rafId: null,
  };

  // Create some moving dots for the animation.
  const particles = Array.from({ length: 28 }, () => {
    const x = Math.random();
    const y = Math.random();
    const speed = 0.2 + Math.random() * 0.65;
    const angle = Math.random() * Math.PI * 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 1 + Math.random() * 2.4,
      a: 0.35 + Math.random() * 0.45,
    };
  });

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(320, Math.floor(rect.width));
    const cssH = Math.max(160, Math.floor(rect.height));
    state.w = cssW;
    state.h = cssH;

    canvas.width = Math.floor(cssW * state.dpr);
    canvas.height = Math.floor(cssH * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  };

  // Resize once at startup, then keep it responsive.
  resizeCanvas();

  let lastTimeStr = "";
  const draw = () => {
    const w = state.w;
    const h = state.h;
    if (!w || !h) {
      state.rafId = window.requestAnimationFrame(draw);
      return;
    }

    // Background gradient.
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
    grad.addColorStop(1, "rgba(99, 102, 241, 0.25)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid for depth.
    ctx.strokeStyle = "rgba(226, 232, 240, 0.08)";
    ctx.lineWidth = 1;
    const step = Math.max(26, Math.floor(w / 16));
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Animate particles (wrap around edges).
    particles.forEach((p) => {
      p.x += p.vx / 400;
      p.y += p.vy / 400;

      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05;
      if (p.y > 1.05) p.y = -0.05;

      const px = p.x * w;
      const py = p.y * h;
      ctx.beginPath();
      ctx.fillStyle = `rgba(226, 232, 240, ${p.a})`;
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Foreground text.
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (timeStr !== lastTimeStr) lastTimeStr = timeStr;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
    ctx.font = `600 ${Math.max(16, Math.floor(w / 18))}px Poppins, sans-serif`;
    ctx.fillText(`Welcome, ${authUser.displayName}`, w / 2, h / 2);

    ctx.fillStyle = "rgba(203, 213, 225, 0.88)";
    ctx.font = `400 ${Math.max(12, Math.floor(w / 28))}px Poppins, sans-serif`;
    ctx.fillText(lastTimeStr, w / 2, h / 2 + 32);

    state.rafId = window.requestAnimationFrame(draw);
  };

  // Debounce resize a little to avoid too frequent redraw work.
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeCanvas();
    }, 120);
  });

  state.rafId = window.requestAnimationFrame(draw);
}

function getStoredAuthUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    return null;
  }
}


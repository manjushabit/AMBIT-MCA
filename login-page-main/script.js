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
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  window.location.href = "index.html";
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

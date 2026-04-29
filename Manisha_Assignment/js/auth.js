const USERS_KEY = "vtu_users";
const SESSION_KEY = "vtu_session_email";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    return Array.isArray(users) ? users : [];
  } catch (_) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  const text = String(password || "");
  if (window.crypto && window.crypto.subtle && window.TextEncoder) {
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent(text)));
}

async function registerUser(data) {
  const name = String(data && data.name ? data.name : "").trim();
  const email = normalizeEmail(data && data.email);
  const password = String(data && data.password ? data.password : "");
  const domain = String(data && data.domain ? data.domain : "").trim();
  const city = String(data && data.city ? data.city : "").trim();

  if (!name || !email || !password || !domain || !city) {
    return { ok: false, message: "Please fill in all required fields." };
  }

  const users = getUsers();
  const exists = users.some((u) => normalizeEmail(u.email) === email);
  if (exists) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  users.push({
    name,
    email,
    passwordHash,
    domain,
    city,
    usn: "",
    semester: "",
    departmentNote: "",
    profilePicture: "",
    createdAt: Date.now(),
  });
  saveUsers(users);

  return { ok: true, message: "Registration successful." };
}

function getUserByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return getUsers().find((u) => normalizeEmail(u.email) === normalized) || null;
}

async function loginUser(email, password) {
  const normalized = normalizeEmail(email);
  const plainPassword = String(password || "");
  if (!normalized || !plainPassword) {
    return { ok: false, message: "Email and password are required." };
  }

  const user = getUserByEmail(normalized);
  if (!user) {
    return { ok: false, message: "No account found for this email." };
  }

  const enteredHash = await hashPassword(plainPassword);
  if (user.passwordHash !== enteredHash) {
    return { ok: false, message: "Incorrect password." };
  }

  localStorage.setItem(SESSION_KEY, normalized);
  return { ok: true, message: "Login successful." };
}

function getSessionEmail() {
  return normalizeEmail(localStorage.getItem(SESSION_KEY));
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuthRedirect() {
  const email = getSessionEmail();
  const user = email ? getUserByEmail(email) : null;
  if (!user) {
    window.location.replace("login.html");
    return null;
  }
  return user;
}

function updateUserProfile(email, updates) {
  const normalized = normalizeEmail(email);
  const users = getUsers();
  const idx = users.findIndex((u) => normalizeEmail(u.email) === normalized);
  if (idx === -1) return false;

  const allowed = [
    "name",
    "domain",
    "city",
    "usn",
    "semester",
    "departmentNote",
    "profilePicture",
  ];

  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      users[idx][key] = updates[key];
    }
  });

  saveUsers(users);
  return true;
}

const USERS_KEY = "eduportal_users";
const CURRENT_USER_KEY = "eduportal_current_user";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\d{10}$/;

const getUsers = () => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const getCurrentUser = () => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

const setError = (id, message) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
  }
};

const clearErrors = (errorIds) => {
  errorIds.forEach((id) => setError(id, ""));
};

const getSelectedCourses = (selectElement) => {
  return Array.from(selectElement.selectedOptions).map((option) => option.value);
};

const setupRegisterForm = () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const mobileInput = document.getElementById("mobile");
  const notice = document.getElementById("registerNotice");
  const errorIds = ["usernameError", "emailError", "passwordError", "mobileError", "placeError", "coursesError"];

  mobileInput.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(errorIds);
    notice.textContent = "";

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const mobile = document.getElementById("mobile").value.trim();
    const place = document.getElementById("place").value.trim();
    const courses = getSelectedCourses(document.getElementById("courses"));

    let valid = true;

    if (username.length < 3) {
      setError("usernameError", "Username must be at least 3 characters.");
      valid = false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("emailError", "Enter a valid email address.");
      valid = false;
    }
    if (password.length < 8) {
      setError("passwordError", "Password must be at least 8 characters.");
      valid = false;
    }
    if (!MOBILE_REGEX.test(mobile)) {
      setError("mobileError", "Mobile number must be exactly 10 digits.");
      valid = false;
    }
    if (!place) {
      setError("placeError", "Place is required.");
      valid = false;
    }
    if (courses.length === 0) {
      setError("coursesError", "Select at least one course.");
      valid = false;
    }

    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      setError("emailError", "This email is already registered.");
      valid = false;
    }

    if (!valid) return;

    const newUser = { username, email, password, mobile, place, courses };
    users.push(newUser);
    saveUsers(users);
    notice.textContent = "Registration successful! Redirecting to login...";
    form.reset();

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 900);
  });
};

const setupLoginForm = () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const notice = document.getElementById("loginNotice");
  const errorIds = ["loginEmailError", "loginPasswordError"];

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(errorIds);
    notice.textContent = "";

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    let valid = true;

    if (!EMAIL_REGEX.test(email)) {
      setError("loginEmailError", "Enter a valid email address.");
      valid = false;
    }
    if (!password) {
      setError("loginPasswordError", "Password is required.");
      valid = false;
    }
    if (!valid) return;

    const users = getUsers();
    const user = users.find((item) => item.email === email && item.password === password);

    if (!user) {
      notice.style.color = "#dc2626";
      notice.textContent = "Invalid email or password.";
      return;
    }

    notice.style.color = "#059669";
    notice.textContent = "Login successful! Redirecting...";
    setCurrentUser(user);

    setTimeout(() => {
      window.location.href = "./landing.html";
    }, 700);
  });
};

const setupLandingPage = () => {
  const welcomeMessage = document.getElementById("welcomeMessage");
  if (!welcomeMessage) return;

  const user = getCurrentUser();
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  document.getElementById("profileUsername").textContent = user.username || "-";
  document.getElementById("profileEmail").textContent = user.email || "-";
  document.getElementById("profileMobile").textContent = user.mobile || "-";
  document.getElementById("profilePlace").textContent = user.place || "-";
  welcomeMessage.textContent = `Welcome, ${user.username}!`;

  const coursesContainer = document.getElementById("coursesContainer");
  const courseCount = document.getElementById("courseCount");
  if (Array.isArray(user.courses) && user.courses.length > 0) {
    coursesContainer.innerHTML = user.courses.map((course) => `<span class="chip">${course}</span>`).join("");
    if (courseCount) courseCount.textContent = String(user.courses.length);
  } else {
    coursesContainer.textContent = "No courses selected.";
    if (courseCount) courseCount.textContent = "0";
  }

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    clearCurrentUser();
    window.location.href = "./login.html";
  });
};

setupRegisterForm();
setupLoginForm();
setupLandingPage();

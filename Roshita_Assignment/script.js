const STORAGE_KEY = "vtuStudentData";
const SESSION_KEY = "vtuStudentSession";
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='100%25' height='100%25' fill='%23dbeafe'/%3E%3Ccircle cx='75' cy='55' r='28' fill='%2360a5fa'/%3E%3Crect x='35' y='95' width='80' height='40' rx='20' fill='%233b82f6'/%3E%3C/svg%3E";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function setMessage(element, text, isSuccess) {
  if (!element) return;
  element.textContent = text;
  element.classList.remove("success", "error");
  element.classList.add(isSuccess ? "success" : "error");
}

function getStoredStudent() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveStudent(student) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
}

function initRegisterPage() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("registerMessage");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const domain = document.getElementById("domain").value;
    const city = document.getElementById("city").value.trim();

    const encryptedPassword = await hashPassword(password);
    const student = {
      name,
      email,
      password: encryptedPassword,
      domain,
      city,
      profilePicture: DEFAULT_AVATAR,
    };

    saveStudent(student);
    registerForm.reset();
    setMessage(message, "Registration successful. You can now login.", true);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  });
}

function initLoginPage() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("loginMessage");
    const storedStudent = getStoredStudent();

    if (!storedStudent) {
      setMessage(message, "No account found. Please register first.", false);
      return;
    }

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const encryptedPassword = await hashPassword(password);

    if (email === storedStudent.email && encryptedPassword === storedStudent.password) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setMessage(message, "Login successful. Redirecting...", true);
      setTimeout(() => {
        window.location.href = "portal.html";
      }, 700);
    } else {
      setMessage(message, "Invalid email or password.", false);
    }
  });
}

function showStudentDetails(student) {
  const studentInfo = document.getElementById("studentInfo");
  if (!studentInfo) return;

  studentInfo.innerHTML = `
    <div class="info-item"><strong>Name:</strong> ${student.name}</div>
    <div class="info-item"><strong>Email:</strong> ${student.email}</div>
    <div class="info-item"><strong>Domain:</strong> ${student.domain}</div>
    <div class="info-item"><strong>City:</strong> ${student.city}</div>
  `;
}

function initPortalPage() {
  const studentInfo = document.getElementById("studentInfo");
  if (!studentInfo) return;

  const isLoggedIn = sessionStorage.getItem(SESSION_KEY) === "true";
  const student = getStoredStudent();
  if (!isLoggedIn || !student) {
    window.location.href = "login.html";
    return;
  }

  const profileName = document.getElementById("profileName");
  const profilePreview = document.getElementById("profilePreview");
  const editName = document.getElementById("editName");
  const editEmail = document.getElementById("editEmail");
  const editDomain = document.getElementById("editDomain");
  const editCity = document.getElementById("editCity");
  const enableEditBtn = document.getElementById("enableEditBtn");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const profileForm = document.getElementById("profileForm");
  const profilePic = document.getElementById("profilePic");
  const profileMessage = document.getElementById("profileMessage");
  const logoutBtn = document.getElementById("logoutBtn");

  showStudentDetails(student);
  profileName.textContent = student.name;
  profilePreview.src = student.profilePicture || DEFAULT_AVATAR;
  editName.value = student.name;
  editEmail.value = student.email;
  editDomain.value = student.domain;
  editCity.value = student.city;

  const editableFields = [editName, editEmail, editDomain, editCity];
  function setEditMode(enabled) {
    editableFields.forEach((field) => {
      field.disabled = !enabled;
    });
    saveProfileBtn.disabled = !enabled;
  }

  setEditMode(false);

  enableEditBtn.addEventListener("click", () => {
    setEditMode(true);
    editName.focus();
    setMessage(profileMessage, "Edit mode enabled. Update fields and save profile.", true);
  });

  profilePic.addEventListener("change", () => {
    const file = profilePic.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function onLoad() {
      profilePreview.src = reader.result;
      setMessage(profileMessage, "Profile picture selected. Click Save Profile to store it.", true);
    };
    reader.readAsDataURL(file);
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const updatedName = editName.value.trim();
    const updatedEmail = editEmail.value.trim().toLowerCase();
    const updatedDomain = editDomain.value;
    const updatedCity = editCity.value.trim();

    if (updatedName) {
      student.name = updatedName;
    }
    if (updatedEmail) {
      student.email = updatedEmail;
    }
    if (updatedDomain) {
      student.domain = updatedDomain;
    }
    if (updatedCity) {
      student.city = updatedCity;
    }

    const file = profilePic.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function onLoad() {
        student.profilePicture = reader.result;
        saveStudent(student);
        profileName.textContent = student.name;
        profilePreview.src = student.profilePicture;
        showStudentDetails(student);
        setEditMode(false);
        profilePic.value = "";
        setMessage(profileMessage, "Profile updated successfully.", true);
      };
      reader.readAsDataURL(file);
    } else {
      saveStudent(student);
      profileName.textContent = student.name;
      showStudentDetails(student);
      setEditMode(false);
      setMessage(profileMessage, "Profile updated successfully.", true);
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  });

  initStudentCanvas();
}

function initStudentCanvas() {
  const canvas = document.getElementById("studentCanvas");
  if (!canvas) return;

  const clearCanvasBtn = document.getElementById("clearCanvasBtn");
  const brushColor = document.getElementById("brushColor");
  const brushSize = document.getElementById("brushSize");
  const context = canvas.getContext("2d");
  let drawing = false;

  context.lineCap = "round";
  context.lineJoin = "round";

  function getCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDraw(event) {
    drawing = true;
    const { x, y } = getCoordinates(event);
    context.beginPath();
    context.moveTo(x, y);
  }

  function draw(event) {
    if (!drawing) return;
    const { x, y } = getCoordinates(event);
    context.strokeStyle = brushColor.value;
    context.lineWidth = Number(brushSize.value);
    context.lineTo(x, y);
    context.stroke();
  }

  function stopDraw() {
    drawing = false;
    context.closePath();
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);

  clearCanvasBtn.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRegisterPage();
  initLoginPage();
  initPortalPage();
});

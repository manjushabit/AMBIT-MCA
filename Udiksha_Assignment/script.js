const USER_KEY = "studentPortalUser";
const PROFILE_KEY = "studentPortalProfile";
const PHOTO_KEY = "studentPortalPhoto";
const SESSION_KEY = "studentPortalSession";

function getStoredUser() {
  return JSON.parse(localStorage.getItem(USER_KEY) || "null");
}

function showMessage(id, text, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? "#dc3545" : "#1f45bf";
}

function handleSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (!/^[0-9]{10}$/.test(data.mobile)) {
      showMessage("signupMessage", "Mobile number must contain exactly 10 digits.", true);
      return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(data));
    showMessage("signupMessage", "Registration successful! Redirecting to login page...");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}

function handleLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const storedUser = getStoredUser();

    if (!storedUser) {
      showMessage("loginMessage", "No account found. Please sign up first.", true);
      return;
    }

    if (storedUser.email === data.email && storedUser.password === data.password) {
      localStorage.setItem(SESSION_KEY, "active");
      showMessage("loginMessage", "Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "landing.html";
      }, 1000);
    } else {
      showMessage("loginMessage", "Invalid email or password.", true);
    }
  });
}

function setPhotoPreview(base64Image) {
  const img = document.getElementById("profilePreview");
  const placeholder = document.getElementById("photoPlaceholder");
  if (!img || !placeholder) return;

  if (base64Image) {
    img.src = base64Image;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    img.src = "";
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

function renderRegistrationDetails(storedUser) {
  const displayName = document.getElementById("profileDisplayName");
  const detailsList = document.getElementById("registrationDetails");
  if (!displayName || !detailsList || !storedUser) return;

  displayName.textContent = storedUser.name || "Student";
  detailsList.innerHTML = "";

  const details = [
    ["Name", storedUser.name],
    ["Place", storedUser.place],
    ["Course", storedUser.course]
  ];

  details.forEach(([label, value]) => {
    const item = document.createElement("li");
    item.textContent = `${label}: ${value || "-"}`;
    detailsList.appendChild(item);
  });
}

function renderAmbitCanvas() {
  const canvas = document.getElementById("ambitCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const brushColor = document.getElementById("brushColor");
  const brushSize = document.getElementById("brushSize");
  const clearBtn = document.getElementById("clearCanvasBtn");
  const saveBtn = document.getElementById("saveCanvasBtn");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = brushColor ? brushColor.value : "#1f4ec8";
  ctx.lineWidth = brushSize ? Number(brushSize.value) : 4;

  let drawing = false;

  const getPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event) => {
    drawing = true;
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawing) return;
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawing = false;
    ctx.closePath();
  };

  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  if (brushColor) {
    brushColor.addEventListener("input", () => {
      ctx.strokeStyle = brushColor.value;
    });
  }

  if (brushSize) {
    brushSize.addEventListener("input", () => {
      ctx.lineWidth = Number(brushSize.value);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = brushColor ? brushColor.value : "#1f4ec8";
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = "ambit-canvas.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }
}

function handleLandingPage() {
  if (!document.getElementById("registrationDetails")) return;

  if (localStorage.getItem(SESSION_KEY) !== "active") {
    window.location.href = "login.html";
    return;
  }

  const storedUser = getStoredUser();
  const welcomeText = document.getElementById("welcomeText");
  if (storedUser && welcomeText) {
    welcomeText.textContent = `Welcome, ${storedUser.name}. Manage your AMBIT College profile and campus updates.`;
  }
  renderRegistrationDetails(storedUser);

  const savedPhoto = localStorage.getItem(PHOTO_KEY);
  setPhotoPreview(savedPhoto);

  const photoUpload = document.getElementById("photoUpload");
  photoUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(PHOTO_KEY, reader.result);
      setPhotoPreview(reader.result);
      showMessage("profileMessage", "Photo uploaded successfully.");
    };
    reader.readAsDataURL(file);
  });

  const deletePhotoBtn = document.getElementById("deletePhotoBtn");
  deletePhotoBtn.addEventListener("click", () => {
    localStorage.removeItem(PHOTO_KEY);
    setPhotoPreview(null);
    showMessage("profileMessage", "Photo removed.");
  });

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  });

  const campusAudio = document.getElementById("campusAudio");
  const campusVideo = document.getElementById("campusVideo");
  if (campusAudio && campusVideo) {
    campusAudio.addEventListener("play", () => {
      campusVideo.pause();
    });
    campusVideo.addEventListener("play", () => {
      campusAudio.pause();
    });
  }

  renderAmbitCanvas();

}

handleSignup();
handleLogin();
handleLandingPage();

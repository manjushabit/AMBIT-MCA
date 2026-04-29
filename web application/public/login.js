const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  loginMessage.textContent = "Checking credentials...";
  loginMessage.style.color = "#0b6cfb";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    window.location.href = "/dashboard.html";
  } catch (error) {
    loginMessage.textContent = error.message;
    loginMessage.style.color = "#d92d20";
  }
});

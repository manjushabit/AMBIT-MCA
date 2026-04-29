const token = localStorage.getItem("token");
const adminName = localStorage.getItem("name");

if (!token) {
  window.location.href = "/";
}

const welcomeText = document.getElementById("welcomeText");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const sortBtn = document.getElementById("sortBtn");
const exportBtn = document.getElementById("exportBtn");
const studentForm = document.getElementById("studentForm");
const studentFormStatus = document.getElementById("studentFormStatus");
const studentTableBody = document.getElementById("studentTableBody");
const tableStudentCount = document.getElementById("tableStudentCount");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const totalStudents = document.getElementById("totalStudents");
const totalCourses = document.getElementById("totalCourses");
const lastAdded = document.getElementById("lastAdded");
const announcementList = document.getElementById("announcementList");
const announcementInput = document.getElementById("announcementInput");
const addAnnouncementBtn = document.getElementById("addAnnouncementBtn");
const studentModal = document.getElementById("studentModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const detailId = document.getElementById("detailId");
const detailName = document.getElementById("detailName");
const detailEmail = document.getElementById("detailEmail");
const detailCourse = document.getElementById("detailCourse");

let allStudents = [];
let sortAscending = true;
const fixedCourses = ["MCA 1st Year", "MCA 2nd Year"];

const announcements = [
  "Semester registration opens from next Monday.",
  "Hackathon practice session at 4 PM in Lab 2."
];

welcomeText.textContent = `Welcome, ${adminName || "Admin"}`;

backBtn.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/";
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  window.location.href = "/";
});

refreshBtn.addEventListener("click", loadStudents);
sortBtn.addEventListener("click", toggleSort);
exportBtn.addEventListener("click", exportCsv);
searchInput.addEventListener("input", renderStudents);
courseFilter.addEventListener("change", renderStudents);
addAnnouncementBtn.addEventListener("click", addAnnouncement);
studentForm.addEventListener("submit", createStudent);
closeModalBtn.addEventListener("click", closeStudentModal);
studentModal.addEventListener("click", (event) => {
  if (event.target === studentModal) closeStudentModal();
});

async function loadStudents() {
  studentTableBody.innerHTML = `<tr><td colspan="5">Loading students...</td></tr>`;

  try {
    const response = await fetch("/api/students", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      logoutBtn.click();
      return;
    }

    allStudents = await response.json();
    if (!response.ok) {
      throw new Error(allStudents.message || "Failed to load students");
    }

    updateCourseOptions();
    updateStats();
    renderStudents();
  } catch (error) {
    studentTableBody.innerHTML = `<tr><td colspan="5" style="color:#d92d20">${error.message}</td></tr>`;
  }
}

async function createStudent(event) {
  event.preventDefault();
  studentFormStatus.textContent = "Creating student...";
  studentFormStatus.style.color = "#0b6cfb";

  const newStudent = {
    id: document.getElementById("studentId").value.trim(),
    name: document.getElementById("studentName").value.trim(),
    email: document.getElementById("studentEmail").value.trim(),
    course: document.getElementById("studentCourse").value.trim()
  };

  if (!fixedCourses.includes(newStudent.course)) {
    studentFormStatus.textContent = "Please select MCA 1st Year or MCA 2nd Year.";
    studentFormStatus.style.color = "#d92d20";
    return;
  }

  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newStudent)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create student");
    }

    studentForm.reset();
    studentFormStatus.textContent = "Student created successfully.";
    studentFormStatus.style.color = "#067647";
    lastAdded.textContent = newStudent.name;
    loadStudents();
  } catch (error) {
    studentFormStatus.textContent = error.message;
    studentFormStatus.style.color = "#d92d20";
  }
}

async function deleteStudent(studentId) {
  const confirmed = window.confirm("Delete this student?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/students/${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete student");
    }
    loadStudents();
  } catch (error) {
    window.alert(error.message);
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCourse = courseFilter.value;
  const sorted = [...allStudents].sort((a, b) => {
    if (sortAscending) {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  const filtered = sorted.filter((student) => {
    const matchesSearch =
      student.id.toLowerCase().includes(query) ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query);
    const matchesCourse = selectedCourse === "all" || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  if (filtered.length === 0) {
    tableStudentCount.textContent = `Showing 0 of ${allStudents.length} students`;
    studentTableBody.innerHTML = `<tr><td colspan="5">No matching students found.</td></tr>`;
    return;
  }

  tableStudentCount.textContent = `Showing ${filtered.length} of ${allStudents.length} students`;

  studentTableBody.innerHTML = filtered
    .map(
      (student) => `
        <tr>
          <td>${escapeHtml(student.id)}</td>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.course)}</td>
          <td>
            <button class="view-btn" data-view-id="${encodeURIComponent(student.id)}">View</button>
            <button class="delete-btn" data-id="${encodeURIComponent(student.id)}">Delete</button>
          </td>
        </tr>
      `
    )
    .join("");

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => deleteStudent(button.dataset.id));
  });
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", () => openStudentModal(button.dataset.viewId));
  });
}

function updateStats() {
  totalStudents.textContent = String(allStudents.length);
  const courses = new Set(allStudents.map((student) => student.course));
  totalCourses.textContent = String(courses.size);
  if (!lastAdded.textContent || lastAdded.textContent === "-") {
    lastAdded.textContent = allStudents[allStudents.length - 1]?.name || "-";
  }
}

function updateCourseOptions() {
  const selectedValue = courseFilter.value;
  const coursesFromData = [...new Set(allStudents.map((student) => student.course))];
  const courses = [...new Set([...fixedCourses, ...coursesFromData])];
  courseFilter.innerHTML = `<option value="all">All Courses</option>${courses
    .map((course) => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`)
    .join("")}`;
  if (selectedValue && courses.includes(selectedValue)) {
    courseFilter.value = selectedValue;
  }
}

function toggleSort() {
  sortAscending = !sortAscending;
  sortBtn.textContent = sortAscending ? "Sort A-Z" : "Sort Z-A";
  renderStudents();
}

function exportCsv() {
  if (allStudents.length === 0) {
    window.alert("No student data available to export.");
    return;
  }

  const rows = [
    ["ID", "Name", "Email", "Course"],
    ...allStudents.map((student) => [student.id, student.name, student.email, student.course])
  ];
  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "mca-students.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function escapeCsvValue(value) {
  const safeValue = String(value).replaceAll('"', '""');
  return `"${safeValue}"`;
}

function renderAnnouncements() {
  announcementList.innerHTML = announcements.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function addAnnouncement() {
  const text = announcementInput.value.trim();
  if (!text) return;
  announcements.unshift(text);
  announcementInput.value = "";
  renderAnnouncements();
}

function openStudentModal(encodedId) {
  const studentId = decodeURIComponent(encodedId);
  const student = allStudents.find((item) => item.id === studentId);
  if (!student) return;

  detailId.textContent = student.id;
  detailName.textContent = student.name;
  detailEmail.textContent = student.email;
  detailCourse.textContent = student.course;
  studentModal.classList.remove("hidden");
}

function closeStudentModal() {
  studentModal.classList.add("hidden");
}

renderAnnouncements();
loadStudents();

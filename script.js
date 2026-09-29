// =====================================================
// SCHOOL MANAGEMENT SYSTEM
// =====================================================

// ---------- 1. Dummy "database" ----------

// Login users (classroom demo only — NOT real authentication)
const users = [
  { username: "admin", password: "12345" },
  { username: "teacher", password: "teacher123" }
];

// Starter students, used only the first time (when LocalStorage is empty)
const defaultStudents = [
  { id: 1, name: "John Doe", age: 16, gender: "Male", class: "SS2", subject: "Mathematics", score: 82 },
  { id: 2, name: "Mary James", age: 15, gender: "Female", class: "SS1", subject: "English", score: 76 },
  { id: 3, name: "Chidi Okafor", age: 14, gender: "Male", class: "JSS3", subject: "Basic Science", score: 58 },
  { id: 4, name: "Amina Bello", age: 17, gender: "Female", class: "SS3", subject: "Biology", score: 39 }
];

const STORAGE_KEY = "sms_students";

let students = loadStudents(); // the main students array
let editingId = null;          // null = adding, a number = editing that student


// ---------- 2. Grab elements from the page ----------

const loginPage = document.getElementById("loginPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const dashboard = document.getElementById("dashboard");
const welcomeMessage = document.getElementById("welcomeMessage");
const logoutBtn = document.getElementById("logoutBtn");

const studentForm = document.getElementById("studentForm");
const formTitle = document.getElementById("formTitle");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const classInput = document.getElementById("studentClass");
const subjectInput = document.getElementById("subject");
const scoreInput = document.getElementById("score");

const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("studentTableBody");

const totalStudentsEl = document.getElementById("totalStudents");
const averageScoreEl = document.getElementById("averageScore");
const classCountsEl = document.getElementById("classCounts");

const modal = document.getElementById("studentModal");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModalBtn");


// ---------- 3. LocalStorage helpers ----------

function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved); // text -> array
  }
  return defaultStudents;
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); // array -> text
}


// ---------- 4. Login / Logout ----------

function login(event) {
  event.preventDefault(); // stop the form from reloading the page

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // find() returns the first user that matches, or undefined
  const user = users.find(function (u) {
    return u.username === username && u.password === password;
  });

  if (!user) {
    loginError.textContent = "Invalid username or password.";
    return;
  }

  loginError.textContent = "";
  loginForm.reset();
  welcomeMessage.textContent = `Welcome back, ${user.username}!`;

  loginPage.classList.add("hidden");
  dashboard.classList.remove("hidden");

  refreshDashboard();
}

function logout() {
  resetForm();
  searchInput.value = "";
  dashboard.classList.add("hidden");
  loginPage.classList.remove("hidden");
}


// ---------- 5. Grade calculation ----------

function calculateGrade(score) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}


// ---------- 6. Add & Update student (same form) ----------

function handleFormSubmit(event) {
  event.preventDefault();

  // Read the values from the form
  const name = nameInput.value.trim();
  const age = Number(ageInput.value);
  const gender = genderInput.value;
  const studentClass = classInput.value;
  const subject = subjectInput.value.trim();
  const score = Number(scoreInput.value);

  // Simple validation
  if (!name || !ageInput.value || !gender || !studentClass || !subject || scoreInput.value === "") {
    formError.textContent = "Please fill in all fields.";
    return;
  }
  if (score < 0 || score > 100) {
    formError.textContent = "Score must be between 0 and 100.";
    return;
  }
  formError.textContent = "";

  if (editingId === null) {
    addStudent(name, age, gender, studentClass, subject, score);
  } else {
    updateStudent(name, age, gender, studentClass, subject, score);
  }

  saveStudents();
  resetForm();
  refreshDashboard();
}

function addStudent(name, age, gender, studentClass, subject, score) {
  const newStudent = {
    id: getNextId(),
    name: name,
    age: age,
    gender: gender,
    class: studentClass,
    subject: subject,
    score: score
  };
  students.push(newStudent);
}

function updateStudent(name, age, gender, studentClass, subject, score) {
  const student = students.find(function (s) {
    return s.id === editingId;
  });

  // Update the existing object
  student.name = name;
  student.age = age;
  student.gender = gender;
  student.class = studentClass;
  student.subject = subject;
  student.score = score;
}

// Next ID = highest existing ID + 1 (so IDs never repeat after a delete)
function getNextId() {
  if (students.length === 0) return 1;
  const ids = students.map(function (s) { return s.id; });
  return Math.max(...ids) + 1;
}

function resetForm() {
  studentForm.reset();
  editingId = null;
  formError.textContent = "";
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelEditBtn.classList.add("hidden");
}


// ---------- 7. Display students in the table ----------

function displayStudents(list) {
  if (list.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">No students found.</td></tr>`;
    return;
  }

  let rows = "";
  list.forEach(function (student) {
    const grade = calculateGrade(student.score);
    rows += `
      <tr>
        <td>${String(student.id).padStart(2, "0")}</td>
        <td>${escapeHTML(student.name)}</td>
        <td>${student.class}</td>
        <td>${escapeHTML(student.subject)}</td>
        <td>
          <span class="score-cell">
            ${student.score}
            <span class="grade grade-${grade}">${grade}</span>
          </span>
        </td>
        <td>
          <div class="actions">
            <button class="action-btn" onclick="viewStudent(${student.id})">View</button>
            <button class="action-btn" onclick="editStudent(${student.id})">Edit</button>
            <button class="action-btn delete" onclick="deleteStudent(${student.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;
}


// ---------- 8. Search (uses filter) ----------

function searchStudents() {
  const term = searchInput.value.trim().toLowerCase();

  const matches = students.filter(function (student) {
    return student.name.toLowerCase().includes(term);
  });

  displayStudents(matches);
}


// ---------- 9. View student (modal) ----------

function viewStudent(id) {
  const student = students.find(function (s) { return s.id === id; });
  const grade = calculateGrade(student.score);

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2 id="modalName">${escapeHTML(student.name)}</h2>
      <span class="grade grade-${grade}">${grade}</span>
    </div>
    <dl class="details">
      <dt>Age</dt>     <dd>${student.age}</dd>
      <dt>Gender</dt>  <dd>${student.gender}</dd>
      <dt>Class</dt>   <dd>${student.class}</dd>
      <dt>Subject</dt> <dd>${escapeHTML(student.subject)}</dd>
      <dt>Score</dt>   <dd>${student.score} / 100</dd>
      <dt>Grade</dt>   <dd>${grade}</dd>
    </dl>
  `;

  modal.classList.remove("hidden");
  closeModalBtn.focus();
}

function closeModal() {
  modal.classList.add("hidden");
}


// ---------- 10. Edit student (Read -> Edit -> Update -> Re-render) ----------

function editStudent(id) {
  const student = students.find(function (s) { return s.id === id; });

  // Load existing values into the form
  nameInput.value = student.name;
  ageInput.value = student.age;
  genderInput.value = student.gender;
  classInput.value = student.class;
  subjectInput.value = student.subject;
  scoreInput.value = student.score;

  editingId = id;
  formTitle.textContent = `Edit Student #${String(id).padStart(2, "0")}`;
  submitBtn.textContent = "Update Student";
  cancelEditBtn.classList.remove("hidden");
  formError.textContent = "";

  nameInput.focus();
  studentForm.scrollIntoView({ behavior: "smooth", block: "start" });
}


// ---------- 11. Delete student (uses filter) ----------

function deleteStudent(id) {
  const student = students.find(function (s) { return s.id === id; });
  const confirmed = confirm(`Delete ${student.name}? This cannot be undone.`);
  if (!confirmed) return;

  // Keep every student EXCEPT the one with this id
  students = students.filter(function (s) { return s.id !== id; });

  // If we were editing this student, clear the form
  if (editingId === id) resetForm();

  saveStudents();
  refreshDashboard();
}


// ---------- 12. Dashboard statistics ----------

function updateDashboard() {
  // Total
  const total = students.length;
  totalStudentsEl.textContent = total;

  // Average
  let sum = 0;
  students.forEach(function (s) { sum += s.score; });
  const average = total === 0 ? 0 : sum / total;
  averageScoreEl.textContent = average.toFixed(1);

  // Count per class, e.g. { SS1: 2, SS2: 1 }
  const counts = {};
  students.forEach(function (s) {
    counts[s.class] = (counts[s.class] || 0) + 1;
  });

  const classNames = Object.keys(counts).sort();
  if (classNames.length === 0) {
    classCountsEl.innerHTML = `<span class="stat-label">No students yet</span>`;
    return;
  }

  classCountsEl.innerHTML = classNames
    .map(function (c) {
      return `<span class="class-chip">${c}: <strong>${counts[c]}</strong></span>`;
    })
    .join("");
}

// Re-render table (keeping any active search) + update stats
function refreshDashboard() {
  searchStudents();
  updateDashboard();
}


// ---------- 13. Helper: stop HTML being injected through names ----------

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


// ---------- 14. Event listeners ----------

loginForm.addEventListener("submit", login);
logoutBtn.addEventListener("click", logout);
studentForm.addEventListener("submit", handleFormSubmit);
cancelEditBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", searchStudents);

closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", function (event) {
  if (event.target === modal) closeModal(); // click on the dark background
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeModal();
});

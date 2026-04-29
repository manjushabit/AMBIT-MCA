const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");

const sessions = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg"
};

ensureStorage();

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STUDENTS_FILE)) {
    const seed = [
      {
        id: "MCA1001",
        name: "Aarav Sharma",
        email: "aarav@example.com",
        course: "MCA 1st Year"
      }
    ];
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(seed, null, 2));
  }
}

function readStudents() {
  return JSON.parse(fs.readFileSync(STUDENTS_FILE, "utf-8"));
}

function writeStudents(students) {
  fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": contentTypes[".json"] });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.replace("Bearer ", "").trim();
}

function isAuthenticated(req) {
  const token = getToken(req);
  return token && sessions.has(token);
}

function serveStatic(req, res) {
  const reqPath = req.url === "/" ? "/index.html" : req.url;
  const normalizedPath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { message: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackErr, fallbackContent) => {
        if (fallbackErr) {
          sendJson(res, 404, { message: "Not found" });
          return;
        }
        res.writeHead(200, { "Content-Type": contentTypes[".html"] });
        res.end(fallbackContent);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (method === "POST" && url === "/api/login") {
    try {
      const body = await parseBody(req);
      const { username, password } = body;
      const safeUsername = String(username || "").trim().toLowerCase();
      const safePassword = String(password || "").trim();
      // Accept common admin username aliases to reduce login friction.
      const validUsername =
        safeUsername === "admin" || safeUsername === "mcaadmin" || safeUsername === "mca admin";
      if (validUsername && safePassword === "admin123") {
        const token = crypto.randomBytes(16).toString("hex");
        sessions.set(token, { username: safeUsername, loginAt: Date.now() });
        sendJson(res, 200, { token, name: "MCA Admin" });
      } else {
        sendJson(res, 401, { message: "Invalid username or password" });
      }
    } catch (error) {
      sendJson(res, 400, { message: "Invalid JSON request body" });
    }
    return;
  }

  if (method === "GET" && url === "/api/students") {
    if (!isAuthenticated(req)) {
      sendJson(res, 401, { message: "Unauthorized" });
      return;
    }
    sendJson(res, 200, readStudents());
    return;
  }

  if (method === "POST" && url === "/api/students") {
    if (!isAuthenticated(req)) {
      sendJson(res, 401, { message: "Unauthorized" });
      return;
    }

    try {
      const body = await parseBody(req);
      const { id, name, email, course } = body;
      if (!id || !name || !email || !course) {
        sendJson(res, 400, { message: "All fields are required" });
        return;
      }

      const students = readStudents();
      const alreadyExists = students.some((student) => student.id === id);
      if (alreadyExists) {
        sendJson(res, 409, { message: "Student ID already exists" });
        return;
      }

      const student = { id, name, email, course };
      students.push(student);
      writeStudents(students);
      sendJson(res, 201, student);
    } catch (error) {
      sendJson(res, 400, { message: "Invalid JSON request body" });
    }
    return;
  }

  if (method === "DELETE" && url.startsWith("/api/students/")) {
    if (!isAuthenticated(req)) {
      sendJson(res, 401, { message: "Unauthorized" });
      return;
    }

    const studentId = decodeURIComponent(url.split("/").pop());
    const students = readStudents();
    const filteredStudents = students.filter((student) => student.id !== studentId);

    if (students.length === filteredStudents.length) {
      sendJson(res, 404, { message: "Student not found" });
      return;
    }

    writeStudents(filteredStudents);
    sendJson(res, 200, { message: "Student deleted" });
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`MCA portal running on http://localhost:${PORT}`);
});

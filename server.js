const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Set security headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;");
  next();
});

// Serve static files with correct MIME types
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Serve src directory as static files
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve docs directory as static files
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Serve data directory directly for JSON files
app.use('/data', express.static(path.join(__dirname, 'docs', 'data')));

// Serve assets directory for images, CSS, JS, etc.
app.use('/assets', express.static(path.join(__dirname, 'docs', 'assets')));

const dataPath = path.join(__dirname, "docs", "data", "projects.json");

app.post("/add", (req, res) => {
  const newProject = req.body;
  console.log("Received new project:", newProject);

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      console.error("Read error:", err);
      return res.status(500).json({ error: "Failed to read file" });
    }

    let projects = [];
    try {
      projects = JSON.parse(data);
      if (!Array.isArray(projects)) throw new Error("projects.json must contain an array");
    } catch (e) {
      console.error("Parse error:", e);
      return res.status(500).json({ error: "Invalid JSON format in file" });
    }

    projects.push(newProject);

    fs.writeFile(dataPath, JSON.stringify(projects, null, 2), err => {
      if (err) {
        console.error("Write error:", err);
        return res.status(500).json({ error: "Failed to write file" });
      }

      console.log("Project saved.");
      res.json({ message: "Project added successfully!" });
    });
  });
});

// Serve the main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'projects.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'contact.html'));
});

// Also serve .html extensions for direct file access
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.get('/projects.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'projects.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'contact.html'));
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response for favicon
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
  console.log("Available routes:");
  console.log("  - / (home page)");
  console.log("  - /projects (projects page)");
  console.log("  - /contact (contact page)");
});

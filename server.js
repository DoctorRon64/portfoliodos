const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // serves editor.html and static files

const dataPath = path.join(__dirname, "src", "data", "projects.json"); // adjust if needed

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

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

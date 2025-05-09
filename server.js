const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;
const open = require('open');

// Serve static files from your docs folder
app.use(express.static(path.join(__dirname, 'docs')));
app.use(express.json());

// Init DB
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, role TEXT, status TEXT)`);
});

// API to get items
// app.get('/api/items', (req, res) => {
//     db.all(`SELECT * FROM items`, [], (err, rows) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(rows);
//     });
// });

// API to add an item
// app.post('/api/items', (req, res) => {
//   const { name } = req.body;
//   db.run(`INSERT INTO items (name) VALUES (?)`, [name], function(err) {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ id: this.lastID, name });
//   });
// });

app.post('/api/items', (req, res) => {
  const { name, tags } = req.body; // tags should be an array

  db.run(`INSERT INTO items (name) VALUES (?)`, [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const itemId = this.lastID;

    tags.forEach(tag => {
      db.run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tag], () => {
        db.get(`SELECT id FROM tags WHERE name = ?`, [tag], (err, row) => {
          if (!err && row) {
            db.run(`INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)`, [itemId, row.id]);
          }
        });
      });
    });

    res.json({ id: itemId, name, tags });
  });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    import('open').then(({ default: open }) => {
        open(`http://localhost:${PORT}`);
    }).catch(err => {
        console.error('Failed to open browser:', err);
    });
});
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

const app = express();
const PORT = 3001;

const pool = mysql.createPool({
  host: dotenv.DB_URI,
  user: dotenv.DB_USERNAME,
  password: dotenv.DB_PASSWORD,
  database: "bookmarkSync",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(bodyParser.json());

// Endpoint: Verify User
app.post("/api/verify-user", async (req, res) => {
  const { secretKey } = req.body;
  if (!secretKey)
    return res.status(400).json({ message: "Secret key required." });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE secret_key = ?",
      [secretKey]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "User verified." });
  } catch (err) {
    res.status(500).json({ message: "Database error.", error: err.message });
  }
});

// Endpoint: Create New User
app.post("/api/new-user", async (req, res) => {
  const { secretKey } = req.body;
  if (!secretKey)
    return res.status(400).json({ message: "Secret key required." });
  try {
    // Check if user already exists
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE secret_key = ?",
      [secretKey]
    );
    if (rows.length > 0)
      return res.status(400).json({ message: "User already exists." });
    await pool.query("INSERT INTO users (secret_key) VALUES (?)", [secretKey]);
    res.status(200).json({ message: "User created." });
  } catch (err) {
    res.status(500).json({ message: "Database error.", error: err.message });
  }
});

// Endpoint: Sync Bookmarks
app.post("/api/sync-bookmarks", async (req, res) => {
  const { secretKey, bookmarks, fullBookmarksTree, syncType } = req.body;
  if (!secretKey || !syncType)
    return res.status(400).json({ message: "Missing required fields." });
  try {
    // Check if user exists
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE secret_key = ?",
      [secretKey]
    );
    if (userRows.length === 0)
      return res.status(404).json({ message: "User not found." });
    const userId = userRows[0].id;

    if (syncType === "browser" && Array.isArray(bookmarks)) {
      // Remove old bookmarks for this user
      await pool.query("DELETE FROM bookmarks WHERE user_id = ?", [userId]);
      // Insert new bookmarks
      for (const bm of bookmarks) {
        await pool.query(
          "INSERT INTO bookmarks (user_id, title, url) VALUES (?, ?, ?)",
          [userId, bm.title, bm.url]
        );
      }
      res.status(200).json({ message: "Bookmarks synced (browser)." });
    } else if (syncType === "device" && fullBookmarksTree) {
      // Store the full bookmarks tree as JSON
      await pool.query(
        "REPLACE INTO device_bookmarks (user_id, tree_json) VALUES (?, ?)",
        [userId, JSON.stringify(fullBookmarksTree)]
      );
      res.status(200).json({ message: "Bookmarks synced (device)." });
    } else {
      res.status(400).json({ message: "Invalid syncType or data." });
    }
  } catch (err) {
    res.status(500).json({ message: "Database error.", error: err.message });
  }
});

// Endpoint: Get bookmarks for user
app.get("/api/bookmarks", async (req, res) => {
  const { secretKey } = req.query;
  if (!secretKey)
    return res.status(400).json({ message: "Secret key required." });
  try {
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE secret_key = ?",
      [secretKey]
    );
    if (userRows.length === 0)
      return res.status(404).json({ message: "User not found." });
    const userId = userRows[0].id;

    const [bookmarkRows] = await pool.query(
      "SELECT id, title, url FROM bookmarks WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({ bookmarks: bookmarkRows });
  } catch (err) {
    res.status(500).json({ message: "Database error.", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "sysadmin",
  database: "bookmarkSync",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Debugging event handlers
process.on("exit", (code) => {
  console.log(`Process exiting with code: ${code}`);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// POST /api/verify-user
app.post("/api/verify-user", async (req, res) => {
  const { secretKey } = req.body;
  if (!secretKey) {
    return res.status(400).json({ message: "secretKey is required" });
  }
  try {
    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE secret_key = ?",
      [secretKey]
    );
    if (rows.length > 0) {
      return res.status(200).json({ message: "User verified" });
    }
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error("Error verifying user:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/new-user
app.post("/api/new-user", async (req, res) => {
  const { secretKey } = req.body;
  if (!secretKey) {
    return res.status(400).json({ message: "secretKey is required" });
  }
  try {
    const [exist] = await pool.execute(
      "SELECT id FROM users WHERE secret_key = ?",
      [secretKey]
    );
    if (exist.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    await pool.execute("INSERT INTO users (secret_key) VALUES (?)", [
      secretKey,
    ]);
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/sync-bookmarks
app.post("/api/sync-bookmarks", async (req, res) => {
  const { secretKey, bookmarks, fullBookmarksTree, syncType } = req.body;
  if (!secretKey || !syncType) {
    return res
      .status(400)
      .json({ message: "secretKey and syncType are required" });
  }
  try {
    // Get the user id
    const [userRows] = await pool.execute(
      "SELECT id FROM users WHERE secret_key = ?",
      [secretKey]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userRows[0].id;

    // Determine data based on syncType
    let data;
    if (syncType === "browser") {
      if (!bookmarks) {
        return res
          .status(400)
          .json({ message: "bookmarks are required for browser sync" });
      }
      data = JSON.stringify(bookmarks);
    } else if (syncType === "device") {
      if (!fullBookmarksTree) {
        return res
          .status(400)
          .json({ message: "fullBookmarksTree is required for device sync" });
      }
      data = JSON.stringify(fullBookmarksTree);
    } else {
      return res.status(400).json({ message: "Invalid syncType" });
    }

    // Upsert bookmark record
    const [existing] = await pool.execute(
      "SELECT id FROM bookmarks WHERE user_id = ? AND type = ?",
      [userId, syncType]
    );
    if (existing.length > 0) {
      await pool.execute(
        "UPDATE bookmarks SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [data, existing[0].id]
      );
    } else {
      await pool.execute(
        "INSERT INTO bookmarks (user_id, type, data) VALUES (?, ?, ?)",
        [userId, syncType, data]
      );
    }

    const message =
      syncType === "browser"
        ? "Browser bookmarks synced"
        : "Full bookmark tree synced";
    return res.status(200).json({ message });
  } catch (err) {
    console.error("Error syncing bookmarks:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Simple health-check endpoint
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Keep the process alive even if no pending events remain
process.stdin.resume();

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const crypto = require("crypto"); // for SHA1
const axios = require("axios");
require("dotenv").config();

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Password breach check route
app.post("/check-breach", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Step 1: SHA1 hash of password
    const hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Step 2: Call HaveIBeenPwned API
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`
    );

    // Step 3: Check if suffix exists in response
    const lines = response.data.split("\n");
    let count = 0;
    for (let line of lines) {
      const [hashSuffix, times] = line.trim().split(":");
      if (hashSuffix === suffix) {
        count = parseInt(times, 10);
        break;
      }
    }

    if (count > 0) {
      res.json({ breached: true, count });
    } else {
      res.json({ breached: false, count: 0 });
    }
  } catch (error) {
    console.error("❌ Breach check error:", error.message);
    res.status(500).json({ error: "Error checking breach" });
  }
});
app.post("/check-strength", (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });
  
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
  
    let strength = "Weak";
    if (score === 2) strength = "Medium";
    else if (score === 3) strength = "Strong";
    else if (score === 4) strength = "Very Strong";
  
    res.json({ strength, score });
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

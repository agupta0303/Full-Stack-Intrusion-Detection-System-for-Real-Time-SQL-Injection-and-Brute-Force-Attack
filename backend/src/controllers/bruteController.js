const AttackLog = require("../models/AttackLog");
const axios = require("axios");

const loginAttempts = {};

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 1000;

exports.login = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { username, password } = req.body;
  const now = Date.now();

  if (!loginAttempts[ip]) {
    loginAttempts[ip] = [];
  }

  // Remove old attempts outside of the window
  loginAttempts[ip] = loginAttempts[ip].filter((timestamp) => now - timestamp < WINDOW_MS);
  
  // Record current attempt before checking to count it in features
  loginAttempts[ip].push(now);
  
  const attemptCount = loginAttempts[ip].length;
  const timeSinceFirst = attemptCount > 1 ? (now - loginAttempts[ip][0]) : 0;
  
  // Formulate features: [attempt_count, time_since_first, username_length, fail_ratio (dummy 1.0)]
  const features = [attemptCount, timeSinceFirst, username ? username.length : 0, 1.0];
  
  let mlScore = 0;
  let anomaly = false;
  try {
    const response = await axios.post("http://localhost:5000/predict/brute", { features });
    anomaly = response.data.anomaly;
    mlScore = response.data.confidenceScore || 0;
  } catch (err) {
    console.error("ML Brute check failed:", err.message);
  }

  // If ML flags as anomaly OR static heuristic reaches max attempts
  if (anomaly || attemptCount >= MAX_ATTEMPTS) {
    await AttackLog.create({
      attackType: "Brute Force",
      payload: `Target Username: ${username || 'unknown'}`,
      confidenceScore: anomaly ? mlScore : 0.95,
      severity: "High",
      detectedBy: anomaly ? "IsolationForest-ML" : "Rate Limiter Heuristic"
    });

    return res.status(429).json({ message: "Brute Force Detected! Too many failed attempts. You are now blocked for 1 minute." });
  }

  if (username === "admin" && password === "password123") {
    // Clear attempts on success
    delete loginAttempts[ip];
    return res.status(200).json({ message: "Login successful!" });
  }

  res.status(401).json({ message: "Invalid Credentials" });
};

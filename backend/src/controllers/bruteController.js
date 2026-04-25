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

  // sliding window
  loginAttempts[ip] = loginAttempts[ip].filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  loginAttempts[ip].push(now);

  const attemptCount = loginAttempts[ip].length;
  const timeSinceFirst = attemptCount > 1 ? (now - loginAttempts[ip][0]) : 0;

  const features = [
    attemptCount,
    timeSinceFirst,
    username ? username.length : 0,
    1.0
  ];

  let anomaly = false;
  let mlScore = 0;

  try {
    const response = await axios.post(
      "http://localhost:5000/predict/brute",
      { features }
    );
    anomaly = response.data.anomaly;
    mlScore = response.data.confidenceScore || 0;
  } catch (err) {
    console.error("ML Brute check failed:", err.message);
  }

  if (anomaly || attemptCount >= MAX_ATTEMPTS) {
    await AttackLog.create({
      attackType: "Brute Force",
      payload: `Username: ${username || "unknown"}`,
      confidenceScore: anomaly ? mlScore : 0.95,
      severity: "High",
      detectedBy: anomaly
        ? "IsolationForest-ML"
        : "Rate Limiter"
    });

    return res.status(429).json({
      message: "Too many attempts. Try again later."
    });
  }

  if (username !== "admin" || password !== "admin123") {
    await AttackLog.create({
      attackType: "Invalid Login",
      payload: `Invalid credentials for: ${username}`,
      confidenceScore: 0.6,
      severity: "Medium",
      detectedBy: "Credential Check"
    });

    return res.status(401).json({ message: "Invalid Credentials" });
  }

  delete loginAttempts[ip];

  return res.status(200).json({
    message: "Login successful"
  });
};
const AttackLog = require("../models/AttackLog");

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

  loginAttempts[ip] = loginAttempts[ip].filter((timestamp) => now - timestamp < WINDOW_MS);

  if (loginAttempts[ip].length >= MAX_ATTEMPTS) {
    await AttackLog.create({
      attackType: "Brute Force",
      payload: `Target Username: ${username || 'unknown'}`,
      confidenceScore: 0.99,
      severity: "High",
      detectedBy: "Rate Limiter Heuristic"
    });

    return res.status(429).json({ message: "Brute Force Detected! Too many failed attempts. Please try again later." });
  }

  if (username === "admin" && password === "password123") {
    delete loginAttempts[ip];
    return res.status(200).json({ message: "Login successful!" });
  }
  loginAttempts[ip].push(now);

  if (loginAttempts[ip].length >= MAX_ATTEMPTS) {
    await AttackLog.create({
      attackType: "Brute Force",
      payload: `Target Username: ${username || 'unknown'}`,
      confidenceScore: 0.95,
      severity: "High",
      detectedBy: "Rate Limiter Heuristic"
    });

    return res.status(429).json({ message: "Brute Force Detected! Too many failed attempts. You are now blocked for 1 minute." });
  }

  res.status(401).json({ message: "Invalid Credentials" });
};

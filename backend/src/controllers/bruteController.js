const AttackLog = require("../models/AttackLog");
const mlDetect = require("../middleware/mlDetector");

let attempts = {};

exports.login = async (req, res) => {
  const ip = req.ip;
  const now = Date.now();

  attempts[ip] = (attempts[ip] || []).filter(t => now - t < 60000);
  attempts[ip].push(now);

  const features = [
    attempts[ip].length,
    now % 60000,
    1, 0, 1, attempts[ip].length > 4 ? 1 : 0
  ];

  const result = await mlDetect(features);

  if (result.anomaly) {
    await AttackLog.create({
      attackType: "Brute Force (ML)",
      ipAddress: ip,
      confidenceScore: result.confidence,
      actionTaken: "Blocked"
    });

    return res.status(429).json({ message: "Brute Force Detected (ML)" });
  }

  res.status(401).json({ message: "Invalid Credentials" });
};

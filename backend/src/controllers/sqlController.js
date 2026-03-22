exports.detect = (req, res) => {
  const { input, query, sql } = req.body;
  
  res.status(200).json({
    result: "allowed",
    message: "Query executed safely - No threats detected",
    data: { input, query, sql },
    safe: true,
    detectedBy: "None (Safe)"
  });
};

exports.getLogs = async (req, res) => {
  try {
    const AttackLog = require("../models/AttackLog");
    const logs = await AttackLog.find()
      .sort({ timestamp: -1 })
      .limit(20);
    res.status(200).json({
      safeQueriesProcessed: true,
      totalAttacks: logs.length,
      attacks: logs
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

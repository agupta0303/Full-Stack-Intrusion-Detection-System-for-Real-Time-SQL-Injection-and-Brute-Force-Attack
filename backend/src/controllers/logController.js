const AttackLog = require("../models/AttackLog");

exports.getLogs = async (req, res) => {
  try {
    const logs = await AttackLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

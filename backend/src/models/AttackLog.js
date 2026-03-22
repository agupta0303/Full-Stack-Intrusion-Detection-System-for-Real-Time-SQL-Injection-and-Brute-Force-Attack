const mongoose = require("mongoose");

const attackLogSchema = new mongoose.Schema({
  attackType: {
    type: String,
    required: true
  },
  payload: {
    type: String,
    required: true
  },
  confidenceScore: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    required: true
  },
  detectedBy: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now  
  }
});

module.exports = mongoose.model("AttackLog", attackLogSchema);

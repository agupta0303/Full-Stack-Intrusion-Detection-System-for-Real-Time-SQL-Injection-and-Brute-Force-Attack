const { sqlRegexPatterns } = require("../utils/regexPatterns");
const AttackLog = require("../models/AttackLog");
const mlDetector = require("./mlDetector"); 

const getSeverity = (score) => {
  if (score >= 0.75) return "High";
  if (score >= 0.40) return "Medium";
  return "Low";
};

async function sqlDetector(req, res, next) {
  const payload = req.body?.input || req.body?.query || req.body?.sql || JSON.stringify(req.body);
  if (!payload) return next();

  console.log("Testing:", payload.substring(0, 40));

  // Strip inline comments to prevent regex bypasses
  const normalizedPayload = payload.replace(/\/\*[\s\S]*?\*\//g, '');

  if (sqlRegexPatterns.some(regex => regex.test(normalizedPayload))) {
    console.log("RULE-BASED BLOCKED");
    await AttackLog.create({
      attackType: "SQL_INJECTION",
      payload: payload.substring(0, 500),
      confidenceScore: 0.85, // Give rule-based strikes high confidence
      severity: getSeverity(0.85), 
      detectedBy: "RULE-BASED"
    });
    return res.status(403).json({ result: "blocked", detectedBy: "RULE-BASED" });
  }

  console.log("ML Check...");
  const mlScore = await mlDetector(payload);
  console.log("ML Score:", mlScore);
  
  if (mlScore > 0.25) { 
    console.log(`ML BLOCKED (score: ${mlScore})`);
    await AttackLog.create({
      attackType: "SQL_INJECTION",
      payload: payload.substring(0, 500),
      confidenceScore: mlScore,
      severity: getSeverity(mlScore),
      detectedBy: "ML MODEL"
    });
    return res.status(403).json({ 
      result: "blocked", 
      detectedBy: "ML MODEL", 
      confidenceScore: mlScore 
    });
  }

  console.log("SAFE");
  next();
}

module.exports = sqlDetector;

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

  const isRuleBased = sqlRegexPatterns.some(regex => regex.test(normalizedPayload));
  
  console.log("ML Check...");
  const mlScore = await mlDetector(payload);
  console.log("ML Score:", mlScore);
  
  const isMlBased = mlScore > 0.25;

  if (isRuleBased || isMlBased) {
    const finalScore = isRuleBased ? Math.max(0.85, mlScore) : mlScore;
    
    const detectionMethods = [];
    if (isRuleBased) detectionMethods.push("RULE-BASED");
    if (isMlBased) detectionMethods.push("ML MODEL");
    const detectedByString = detectionMethods.join(" & ");

    console.log(`BLOCKED by: ${detectedByString} (Score: ${finalScore})`);

    await AttackLog.create({
      attackType: "SQL_INJECTION",
      payload: payload.substring(0, 500),
      confidenceScore: finalScore,
      severity: getSeverity(finalScore), 
      detectedBy: detectedByString
    });

    return res.status(403).json({ 
      result: "blocked", 
      detectedBy: detectedByString, 
      confidenceScore: finalScore 
    });
  }

  console.log("SAFE");
  next();
}

module.exports = sqlDetector;

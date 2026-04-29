const { sqlPatterns } = require("../utils/regexPatterns");
const AttackLog = require("../models/AttackLog");
const mlDetector = require("./mlDetector");

const getSeverity = (score) => {
  if (score >= 0.8) return "High";
  if (score >= 0.5) return "Medium";
  return "Low";
};

async function sqlDetector(req, res, next) {
  try {
    const payload =
      req.body?.input ||
      req.body?.query ||
      req.body?.sql ||
      JSON.stringify(req.body);

    if (!payload) return next();

    console.log("🔍 Payload:", payload.substring(0, 80));

    const normalizedPayload = payload.replace(/\/\*[\s\S]*?\*\//g, "");

    let maxWeight = 0;

    sqlPatterns.forEach(({ regex, weight }) => {
      if (regex.test(normalizedPayload)) {
        console.log("✅ Matched Pattern:", regex);
        maxWeight = Math.max(maxWeight, weight);
      }
    });

    const ruleScore = maxWeight;
    const isRuleBased = maxWeight > 0.9;

    console.log("📊 Rule Score (Max Weight):", ruleScore);

    const mlScore = await mlDetector(payload);
    console.log("🤖 ML Score:", mlScore);

    const isMlBased = mlScore > 0.3;

    let finalScore = (0.7 * ruleScore) + (0.3 * mlScore);

    if (isRuleBased && isMlBased) {
      finalScore = Math.max(finalScore, 0.85);
    }

    const isAttack = isRuleBased || isMlBased;

    if (isAttack) {
      let detectedBy = "";

      if (isRuleBased && isMlBased) {
        detectedBy = "HYBRID (RULE + ML)";
      } else if (isRuleBased) {
        detectedBy = "ML-BASED";
      } else {
        detectedBy = "RULE-BASED";
      }

      console.log(`BLOCKED by: ${detectedBy} | Score: ${finalScore}`);

      await AttackLog.create({
        attackType: "SQL_INJECTION",
        payload: payload.substring(0, 500),
        confidenceScore: finalScore,
        severity: getSeverity(finalScore),
        detectedBy: detectedBy
      });

      return res.status(403).json({
        result: "blocked",
        detectedBy,
        confidenceScore: finalScore
      });
    }

    console.log("✅ SAFE");
    next();

  } catch (err) {
    console.error("SQL Detector Error:", err);
    next();
  }
}

module.exports = sqlDetector;
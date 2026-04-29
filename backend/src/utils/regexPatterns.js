module.exports = {
  sqlPatterns: [
    // 🔥 HIGH RISK
    { regex: /\bUNION\b\s+(?:ALL\s+)?\bSELECT\b/i, weight: 1.0 },
    { regex: /\bSLEEP\s*\(/i, weight: 1.0 },
    { regex: /\bWAITFOR\s+DELAY\b/i, weight: 1.0 },
    { regex: /\bDROP\b/i, weight: 0.9 },
    { regex: /\bDELETE\b/i, weight: 0.9 },

    // ⚠️ MEDIUM RISK
    { regex: /(?:\b(?:OR|AND)\b)\s+['"]?.+['"]?\s*=\s*['"]?.+['"]?/i, weight: 0.7 },
    { regex: /;\s*(?:INSERT|UPDATE|EXEC|ALTER|CREATE)\b/i, weight: 0.7 },

    // ⚪ LOW RISK
    { regex: /\b0x[0-9a-fA-F]{10,}\b/i, weight: 0.5 },
    { regex: /\b(?:information_schema|mysql\.db|sqlite_master)\b/i, weight: 0.5 },
    { regex: /['"]\s*(?:--|#|\/\*)/, weight: 0.4 }
  ]
};
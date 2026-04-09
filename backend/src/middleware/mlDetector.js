const axios = require("axios");

module.exports = async function mlDetector(payload = "") {
  try {
    // Pre-processing: Neutralize inline comment obfuscation (e.g. U/**/NION)
    const normalized = payload.replace(/\/\*[\s\S]*?\*\//g, '');
    
    const features = [
      payload.length, // Keep original length to capture bloat
      (normalized.match(/\s/g) || []).length,
      (normalized.match(/'/g) || []).length,
      // Broadened to boolean logic operators
      (normalized.match(/\b(?:OR|AND)\b/gi) || []).length,
      // Broadened to major SQL execution tokens
      (normalized.match(/\b(?:UNION|SELECT|DROP|INSERT|UPDATE|DELETE|EXEC)\b/gi) || []).length,
      // Keep identifying comment markers
      (payload.match(/--|#|\/\*/g) || []).length
    ];

    const response = await axios.post("http://localhost:5000/predict", { features });

    return response.data.confidenceScore ?? 0.1;
  } catch (err) {
    console.error("ML detector error:", err.message);
    return 0.1; 
  }
};

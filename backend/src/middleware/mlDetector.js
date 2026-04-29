const axios = require("axios");

module.exports = async function mlDetector(payload = "") {
  try {
    const normalized = payload.replace(/\/\*[\s\S]*?\*\//g, "");

    const features = [
      payload.length,
      (normalized.match(/\s/g) || []).length,
      (normalized.match(/'/g) || []).length * 2,
      (normalized.match(/\b(?:OR|AND)\b/gi) || []).length * 3,
      (normalized.match(/\b(?:UNION|SELECT|DROP|INSERT|UPDATE|DELETE|EXEC|SLEEP)\b/gi) || []).length * 3,
      (payload.match(/--|#|\/\*/g) || []).length * 4
    ];

    console.log("📤 ML Features:", features);

    const response = await axios.post(
      "http://localhost:5000/predict",
      { features },
      { timeout: 3000 }
    );

    console.log("📥 ML Response:", response.data);

    return response.data.confidenceScore || 0.1;

  } catch (err) {
    console.error("❌ ML Error:", err.message);
    return 0.1; // fallback
  }
};
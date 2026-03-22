const axios = require("axios");

module.exports = async function mlDetector(payload = "") {
  try {
    const features = [
      payload.length,
      (payload.match(/\s/g) || []).length,
      (payload.match(/'/g) || []).length,
      (payload.match(/\bOR\b/gi) || []).length,
      (payload.match(/\bUNION\b/gi) || []).length,
      (payload.match(/--|#|\/\*/g) || []).length
    ];

    const response = await axios.post("http://localhost:5000/predict", { features });

    return response.data.confidenceScore ?? 0.1;
  } catch (err) {
    console.error("ML detector error:", err.message);
    return 0.1; 
  }
};

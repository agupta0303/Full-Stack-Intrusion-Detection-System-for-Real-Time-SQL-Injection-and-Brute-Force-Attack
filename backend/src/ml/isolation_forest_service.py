from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# =========================
# LOAD MODELS
# =========================
try:
    model = joblib.load("isolation_forest.pkl")
    print("✅ SQLi Model loaded")
except:
    print("⚠️ SQLi model missing - using fallback")
    model = None

# =========================
# SQLi PREDICTION
# =========================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features = np.array(data.get("features", [])).reshape(1, -1)

        print("📊 Received features:", features.tolist())

        # =========================
        # FALLBACK (IF MODEL MISSING)
        # =========================
        if model is None:
            quote_count = features[0][2] if len(features[0]) > 2 else 0
            keyword_count = features[0][4] if len(features[0]) > 4 else 0

            is_attack = quote_count > 0 or keyword_count > 0

            return jsonify({
                "anomaly": is_attack,
                "confidenceScore": 0.85 if is_attack else 0.1,
                "detectedBy": "Fallback"
            })

        # =========================
        # MODEL PREDICTION
        # =========================
        prediction = model.predict(features)[0]  # -1 anomaly, 1 normal
        raw_score = model.decision_function(features)[0]

        print(f"Raw Score: {raw_score}, Prediction: {prediction}")

        # =========================
        # 🔥 STRONG SCALING (IMPORTANT)
        # =========================
        confidence = 1 / (1 + np.exp(raw_score * 15))

        # 🔥 FORCE BOOST FOR ANOMALY
        if prediction == -1:
            confidence = max(confidence, 0.75)

        return jsonify({
            "anomaly": bool(prediction == -1),
            "confidenceScore": float(round(confidence, 3)),
            "detectedBy": "IsolationForest-ML"
        })

    except Exception as e:
        print("❌ ML ERROR:", str(e))
        return jsonify({
            "anomaly": True,
            "confidenceScore": 0.9,
            "detectedBy": "Error-Fallback"
        })


# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
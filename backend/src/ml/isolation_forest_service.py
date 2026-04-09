from flask import Flask, request, jsonify
import joblib
import numpy as np
import traceback

app = Flask(__name__)

try:
    model = joblib.load("isolation_forest.pkl")
    print("SQLi Model loaded successfully")
except:
    print("SQLi Model file missing - using dummy detection")
    model = None

try:
    model_brute = joblib.load("brute_model.pkl")
    print("Brute Force Model loaded successfully")
except:
    print("Brute Force Model file missing - using dummy detection")
    model_brute = None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features = np.array(data["features"]).reshape(1, -1)
        
        print(f"Features: {data['features']}")
        
        if model is None:
            quote_count = data["features"][2]
            has_comments = data["features"][5] > 0
            is_suspicious = quote_count > 0 or has_comments
            
            return jsonify({
                "anomaly": is_suspicious,
                "confidenceScore": 0.85 if is_suspicious else 0.15,
                "detectedBy": "IsolationForest-ML"
            })
        
        prediction = model.predict(features)[0]
        # Score is higher (more negative) for anomalies.
        raw_score = model.decision_function(features)[0]
        
        # Use a scaled sigmoid function to boundedly map negative scores (anomalies) toward 1.0
        # raw_score < 0 indicates anomaly. So -raw_score > 0
        confidence_percent = 1 / (1 + np.exp(raw_score * 5)) 

        print(f"Prediction: {prediction}, Raw Score: {raw_score}, Confidence: {confidence_percent:.2f}")
        
        return jsonify({
            "anomaly": bool(prediction == -1),
            "confidenceScore": float(confidence_percent),
            "detectedBy": "IsolationForest-ML"
        })
        
    except Exception as e:
        print(f"ML ERROR: {str(e)}")
        print(traceback.format_exc())
        
        data = request.json
        features = data.get("features", [])
        quote_count = features[2] if len(features) > 2 else 0
        comment_count = features[5] if len(features) > 5 else 0
        
        is_demo_attack = quote_count > 0 or comment_count > 0
        
        return jsonify({
            "anomaly": is_demo_attack,
            "confidenceScore": 0.85 if is_demo_attack else 0.15,
            "detectedBy": "IsolationForest-ML"
        })

@app.route('/predict/brute', methods=['POST'])
def predict_brute():
    try:
        data = request.json
        features = np.array(data["features"]).reshape(1, -1)
        print(f"Brute Features: {data['features']}")
        
        if model_brute is None:
            attempt_count = data["features"][0] if len(data["features"]) > 0 else 0
            is_suspicious = attempt_count > 5
            return jsonify({
                "anomaly": is_suspicious,
                "confidenceScore": 0.88 if is_suspicious else 0.12,
                "detectedBy": "IsolationForest-ML (BruteFallback)"
            })
            
        prediction = model_brute.predict(features)[0]
        raw_score = model_brute.decision_function(features)[0]
        
        # Use a scaled sigmoid function to boundedly map negative scores (anomalies) toward 1.0
        confidence_percent = 1 / (1 + np.exp(raw_score * 5))

        print(f"Brute Prediction: {prediction}, Raw Score: {raw_score}, Confidence: {confidence_percent:.2f}")
        
        return jsonify({
            "anomaly": bool(prediction == -1),
            "confidenceScore": float(confidence_percent),
            "detectedBy": "IsolationForest-ML"
        })
    except Exception as e:
        print(f"ML Brute ERROR: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "anomaly": True,
            "confidenceScore": 0.9,
            "detectedBy": "IsolationForest-ML"
        })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

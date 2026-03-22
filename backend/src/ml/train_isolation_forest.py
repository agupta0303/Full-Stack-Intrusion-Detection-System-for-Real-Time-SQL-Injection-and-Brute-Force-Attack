from sklearn.ensemble import IsolationForest
import joblib
import numpy as np

X_train = np.random.rand(500, 6)
model = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)
model.fit(X_train)
joblib.dump(model, "isolation_forest.pkl")
print("Isolation Forest model trained and saved successfully.")
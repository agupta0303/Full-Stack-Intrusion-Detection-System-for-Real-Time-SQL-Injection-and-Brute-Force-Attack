from sklearn.ensemble import IsolationForest
import joblib
import numpy as np

# Train SQLi model (6 features)
X_train_sql = np.random.rand(500, 6)
model_sql = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)
model_sql.fit(X_train_sql)
joblib.dump(model_sql, "isolation_forest.pkl")
print("Isolation Forest model for SQLi trained and saved successfully.")

# Train Brute Force model (4 features)
X_train_brute = np.random.rand(500, 4)
model_brute = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)
model_brute.fit(X_train_brute)
joblib.dump(model_brute, "brute_model.pkl")
print("Isolation Forest model for Brute Force trained and saved successfully.")
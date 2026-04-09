from sklearn.ensemble import IsolationForest
import joblib
import numpy as np

# --- 1. Train SQLi model (6 features) ---
# Features: [length, spaces, quotes, ORs, UNIONs, comments]
# Normal data (95%): short/medium length, some spaces, few quotes, no OR/UNION/comments
normal_sql = np.column_stack([
    np.random.randint(5, 50, 950),          # length
    np.random.randint(0, 5, 950),           # spaces
    np.random.poisson(0.1, 950),            # quotes (rare)
    np.zeros(950),                          # ORs
    np.zeros(950),                          # UNIONs
    np.zeros(950)                           # comments
])

# Attack data (5%): longer, many spaces/quotes, ORs, UNIONs, comments
attack_sql = np.column_stack([
    np.random.randint(20, 150, 50),         # length
    np.random.randint(3, 15, 50),           # spaces
    np.random.randint(1, 6, 50),            # quotes
    np.random.randint(0, 3, 50),            # ORs
    np.random.randint(0, 2, 50),            # UNIONs
    np.random.randint(0, 2, 50)             # comments
])

X_train_sql = np.vstack([normal_sql, attack_sql])

model_sql = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)
model_sql.fit(X_train_sql)
joblib.dump(model_sql, "isolation_forest.pkl")
print("Isolation Forest model for SQLi trained on synthetic data and saved successfully.")

# --- 2. Train Brute Force model (4 features) ---
# Features: [attemptCount, timeSinceFirstMs, username.length, static 1.0]
# Normal data (95%): low attempts, longer times, normal username lengths
normal_brute = np.column_stack([
    np.random.randint(1, 3, 950),                 # attemptCount (1-2)
    np.random.uniform(5000, 60000, 950),          # timeSinceFirst (5s - 60s)
    np.random.randint(4, 20, 950),                # username length
    np.ones(950)                                  # static 1.0
])

# Attack data (5%): high attempts, very short time window
attack_brute = np.column_stack([
    np.random.randint(4, 15, 50),                 # attemptCount (4+)
    np.random.uniform(0, 2000, 50),               # timeSinceFirst (0-2s, rapid fire)
    np.random.randint(4, 20, 50),                 # username length
    np.ones(50)                                   # static 1.0
])

X_train_brute = np.vstack([normal_brute, attack_brute])

model_brute = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)
model_brute.fit(X_train_brute)
joblib.dump(model_brute, "brute_model.pkl")
print("Isolation Forest model for Brute Force trained on synthetic data and saved successfully.")
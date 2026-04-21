import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

sql_path = os.path.join(BASE_DIR, "data", "csic_database.csv")
brute_path = os.path.join(BASE_DIR, "data", "brute_force_dataset.csv")

df_sql = pd.read_csv(sql_path)
df_brute = pd.read_csv(brute_path)

df_sql = df_sql.dropna()
df_brute = df_brute.dropna()

def extract_sql_features(payload):
    payload = str(payload).lower()

    length = len(payload)
    spaces = payload.count(" ")
    quotes = payload.count("'") + payload.count('"')
    ors = len(re.findall(r"\bor\b", payload))
    unions = len(re.findall(r"\bunion\b", payload))
    comments = payload.count("--") + payload.count("#")

    return [length, spaces, quotes, ors, unions, comments]

def extract_brute_features(row):
    return [
        row["attempt_count"],
        row["time_since_first"],
        len(row["username"]),
        1.0
    ]
print("🔍 SQL Columns:", df_sql.columns)

sql_features = []

for _, row in df_sql.iterrows():
    payload = str(row.get("content", ""))  
    sql_features.append(extract_sql_features(payload))

if len(sql_features) == 0:
    raise ValueError("No SQL features extracted — check CSIC column")

X_train_sql = np.array(sql_features)

model_sql = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)

model_sql.fit(X_train_sql)

joblib.dump(model_sql, os.path.join(BASE_DIR, "isolation_forest.pkl"))

print("SQL Injection model trained successfully")
print("Brute Columns:", df_brute.columns)

brute_features = []

for _, row in df_brute.iterrows():
    brute_features.append(extract_brute_features(row))

if len(brute_features) == 0:
    raise ValueError("No brute force data found")

X_train_brute = np.array(brute_features)

model_brute = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)

model_brute.fit(X_train_brute)

joblib.dump(model_brute, os.path.join(BASE_DIR, "brute_model.pkl"))

print("Brute Force model trained successfully")
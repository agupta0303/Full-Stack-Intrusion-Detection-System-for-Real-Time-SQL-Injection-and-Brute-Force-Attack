import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

NUM_USERS = 1000        
NORMAL_RATIO = 0.9       
ATTACK_RATIO = 0.1       

def random_username():
    return "user_" + str(random.randint(1000, 9999))

def generate_normal_user(username):
    data = []
    base_time = datetime.now()

    attempts = random.randint(1, 3)

    for i in range(attempts):
        timestamp = base_time + timedelta(seconds=random.randint(10, 300))
        success = 1 if i == attempts - 1 else 0

        data.append({
            "username": username,
            "timestamp": timestamp,
            "attempt_count": i + 1,
            "time_since_first": (timestamp - base_time).total_seconds(),
            "success": success,
            "label": "normal"
        })

    return data


def generate_attacker(username):
    data = []
    base_time = datetime.now()

    attempts = random.randint(6, 15)

    for i in range(attempts):
        timestamp = base_time + timedelta(seconds=random.uniform(0, 2))
        success = 0

        data.append({
            "username": username,
            "timestamp": timestamp,
            "attempt_count": i + 1,
            "time_since_first": (timestamp - base_time).total_seconds(),
            "success": success,
            "label": "brute_force"
        })

    return data

dataset = []

for _ in range(int(NUM_USERS * NORMAL_RATIO)):
    dataset.extend(generate_normal_user(random_username()))

for _ in range(int(NUM_USERS * ATTACK_RATIO)):
    dataset.extend(generate_attacker(random_username()))

df = pd.DataFrame(dataset)

# Shuffle
df = df.sample(frac=1).reset_index(drop=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(BASE_DIR, "data", "brute_force_dataset.csv")

df.to_csv(output_path, index=False)

print("Dataset generated successfully!")
print("Saved at:", output_path)
print("Total rows:", len(df))
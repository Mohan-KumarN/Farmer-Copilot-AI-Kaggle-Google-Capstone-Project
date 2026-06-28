import os
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

def generate_synthetic_crop_data():
    print("Generating synthetic crop recommendation dataset...")
    np.random.seed(42)
    
    # Crop profiles: [N, P, K, temp, humidity, pH, rainfall]
    # N, P, K ranges, temp, humidity, pH, rainfall
    crop_profiles = {
        "rice":        {"N": (70, 95),  "P": (35, 55), "K": (35, 45), "temp": (20, 30), "hum": (80, 95), "ph": (5.5, 6.8), "rain": (180, 280)},
        "maize":       {"N": (50, 80),  "P": (30, 50), "K": (15, 25), "temp": (18, 27), "hum": (55, 75), "ph": (5.8, 7.0), "rain": (60, 110)},
        "chickpea":    {"N": (20, 40),  "P": (55, 75), "K": (75, 85), "temp": (15, 24), "hum": (15, 30), "ph": (6.0, 7.5), "rain": (35, 70)},
        "cotton":      {"N": (70, 100), "P": (35, 55), "K": (15, 25), "temp": (22, 32), "hum": (60, 80), "ph": (5.8, 7.5), "rain": (70, 120)},
        "groundnut":   {"N": (20, 40),  "P": (35, 50), "K": (20, 35), "temp": (20, 30), "hum": (50, 70), "ph": (5.5, 6.5), "rain": (50, 90)},
        "millets":     {"N": (30, 50),  "P": (15, 30), "K": (15, 25), "temp": (25, 35), "hum": (30, 50), "ph": (6.0, 8.0), "rain": (30, 60)},
        "sorghum":     {"N": (40, 60),  "P": (20, 35), "K": (20, 30), "temp": (24, 32), "hum": (40, 60), "ph": (6.0, 7.5), "rain": (40, 80)},
        "sugarcane":   {"N": (90, 130), "P": (40, 60), "K": (40, 60), "temp": (25, 35), "hum": (60, 85), "ph": (6.0, 7.5), "rain": (120, 200)},
        "wheat":       {"N": (60, 90),  "P": (40, 60), "K": (30, 45), "temp": (12, 22), "hum": (45, 65), "ph": (6.0, 7.2), "rain": (50, 90)},
        "mustard":     {"N": (40, 70),  "P": (30, 45), "K": (20, 35), "temp": (15, 25), "hum": (50, 70), "ph": (6.0, 7.0), "rain": (30, 60)}
    }
    
    data = []
    rows_per_crop = 150
    
    for crop, ranges in crop_profiles.items():
        for _ in range(rows_per_crop):
            n = np.random.uniform(*ranges["N"])
            p = np.random.uniform(*ranges["P"])
            k = np.random.uniform(*ranges["K"])
            temp = np.random.uniform(*ranges["temp"])
            hum = np.random.uniform(*ranges["hum"])
            ph = np.random.uniform(*ranges["ph"])
            rain = np.random.uniform(*ranges["rain"])
            
            # Add some slight noise/variation
            n += np.random.normal(0, 3)
            p += np.random.normal(0, 2)
            k += np.random.normal(0, 2)
            temp += np.random.normal(0, 1)
            hum += np.random.normal(0, 2)
            ph += np.random.normal(0, 0.2)
            rain += np.random.normal(0, 5)
            
            data.append([max(0, n), max(0, p), max(0, k), max(5, temp), min(100, max(0, hum)), max(3, min(10, ph)), max(0, rain), crop])
            
    df = pd.DataFrame(data, columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "label"])
    
    # Save dataset to CSV
    dataset_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")
    os.makedirs(dataset_dir, exist_ok=True)
    df.to_csv(os.path.join(dataset_dir, "crop_recommendation.csv"), index=False)
    print(f"Dataset generated and saved. Shape: {df.shape}")
    return df

def train_model():
    df = generate_synthetic_crop_data()
    
    X = df[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]]
    y = df["label"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained. Validation Accuracy: {accuracy:.4f}")
    
    # Save the model and feature columns
    model_dir = os.path.dirname(__file__)
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "crop_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump({
            "model": model,
            "features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
        }, f)
        
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()

import os
import pickle
import numpy as np

# Path to the serialized model
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "crop_model")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_model.pkl")

model_cache = None

def get_model():
    global model_cache
    if model_cache is not None:
        return model_cache
    
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Running training script...")
        from backend.ml.crop_model.train_crop_model import train_model
        train_model()
        
    with open(MODEL_PATH, "rb") as f:
        model_cache = pickle.load(f)
        
    return model_cache

def predict_crop(n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float):
    """
    Predicts the recommended crop and returns the top 3 matches with confidence scores.
    """
    model_data = get_model()
    model = model_data["model"]
    
    # Input vector: N, P, K, temp, humidity, pH, rainfall
    features = np.array([[n, p, k, temp, humidity, ph, rainfall]])
    
    # Get top 3 predictions
    classes = model.classes_
    probabilities = model.predict_proba(features)[0]
    
    # Sort predictions by probability descending
    top_indices = np.argsort(probabilities)[::-1][:3]
    
    recommendations = []
    for idx in top_indices:
        recommendations.append({
            "crop": str(classes[idx]).capitalize(),
            "confidence": float(probabilities[idx])
        })
        
    return recommendations

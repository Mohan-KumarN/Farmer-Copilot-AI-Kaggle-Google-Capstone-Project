from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import datetime
from typing import List, Optional

from backend.database.db import engine, Base, get_db
from backend.models import db_models as models
from backend.services import (
    crop_service,
    disease_service,
    weather_service,
    market_service,
    scheme_service,
    ai_service
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farmer Copilot API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL e.g., http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Farmer Copilot API!"}

# --- User & Profile Endpoints ---

@app.post("/api/auth/register")
def register_user(name: str = Form(...), phone: str = Form(...), email: Optional[str] = Form(None), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.phone == phone).first()
    if db_user:
        return db_user # Already registered, return user
        
    new_user = models.User(name=name, phone=phone, email=email, preferred_language="English")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/profile")
def create_or_update_profile(
    user_id: int = Form(...),
    location: str = Form(...),
    soil_type: str = Form(...),
    size: float = Form(...),
    water_source: str = Form(...),
    preferred_language: str = Form("English"),
    crop_history: str = Form(""),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update language
    user.preferred_language = preferred_language
    
    # Check if farm exists
    farm = db.query(models.Farm).filter(models.Farm.user_id == user_id).first()
    if not farm:
        farm = models.Farm(user_id=user_id, location=location, soil_type=soil_type, size=size, water_source=water_source)
        db.add(farm)
    else:
        farm.location = location
        farm.soil_type = soil_type
        farm.size = size
        farm.water_source = water_source
        
    # Check if crop exists, create or update
    if crop_history:
        crop = db.query(models.Crop).filter(models.Crop.user_id == user_id).first()
        if not crop:
            crop = models.Crop(user_id=user_id, crop_name=crop_history, season="Kharif", growth_stage="Vegetative")
            db.add(crop)
        else:
            crop.crop_name = crop_history
            
    db.commit()
    db.refresh(user)
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "language": user.preferred_language
        },
        "farm": {
            "location": farm.location,
            "soil_type": farm.soil_type,
            "size": farm.size,
            "water_source": farm.water_source
        }
    }

@app.get("/api/auth/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    farm = db.query(models.Farm).filter(models.Farm.user_id == user_id).first()
    crop = db.query(models.Crop).filter(models.Crop.user_id == user_id).first()
    
    return {
        "user": user,
        "farm": farm,
        "crop": crop
    }

# --- Dashboard Summary Endpoint ---

@app.get("/api/dashboard/{user_id}")
def get_dashboard_summary(user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch user, farm, and crop
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        # Create a mock default user if not found for demo simplicity
        user = models.User(name="Ravi Kumar", phone="9876543210", preferred_language="English")
        db.add(user)
        db.commit()
        db.refresh(user)
        
        farm = models.Farm(user_id=user.id, location="Mandya, Karnataka", soil_type="Red Sandy Loam", size=2.5, water_source="Borewell")
        crop = models.Crop(user_id=user.id, crop_name="Tomato", season="Kharif", growth_stage="Flowering")
        db.add(farm)
        db.add(crop)
        db.commit()
        
    farm = db.query(models.Farm).filter(models.Farm.user_id == user.id).first()
    crop = db.query(models.Crop).filter(models.Crop.user_id == user.id).first()
    
    location = farm.location if farm else "Mandya, Karnataka"
    crop_name = crop.crop_name if crop else "Tomato"
    growth_stage = crop.growth_stage if crop else "Flowering"
    
    # 2. Get Weather Advisory
    weather_data = weather_service.get_weather_data(location)
    
    # Quick weather summary advisory
    adv_res = weather_service.generate_agricultural_advisory(location, crop_name, growth_stage)
    
    # 3. Get Live prices for top 2 commodities
    market_prices = market_service.get_live_prices()[:3]
    
    # 4. Create AI recommendation
    rec_type = "Irrigation"
    if weather_data["rain_chance"] > 75:
        recommendation_msg = "Delay irrigation today. High chance of heavy rainfall. Check drainage lines."
    elif weather_data["temperature"] > 35:
        recommendation_msg = f"Temperature is high ({weather_data['temperature']}°C). Schedule drip irrigation early morning to prevent evaporation."
        rec_type = "Watering"
    else:
        recommendation_msg = f"Optimal weather conditions for {crop_name}. Keep soil moist at {growth_stage} stage."
        rec_type = "General"
        
    # Save recommendation to DB
    new_rec = models.Recommendation(user_id=user.id, type=rec_type, content=recommendation_msg)
    db.add(new_rec)
    db.commit()
    
    # 5. Build dashboard payload
    return {
        "farmer_name": user.name,
        "location": location,
        "crop": crop_name,
        "growth_stage": growth_stage,
        "weather": weather_data,
        "ai_recommendation": {
            "type": rec_type,
            "message": recommendation_msg,
            "detailed_advisory": adv_res["advisory"]
        },
        "market_prices": market_prices,
        "upcoming_tasks": [
            {"id": 1, "task": "Check bottom leaves for fungal spots", "due": "Today", "completed": False},
            {"id": 2, "task": "Clean water channel lines", "due": "Tomorrow", "completed": False},
            {"id": 3, "task": "Harvest crop batch", "due": "In 5 days", "completed": False} if growth_stage == "Maturity" else {"id": 3, "task": "Apply urea top dressing", "due": "In 3 days", "completed": False}
        ]
    }

# --- Crop Recommendation Endpoint ---

@app.post("/api/crop-recommendation")
def get_crop_recommendation(
    n: float = Form(...),
    p: float = Form(...),
    k: float = Form(...),
    temp: float = Form(...),
    humidity: float = Form(...),
    ph: float = Form(...),
    rainfall: float = Form(...)
):
    try:
        recommendations = crop_service.predict_crop(n, p, k, temp, humidity, ph, rainfall)
        return {
            "status": "success",
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation failed: {str(e)}")

# --- Disease Scanner Endpoint ---

@app.post("/api/disease-detection")
def detect_disease(
    user_id: int = Form(...),
    crop_context: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Read file bytes
        file_bytes = file.file.read()
        
        # Call vision diagnosis service
        diagnosis = disease_service.diagnose_leaf_image(file_bytes, file.filename, crop_context)
        
        # Save to DB
        db_disease = models.Disease(
            user_id=user_id,
            image_url=file.filename,
            prediction=diagnosis["prediction"],
            confidence=diagnosis["confidence"],
            solution=diagnosis["solution"]
        )
        db.add(db_disease)
        db.commit()
        
        return {
            "status": "success",
            "diagnosis": {
                "crop": diagnosis["crop"],
                "prediction": diagnosis["prediction"],
                "confidence": diagnosis["confidence"],
                "explanation": diagnosis.get("explanation", ""),
                "solution": diagnosis["solution"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease detection failed: {str(e)}")

# --- Weather Advisory Endpoint ---

@app.get("/api/weather/advisory")
def get_weather_advisory(location: str, crop_name: str, growth_stage: str):
    try:
        res = weather_service.generate_agricultural_advisory(location, crop_name, growth_stage)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Market Price Advisory Endpoint ---

@app.get("/api/market/prices")
def get_market_prices():
    try:
        prices = market_service.get_live_prices()
        return {"prices": prices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/advisory")
def get_market_advisory(crop_name: str, price: float, trend: str):
    try:
        advisory = market_service.get_market_advisory(crop_name, price, trend)
        return {"advisory": advisory}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Government Schemes RAG Endpoint ---

@app.post("/api/schemes/search")
def search_welfare_schemes(
    query: str = Form(...),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    profile_summary = ""
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            farm = db.query(models.Farm).filter(models.Farm.user_id == user_id).first()
            crop = db.query(models.Crop).filter(models.Crop.user_id == user_id).first()
            
            profile_summary = (
                f"- Farmer Name: {user.name}\n"
                f"- Location: {farm.location if farm else 'Unknown'}\n"
                f"- Farm Size: {farm.size if farm else 'Unknown'} acres\n"
                f"- Soil Type: {farm.soil_type if farm else 'Unknown'}\n"
                f"- Current Crop: {crop.crop_name if crop else 'Unknown'}"
            )
            
    try:
        advisory = scheme_service.search_schemes(query, profile_summary)
        return {"response": advisory}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- AI General Chat Endpoint ---

@app.post("/api/chat")
def post_chat_message(
    user_id: int = Form(...),
    message: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        # Fetch profile context
        farm = db.query(models.Farm).filter(models.Farm.user_id == user_id).first()
        crop = db.query(models.Crop).filter(models.Crop.user_id == user_id).first()
        
        context = ""
        if farm and crop:
            context = f"(Farmer growing {crop.crop_name} in {farm.location} on {farm.size} acres of {farm.soil_type} soil. Crop growth stage: {crop.growth_stage})"
            
        # Get past chat history limit to 4 messages for context
        history = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id).order_by(models.ChatHistory.timestamp.desc()).limit(4).all()
        history_text = ""
        for h in reversed(history):
            history_text += f"{h.role.capitalize()}: {h.message}\n"
            
        full_prompt = f"""
        Farmer Context: {context}
        
        Chat History:
        {history_text}
        Farmer: "{message}"
        
        Provide a helpful agricultural advisory response.
        """
        
        # Save user message
        db_msg_user = models.ChatHistory(user_id=user_id, role="user", message=message)
        db.add(db_msg_user)
        
        ai_response = ai_service.get_llm_response(full_prompt)
        
        # Save AI response
        db_msg_ai = models.ChatHistory(user_id=user_id, role="assistant", message=ai_response)
        db.add(db_msg_ai)
        db.commit()
        
        return {
            "status": "success",
            "response": ai_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history/{user_id}")
def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    history = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id).order_by(models.ChatHistory.timestamp.asc()).all()
    return history

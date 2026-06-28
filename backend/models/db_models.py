from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from backend.database.db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    preferred_language = Column(String, default="English")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    farms = relationship("Farm", back_populates="owner")
    crops = relationship("Crop", back_populates="owner")
    chats = relationship("ChatHistory", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    diseases = relationship("Disease", back_populates="user")

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    location = Column(String, nullable=False)  # District, State or GPS coords
    soil_type = Column(String, nullable=False)  # Clay, Sandy, Loamy, Black, etc.
    size = Column(Float, nullable=False)  # in acres
    water_source = Column(String, nullable=True)  # Borewell, Canal, Rainfed, etc.
    
    owner = relationship("User", back_populates="farms")

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crop_name = Column(String, nullable=False)
    season = Column(String, nullable=False)  # Kharif, Rabi, Zaid
    growth_stage = Column(String, nullable=False)  # Seedling, Vegetative, Flowering, Maturity
    planted_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="crops")

class Disease(Base):
    __tablename__ = "diseases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String, nullable=True)
    prediction = Column(String, nullable=False)  # Diagnosed disease name
    confidence = Column(Float, nullable=False)  # Confidence score 0.0 to 1.0
    solution = Column(Text, nullable=False)  # Spray dosage, preventions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="diseases")

class Weather(Base):
    __tablename__ = "weather"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    rain_chance = Column(Float)  # Percentage (e.g. 80.0)
    wind_speed = Column(Float, default=0.0)
    forecast_summary = Column(String, nullable=True)

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)  # Crop, Irrigation, Fertilizer, Pest, Weather
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="recommendations")

class MarketPrice(Base):
    __tablename__ = "market_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String, index=True, nullable=False)
    market_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)  # in INR per quintal/kg
    trend = Column(String, default="Stable")  # Up, Down, Stable
    date = Column(DateTime, default=datetime.datetime.utcnow)

class Scheme(Base):
    __tablename__ = "schemes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    eligibility = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=True)
    application_link = Column(String, nullable=True)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, nullable=False)  # user or assistant
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="chats")

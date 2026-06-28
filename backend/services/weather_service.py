import requests
from backend.utils import config
from backend.services.ai_service import get_llm_response

# Indian agricultural regional coordinates for simulation
REGIONS = {
    "north": {"temp": 28, "humidity": 65, "rain_chance": 20, "wind": 12, "desc": "Partly Cloudy"}, # Punjab/Haryana
    "south": {"temp": 32, "humidity": 80, "rain_chance": 85, "wind": 18, "desc": "Thunderstorms expected"}, # Karnataka/AP
    "west": {"temp": 35, "humidity": 45, "rain_chance": 10, "wind": 15, "desc": "Dry and Sunny"}, # Maharashtra/Gujarat
    "east": {"temp": 30, "humidity": 85, "rain_chance": 90, "wind": 20, "desc": "Heavy Monsoonal Rains"} # West Bengal/Assam
}

def get_simulated_weather(location: str):
    """
    Returns realistic simulated weather data based on location text
    """
    loc_lower = location.lower()
    region_data = REGIONS["south"]  # Default
    
    if any(k in loc_lower for k in ["punjab", "haryana", "delhi", "bhatinda", "ludhiana", "north"]):
        region_data = REGIONS["north"]
    elif any(k in loc_lower for k in ["maharashtra", "gujarat", "pune", "nasik", "rajkot", "west"]):
        region_data = REGIONS["west"]
    elif any(k in loc_lower for k in ["bengal", "assam", "bihar", "east"]):
        region_data = REGIONS["east"]
    
    import random
    # Add a bit of daily fluctuation
    return {
        "temperature": round(region_data["temp"] + random.uniform(-2, 2), 1),
        "humidity": int(min(100, max(10, region_data["humidity"] + random.uniform(-5, 5)))),
        "rain_chance": int(min(100, max(0, region_data["rain_chance"] + random.uniform(-10, 10)))),
        "wind_speed": round(region_data["wind"] + random.uniform(-3, 3), 1),
        "condition": region_data["desc"]
    }

def get_weather_data(location: str = "Mandya, Karnataka"):
    """
    Fetches real weather data or falls back to simulation.
    """
    if config.WEATHER_API_KEY:
        try:
            # Call OpenWeatherMap Geo API to resolve location
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={config.WEATHER_API_KEY}"
            geo_res = requests.get(geo_url, timeout=5).json()
            
            if geo_res:
                lat, lon = geo_res[0]["lat"], geo_res[0]["lon"]
                weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={config.WEATHER_API_KEY}"
                w_res = requests.get(weather_url, timeout=5).json()
                
                # Fetch 3-hour forecast for rain probability
                forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&appid={config.WEATHER_API_KEY}"
                f_res = requests.get(forecast_url, timeout=5).json()
                
                rain_chance = 0
                if "list" in f_res and len(f_res["list"]) > 0:
                    # check first few intervals
                    pop_values = [item.get("pop", 0) for item in f_res["list"][:3]]
                    rain_chance = int(max(pop_values) * 100) if pop_values else 0
                
                return {
                    "temperature": w_res["main"]["temp"],
                    "humidity": w_res["main"]["humidity"],
                    "rain_chance": rain_chance if rain_chance > 0 else (80 if "rain" in w_res else 10),
                    "wind_speed": w_res["wind"]["speed"] * 3.6, # Convert m/s to km/h
                    "condition": w_res["weather"][0]["description"].capitalize()
                }
        except Exception as e:
            print(f"Error fetching OpenWeather data: {e}. Falling back to simulation.")
            
    return get_simulated_weather(location)

def generate_agricultural_advisory(location: str, crop_name: str, growth_stage: str):
    """
    Generates a crop-specific weather advisory using GPT/Gemini or our rule-based advisor.
    """
    w = get_weather_data(location)
    
    prompt = f"""
    Weather Forecast for {location}:
    - Temperature: {w['temperature']}°C
    - Humidity: {w['humidity']}%
    - Rain Probability: {w['rain_chance']}%
    - Wind Speed: {w['wind_speed']} km/h
    - Condition: {w['condition']}
    
    Crop: {crop_name}
    Growth Stage: {growth_stage}
    
    Based on this weather, provide:
    1. Irrigation Advice (e.g., skip, irrigate, delay)
    2. Fertilizer Timing advice
    3. Pesticide Spraying suitability
    4. Harvest Advisory (if in maturity stage)
    5. Key risk level (Low/Medium/High)
    6. Practical farmer warning/action items for today and the next 3 days.
    """
    
    system_prompt = """
    You are an expert plant pathologist and agronomist. 
    Translate weather parameters into direct agricultural warnings.
    Instead of saying "Rain 80%", tell them "Avoid spraying pesticides today as rain is highly likely. Shift fertilizer application to tomorrow."
    """
    
    advisory = get_llm_response(prompt, system_instruction=system_prompt)
    
    return {
        "weather": w,
        "advisory": advisory
    }

import random
from datetime import datetime, timedelta
from backend.services.ai_service import get_llm_response

# Reference baseline mandi prices in INR per Quintal (100 kg)
COMMODITY_BASES = {
    "tomato": {"base": 2200, "mandi": "Kolar Mandi (Karnataka)", "trend": "Down", "volatility": 300},
    "onion": {"base": 1800, "mandi": "Lasalgaon Mandi (Maharashtra)", "trend": "Up", "volatility": 150},
    "paddy (rice)": {"base": 2183, "mandi": "Guntur Mandi (Andhra Pradesh)", "trend": "Stable", "volatility": 50},
    "cotton": {"base": 7000, "mandi": "Rajkot Mandi (Gujarat)", "trend": "Up", "volatility": 400},
    "potato": {"base": 1200, "mandi": "Agra Mandi (Uttar Pradesh)", "trend": "Stable", "volatility": 80}
}

def get_live_prices():
    """
    Simulates live mandi prices with daily variations.
    """
    random.seed(datetime.now().day) # Consistent prices per day
    prices = []
    
    for crop, data in COMMODITY_BASES.items():
        change = random.uniform(-data["volatility"], data["volatility"])
        current_price = round(data["base"] + change, 2)
        price_diff = change
        percent_change = round((price_diff / data["base"]) * 100, 2)
        
        # Determine trend arrow
        trend = "Stable"
        if percent_change > 1.0:
            trend = "Up"
        elif percent_change < -1.0:
            trend = "Down"
            
        prices.append({
            "crop": crop.capitalize(),
            "mandi": data["mandi"],
            "price_per_quintal": current_price,
            "change_pct": percent_change,
            "trend": trend,
            "date": datetime.now().strftime("%Y-%m-%d")
        })
        
    return prices

def get_market_advisory(crop_name: str, current_price: float, trend: str):
    """
    Asks the AI copilot whether the farmer should sell today or wait.
    """
    prompt = f"""
    Crop: {crop_name}
    Current Mandi Price: ₹{current_price} per Quintal (100 kg)
    Recent Mandi Trend: {trend}
    
    Based on this information and typical Indian market dynamics for {crop_name}, provide:
    1. Recommendation: "Sell Today" or "Wait / Hold"
    2. Expected price trend for the next 2-3 weeks (e.g. increase due to festivals, decrease due to bumper arrivals)
    3. Selling tips (e.g. ensure moisture content is below 12%, grade by size for better price)
    Keep the explanation brief, actionable, and formatted in clean markdown.
    """
    
    system_prompt = """
    You are a commodity market expert specializing in Indian agriculture. 
    Analyze crop price trends and give clear, direct advice on whether to sell now or wait, explaining why in simple terms.
    """
    
    advisory = get_llm_response(prompt, system_instruction=system_prompt)
    return advisory

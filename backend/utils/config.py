import os
from dotenv import load_dotenv

# Load .env file from the backend folder
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")  # Or fallback to free API
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./farmer_copilot.db")

# Default values if keys aren't set
IS_PRODUCTION = os.getenv("ENV", "development") == "production"

import os
from dotenv import load_dotenv

SARVAM_BASE_URL = "https://api.sarvam.ai/v1"

def load_env():
    # Load from the correct local working directory
    load_dotenv(dotenv_path=r".env")

def get_sarvam_api_key() -> str:
    load_env()
    api_key = os.getenv("SERVAMAI_API_KEY")
    if not api_key:
        raise ValueError("SERVAMAI_API_KEY is not set in the .env file")
    return api_key

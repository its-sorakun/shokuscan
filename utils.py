import os
from dotenv import load_dotenv
from openai import OpenAI

SARVAM_BASE_URL = "https://api.sarvam.ai/v1"

def load_env():
    load_dotenv(dotenv_path=r"D:\AiTools\.env")

def get_openai_client() -> OpenAI:
    load_env()
    api_key = os.getenv("SERVAMAI_API_KEY")
    return OpenAI(api_key=api_key, base_url=SARVAM_BASE_URL)

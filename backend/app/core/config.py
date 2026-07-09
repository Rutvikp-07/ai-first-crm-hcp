import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve the backend root directory (where .env is located)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from the .env file in the backend root
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    """
    Application settings loaded from environment variables.
    """
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://root:password@localhost:3306/ai_first_crm"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

settings = Settings()

from typing import List
from pathlib import Path
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

# Project root (AI_Voice_Agent) so we can always find the root .env
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App Settings
    APP_NAME: str = "VoiceAI Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET"),
    )
    ALGORITHM: str = Field(
        default="HS256",
        validation_alias=AliasChoices("ALGORITHM", "JWT_ALGORITHM"),
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "postgresql://voice_agent_db_user:mNLgI4lAgNHtpeETyjU13bpaGxzARiFy@dpg-d4jj5i2li9vc738gucl0-a/voice_agent_db"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_ORG_ID: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"  # faster default for responsiveness
    OPENAI_TTS_VOICE: str = "nova"
    
    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    TWILIO_WEBHOOK_URL: str = ""

    # Vonage Voice
    VONAGE_API_KEY: str = ""
    VONAGE_API_SECRET: str = ""
    VONAGE_APPLICATION_ID: str = ""
    VONAGE_PRIVATE_KEY_PATH: str = ""
    VONAGE_PRIVATE_KEY: str = ""
    VONAGE_VOICE_WEBHOOK_BASE: str = ""
    
    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = Field(
        default="voiceai-storage",
        validation_alias=AliasChoices("AWS_S3_BUCKET", "AWS_BUCKET_NAME"),
    )
    AWS_REGION: str = "us-east-1"
    
    # SendGrid
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@voiceai.app"
    
    # Redis (optional)
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        validation_alias=AliasChoices("REDIS_URL", "REDIS_BROKER_URL", "REDIS_RESULT_BACKEND"),
    )

    # Logging
    LOG_LEVEL: str = Field(default="INFO")
    
    # Stripe
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt", ".csv"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Database startup behavior
    DB_CREATE_SCHEMA_ON_STARTUP: bool = False
    SQLALCHEMY_ECHO: bool = False
    DB_CONNECT_TIMEOUT: int = 3  # seconds
    
    model_config = SettingsConfigDict(
        # Always load the root-level .env regardless of the current working directory
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()

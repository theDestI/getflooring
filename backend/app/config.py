from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str
    supabase_key: str  # Service role key for backend

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # PDF Generation
    pdf_storage_bucket: str = "generated-pdfs"

    # HubSpot (optional)
    hubspot_client_id: str | None = None
    hubspot_client_secret: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()

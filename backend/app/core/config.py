from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Voyage AI"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str | None = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "voyage_user"
    POSTGRES_PASSWORD: str = "voyage_password"
    POSTGRES_DB: str = "voyage_db"
    POSTGRES_PORT: str = "5432"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            uri = self.DATABASE_URL
            if uri.startswith("postgres://"):
                uri = uri.replace("postgres://", "postgresql://", 1)
            return uri
        from pathlib import Path
        db_path = Path(__file__).resolve().parent.parent.parent / "voyage.db"
        return f"sqlite:///{db_path.as_posix()}"

    # JWT
    SECRET_KEY: str = "secret-key-replace-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # API Keys
    GEMINI_API_KEY: str = ""

    # Email / SMTP & Cloud APIs
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: str | None = None
    EMAILS_FROM_NAME: str = "Voyage AI"
    BREVO_API_KEY: str | None = None
    RESEND_API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()

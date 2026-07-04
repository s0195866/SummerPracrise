"""Конфигурация приложения.

Все настройки берутся из переменных окружения (см. `.env.example`).
Используется pydantic-settings v2 — значения кэшируются, валидируются
и доступны через синглтон `settings`.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки приложения.

    Загружаются из переменных окружения или файла `.env`.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Приложение ---
    app_name: str = "Summer Practice — Internet Shop API"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, description="Режим отладки")

    # --- База данных PostgreSQL ---
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "summer_practice"
    db_user: str = "postgres"
    db_password: str = "postgres"

    # --- JWT-авторизация ---
    # Внимание: в production значение должно задаваться через env.
    jwt_secret: str = "summer-practice-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 часа

    # --- Бизнес-правила ---
    regular_customer_threshold: float = 5000.0
    regular_customer_discount: float = 0.02  # 2%

    @property
    def database_url(self) -> str:
        """Async DSN для SQLAlchemy + asyncpg."""
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def sync_database_url(self) -> str:
        """Синхронный DSN (нужен только для скриптов обслуживания)."""
        return (
            f"postgresql+psycopg2://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    """Возвращает синглтон настроек."""
    return Settings()


settings = get_settings()

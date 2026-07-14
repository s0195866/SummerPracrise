"""Настройка подключения к PostgreSQL (async SQLAlchemy 2.0).

Используется async engine + sessionmaker + FastAPI-зависимость `get_db`.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    """Базовый класс для всех ORM-моделей."""


engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    future=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI-зависимость: выдаёт асинхронную сессию БД."""
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def _run_migrations(conn) -> None:
    """Простые миграции: добавление новых колонок в существующие таблицы.

    Используется вместо Alembic для учебного проекта.
    При каждой миграции проверяем наличие колонки через information_schema.
    """
    # Миграция: is_blocked в client
    await conn.execute(
        __import__("sqlalchemy").text(
            "DO $$ BEGIN "
            "  IF NOT EXISTS ("
            "    SELECT 1 FROM information_schema.columns "
            "    WHERE table_name='client' AND column_name='is_blocked'"
            "  ) THEN "
            "    ALTER TABLE client ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE; "
            "  END IF; "
            "END $$;"
        )
    )


async def init_db() -> None:
    """Создаёт все таблицы + применяет миграции (используется при старте приложения).

    В реальном проекте здесь должен быть Alembic, но для учебной задачи
    достаточно Base.metadata.create_all + простые ALTER TABLE.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _run_migrations(conn)

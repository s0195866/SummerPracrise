"""Точка входа FastAPI-приложения.

Запуск (локально, без Docker):
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

В Docker приложение запускается через `uvicorn app.main:app --host 0.0.0.0 --port 8000`
(см. backend/Dockerfile).
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ALL_ROUTERS
from app.config import settings
from app.database import init_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Жизненный цикл приложения.

    При старте:
      - создаём таблицы, если их ещё нет (учебный режим;
        в production — Alembic);
      - если `SEED_DB=true`, заполняем тестовыми данными.
    """
    await init_db()
    if settings.debug:
        logger.warning("DEBUG=True: таблицы будут пересозданы при каждом старте.")
    logger.info("Приложение запущено: %s", settings.app_name)
    yield
    logger.info("Приложение останавливается...")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "REST API интернет-магазина для летней практики.\n\n"
        "**Бизнес-правила:**\n"
        "- Клиент становится «постоянным» при сумме покупок ≥ 5000 руб.\n"
        "- Постоянный клиент получает скидку 2% на каждый новый заказ.\n"
        "- Цена товара на момент покупки сохраняется в `order_item.price_at_sale`.\n"
        "- Статусы заказа: new → processing → shipped → delivered / cancelled.\n"
    ),
    lifespan=lifespan,
)

# CORS: в учебном проекте разрешаем всем
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in ALL_ROUTERS:
    app.include_router(router)


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """Корневой эндпоинт: быстрый health-check."""
    return {"status": "ok", "app": settings.app_name, "version": settings.app_version}


@app.get("/health", tags=["root"])
async def health() -> dict[str, str]:
    """Health-check для Docker / балансировщика."""
    return {"status": "healthy"}

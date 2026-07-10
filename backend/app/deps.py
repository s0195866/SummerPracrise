"""Общие FastAPI-зависимости: БД-сессия, текущий пользователь, роли."""
from __future__ import annotations

from collections.abc import AsyncGenerator, Callable
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory, get_db
from app.models import Client
from app.security import decode_access_token


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
) -> Client:
    """Возвращает текущего клиента по заголовку `Authorization: Bearer <jwt>`."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учётные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not authorization or not authorization.lower().startswith("bearer "):
        raise credentials_error

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_access_token(token)
    except Exception:
        raise credentials_error

    client_id = payload.get("sub")
    if client_id is None:
        raise credentials_error

    result = await db.execute(select(Client).where(Client.client_id == int(client_id)))
    client = result.scalar_one_or_none()
    if client is None:
        raise credentials_error

    return client


def require_roles(*roles: str) -> Callable[..., AsyncGenerator[Client, None]]:
    """Зависимость: пропускает только клиентов с указанными ролями."""

    async def _checker(
        current_user: Client = Depends(get_current_user),
    ) -> Client:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Требуется одна из ролей: {', '.join(roles)}",
            )
        return current_user

    return _checker


# Готовые зависимости для часто используемых ролей
require_manager = require_roles("manager", "admin")
require_admin = require_roles("admin")


__all__ = [
    "get_current_user",
    "require_roles",
    "require_manager",
    "require_admin",
    "async_session_factory",
]

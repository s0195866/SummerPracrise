"""Аутентификация: хеширование пароля и JWT-токены.

Используется bcrypt (через passlib) для паролей и python-jose для JWT.
Этого достаточно для учебного проекта; в production стоит добавить
refresh-токены, rotation и т.п.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --------------------------------------------------------------------------- #
# Пароли                                                                      #
# --------------------------------------------------------------------------- #
def hash_password(password: str) -> str:
    """Возвращает bcrypt-хеш пароля."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Проверяет соответствие пароля и хеша."""
    return pwd_context.verify(plain, hashed)


# --------------------------------------------------------------------------- #
# JWT                                                                         #
# --------------------------------------------------------------------------- #
def create_access_token(subject: str | int, extra: dict[str, Any] | None = None) -> str:
    """Создаёт JWT-токен для пользователя.

    `subject` — это client_id. В `extra` можно положить роль и т.п.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Декодирует и валидирует JWT. Бросает JWTError при ошибке."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


__all__ = [
    "JWTError",
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
]

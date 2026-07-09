"""Роутер аутентификации: /api/auth/*."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import Client
from app.schemas import (
    ClientOut,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> Client:
    """Регистрация нового клиента.

    Роль всегда 'client' (повысить может только администратор).
    """
    client = Client(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
        address=payload.address,
        role="client",
    )
    db.add(client)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже существует",
        )
    await db.refresh(client)
    return client


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Авторизация по email + пароль. Возвращает JWT."""
    result = await db.execute(select(Client).where(Client.email == payload.email))
    client = result.scalar_one_or_none()
    if client is None or not verify_password(payload.password, client.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    token = create_access_token(
        client.client_id, extra={"role": client.role, "email": client.email}
    )
    return TokenResponse(
        access_token=token,
        role=client.role,
        client_id=client.client_id,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(_: Client = Depends(get_current_user)) -> None:
    """Выход из системы.

    Токен — stateless, поэтому серверная часть «забывает» его только
    на стороне клиента (клиент должен удалить access_token).
    Эндпоинт добавлен для полноты API.
    """
    return None


@router.get("/me", response_model=ClientOut)
async def me(current_user: Client = Depends(get_current_user)) -> Client:
    """Текущий профиль (дублирует /api/customers/me)."""
    return current_user

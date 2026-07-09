"""Роутер клиентов: /api/customers/*."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Client, Order, OrderItem
from app.schemas import ClientOut, ClientUpdate, OrderOut

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("/me", response_model=ClientOut)
async def get_my_profile(
    current_user: Client = Depends(get_current_user),
) -> Client:
    """Профиль текущего клиента."""
    return current_user


@router.put("/me", response_model=ClientOut)
async def update_my_profile(
    payload: ClientUpdate,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Редактирование своего профиля."""
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_user, key, value)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email уже занят",
        )
    await db.refresh(current_user)
    return current_user


@router.get("/me/orders", response_model=list[OrderOut])
async def my_orders(
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Order]:
    """История заказов текущего клиента."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.client_id == current_user.client_id)
        .order_by(Order.sale_date.desc())
    )
    return list(result.scalars().all())


@router.get("", response_model=list[ClientOut])
async def list_customers(
    _: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
    limit: int = 100,
    offset: int = 0,
) -> list[Client]:
    """Список всех клиентов (только менеджер/админ)."""
    result = await db.execute(
        select(Client).order_by(Client.client_id).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


@router.get("/{customer_id}", response_model=ClientOut)
async def get_customer(
    customer_id: int,
    _: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Получить клиента по id (только менеджер/админ)."""
    result = await db.execute(select(Client).where(Client.client_id == customer_id))
    client = result.scalar_one_or_none()
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клиент не найден")
    return client


@router.get("/{customer_id}/orders", response_model=list[OrderOut])
async def customer_orders(
    customer_id: int,
    _: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
) -> list[Order]:
    """Заказы конкретного клиента (для менеджера/админа)."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.client_id == customer_id)
        .order_by(Order.sale_date.desc())
    )
    return list(result.scalars().all())

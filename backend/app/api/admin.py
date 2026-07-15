"""Роутер администратора: /api/admin/*."""
from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import require_admin, require_manager
from app.models import Client, Order, Product
from app.schemas import ChangeRoleRequest, ClientOut, StatisticsOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.put("/users/{user_id}/block", response_model=ClientOut)
async def block_user(
    user_id: int,
    current_user: Client = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Заблокировать пользователя (только администратор)."""
    if user_id == current_user.client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя заблокировать самого себя",
        )
    result = await db.execute(select(Client).where(Client.client_id == user_id))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    target.is_blocked = True
    await db.commit()
    await db.refresh(target)
    return target


@router.put("/users/{user_id}/unblock", response_model=ClientOut)
async def unblock_user(
    user_id: int,
    current_user: Client = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Разблокировать пользователя (только администратор)."""
    result = await db.execute(select(Client).where(Client.client_id == user_id))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    target.is_blocked = False
    await db.commit()
    await db.refresh(target)
    return target


@router.get("/users", response_model=list[ClientOut])
async def list_users(
    _: Client = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    limit: int = 100,
    offset: int = 0,
) -> list[Client]:
    """Список всех пользователей системы (только администратор)."""
    result = await db.execute(
        select(Client).order_by(Client.client_id).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


@router.put("/users/{user_id}/role", response_model=ClientOut)
async def change_user_role(
    user_id: int,
    payload: ChangeRoleRequest,
    current_user: Client = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Изменить роль пользователя (только администратор).

    Запрещено понижать самого себя — чтобы случайно не потерять админку.
    """
    if user_id == current_user.client_id and payload.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя понизить свою собственную роль",
        )

    result = await db.execute(select(Client).where(Client.client_id == user_id))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    target.role = payload.role
    await db.commit()
    await db.refresh(target)
    return target


@router.get("/statistics", response_model=StatisticsOut)
async def get_statistics(
    _: Client = Depends(require_manager),
    db: AsyncSession = Depends(get_db),
) -> StatisticsOut:
    """Сводная статистика по системе (только администратор)."""
    total_clients = await db.scalar(select(func.count(Client.client_id)))
    regular_clients = await db.scalar(
        select(func.count(Client.client_id)).where(
            Client.total_purchases_amount >= 5000
        )
    )
    total_products = await db.scalar(select(func.count(Product.product_id)))
    total_orders = await db.scalar(
        select(func.count(Order.order_id)).where(Order.status != "cancelled")
    )
    revenue = await db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.status != "cancelled"
        )
    ) or Decimal("0")
    avg = await db.scalar(
        select(func.coalesce(func.avg(Order.total_amount), 0)).where(
            Order.status != "cancelled"
        )
    ) or Decimal("0")

    # Распределение заказов по статусам
    rows = await db.execute(
        select(Order.status, func.count(Order.order_id)).group_by(Order.status)
    )
    orders_by_status = {status_val: int(cnt) for status_val, cnt in rows.all()}

    return StatisticsOut(
        total_clients=int(total_clients or 0),
        regular_clients=int(regular_clients or 0),
        total_products=int(total_products or 0),
        total_orders=int(total_orders or 0),
        total_revenue=Decimal(revenue).quantize(Decimal("0.01")),
        average_order_value=Decimal(avg).quantize(Decimal("0.01")),
        orders_by_status=orders_by_status,
    )

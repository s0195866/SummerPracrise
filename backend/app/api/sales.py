"""Роутер продаж: /api/sales/*.

«Продажа» в нашей модели — это оформленный заказ (orders с status != 'cancelled').
Эндпоинт даёт финансовый срез по операциям (для менеджера/бухгалтера).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import require_roles
from app.models import Client, Order, OrderItem
from app.schemas import SaleOut

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.get("", response_model=list[SaleOut])
async def list_sales(
    _: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
    limit: int = 100,
    offset: int = 0,
) -> list[SaleOut]:
    """Список продаж (только менеджер/админ).

    Возвращает все заказы, кроме отменённых.
    """
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.client))
        .where(Order.status != "cancelled")
        .order_by(Order.sale_date.desc())
        .limit(limit)
        .offset(offset)
    )
    orders = result.scalars().all()
    return [
        SaleOut(
            sale_id=o.order_id,
            sale_date=o.sale_date,
            sale_amount=o.total_amount,
            client_id=o.client_id,
            client_name=o.client.full_name,
            order_id=o.order_id,
            status=o.status,
        )
        for o in orders
    ]


@router.get("/{sale_id}", response_model=SaleOut)
async def get_sale(
    sale_id: int,
    _: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
) -> SaleOut:
    """Информация о конкретной продаже (по id заказа)."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.client))
        .where(Order.order_id == sale_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Продажа не найдена")
    return SaleOut(
        sale_id=order.order_id,
        sale_date=order.sale_date,
        sale_amount=order.total_amount,
        client_id=order.client_id,
        client_name=order.client.full_name,
        order_id=order.order_id,
        status=order.status,
    )

"""Роутер заказов: /api/orders/*."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.business import (
    assert_status_transition,
    create_order_from_cart,
    get_or_create_cart,
    load_order_with_items,
    reload_cart,
)
from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Client, Order, OrderItem
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _can_access_order(client: Client, order: Order) -> None:
    """Клиент видит только свои заказы; менеджер/админ — любые."""
    if client.role == "client" and order.client_id != client.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к чужому заказу",
        )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Order:
    """Оформить заказ из текущей корзины.

    Бизнес-правила:
      - Корзина не пуста.
      - На складе достаточно товара (проверяется до списания).
      - Если total_purchases_amount клиента ≥ 5000, применяется скидка 2%.
      - После оформления total_purchases_amount увеличивается на сумму заказа.
      - Корзина очищается.
    """
    cart = await get_or_create_cart(db, current_user)
    # Полностью перезагружаем корзину с товарами — нужно для бизнес-логики
    # (validate_stock обращается к item.product.stock_quantity).
    cart = await reload_cart(db, current_user)

    order = await create_order_from_cart(db, current_user, cart, payload)
    await db.commit()
    await db.refresh(order)
    return await load_order_with_items(db, order.order_id)


@router.get("", response_model=list[OrderOut])
async def list_orders(
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status_filter: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Order]:
    """Список заказов.

    Клиент видит только свои. Менеджер/админ — все.
    """
    stmt = select(Order).options(selectinload(Order.items).selectinload(OrderItem.product))
    if current_user.role == "client":
        stmt = stmt.where(Order.client_id == current_user.client_id)
    if status_filter:
        stmt = stmt.where(Order.status == status_filter)
    stmt = stmt.order_by(Order.sale_date.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Order:
    """Получить заказ по id."""
    order = await load_order_with_items(db, order_id)
    _can_access_order(current_user, order)
    return order


@router.put("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(
    order_id: int,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Order:
    """Отменить заказ.

    Клиент может отменить свой заказ только в статусе 'new' или 'processing'.
    Менеджер/админ — в любом активном статусе.
    """
    order = await load_order_with_items(db, order_id)
    _can_access_order(current_user, order)

    if current_user.role == "client" and order.status not in ("new", "processing"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Заказ уже нельзя отменить",
        )

    assert_status_transition(order.status, "cancelled")
    order.status = "cancelled"
    await db.commit()
    await db.refresh(order)
    return order


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
) -> Order:
    """Изменить статус заказа (только менеджер/админ)."""
    order = await load_order_with_items(db, order_id)
    assert_status_transition(order.status, payload.status)
    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    return order

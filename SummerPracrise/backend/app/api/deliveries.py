"""Роутер доставок: /api/deliveries/*."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.business import load_order_with_items
from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Client, Delivery, Order
from app.schemas import DeliveryCreate, DeliveryOut, DeliveryStatusUpdate

router = APIRouter(prefix="/api/deliveries", tags=["deliveries"])


def _can_access_delivery(client: Client, delivery: Delivery) -> None:
    if client.role == "client" and delivery.order.client_id != client.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к доставке чужого заказа",
        )


@router.post("", response_model=DeliveryOut, status_code=status.HTTP_201_CREATED)
async def create_delivery(
    payload: DeliveryCreate,
    current_user: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
) -> Delivery:
    """Создать доставку для заказа (только менеджер/админ).

    Если у заказа уже есть доставка — возвращаем 409.
    """
    order = await load_order_with_items(db, payload.order_id)

    existing = await db.execute(
        select(Delivery).where(Delivery.order_id == payload.order_id)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="У заказа уже есть доставка",
        )

    delivery = Delivery(
        order_id=payload.order_id,
        address=payload.address,
        delivery_method=payload.delivery_method,
        delivery_date=payload.delivery_date,
        status="pending",
    )
    db.add(delivery)

    # Синхронизируем адрес/метод/дату в самом заказе
    order.delivery_address = payload.address
    order.delivery_method = payload.delivery_method
    if payload.delivery_date is not None:
        order.delivery_date = payload.delivery_date

    await db.commit()
    await db.refresh(delivery)
    return delivery


@router.get("/{delivery_id}", response_model=DeliveryOut)
async def get_delivery(
    delivery_id: int,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Delivery:
    """Получить данные доставки. Клиент видит только свои."""
    result = await db.execute(
        select(Delivery).where(Delivery.delivery_id == delivery_id)
    )
    delivery = result.scalar_one_or_none()
    if delivery is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Доставка не найдена")

    # Подгружаем заказ для проверки доступа
    order = await db.get(Order, delivery.order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден")
    _can_access_delivery_client(current_user, order.client_id)
    return delivery


def _can_access_delivery_client(client: Client, owner_id: int) -> None:
    if client.role == "client" and client.client_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к доставке чужого заказа",
        )


@router.put("/{delivery_id}", response_model=DeliveryOut)
async def update_delivery_status(
    delivery_id: int,
    payload: DeliveryStatusUpdate,
    current_user: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
) -> Delivery:
    """Изменить статус доставки (только менеджер/админ)."""
    result = await db.execute(
        select(Delivery).where(Delivery.delivery_id == delivery_id)
    )
    delivery = result.scalar_one_or_none()
    if delivery is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Доставка не найдена")

    delivery.status = payload.status
    if payload.delivery_date is not None:
        delivery.delivery_date = payload.delivery_date
        # синхронизируем дату в заказе
        order = await db.get(Order, delivery.order_id)
        if order is not None:
            order.delivery_date = payload.delivery_date

    await db.commit()
    await db.refresh(delivery)
    return delivery

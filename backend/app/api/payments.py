"""Роутер оплат: /api/payments/*."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.business import load_order_with_items
from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Client, Order, Payment
from app.schemas import PaymentCreate, PaymentOut, PaymentStatusUpdate

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _can_access_payment_client(client: Client, owner_id: int) -> None:
    if client.role == "client" and client.client_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к оплате чужого заказа",
        )


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentCreate,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Payment:
    """Создать оплату для заказа.

    Клиент создаёт оплату для своего заказа; менеджер/админ — для любого.
    Если у заказа уже есть оплата — возвращаем 409.
    """
    order = await load_order_with_items(db, payload.order_id)
    if current_user.role == "client" and order.client_id != current_user.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нельзя оплачивать чужой заказ",
        )

    existing = await db.execute(
        select(Payment).where(Payment.order_id == payload.order_id)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="У заказа уже есть платёж",
        )

    payment = Payment(
        order_id=payload.order_id,
        payment_method=payload.payment_method,
        payment_amount=order.total_amount,
        status="pending",
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment


@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(
    payment_id: int,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Payment:
    """Получить информацию об оплате."""
    result = await db.execute(select(Payment).where(Payment.payment_id == payment_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Оплата не найдена")

    order = await db.get(Order, payment.order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден")
    _can_access_payment_client(current_user, order.client_id)
    return payment


@router.put("/{payment_id}", response_model=PaymentOut)
async def update_payment_status(
    payment_id: int,
    payload: PaymentStatusUpdate,
    current_user: Client = Depends(require_roles("manager", "admin")),
    db: AsyncSession = Depends(get_db),
) -> Payment:
    """Изменить статус оплаты (только менеджер/админ)."""
    result = await db.execute(select(Payment).where(Payment.payment_id == payment_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Оплата не найдена")

    payment.status = payload.status
    await db.commit()
    await db.refresh(payment)
    return payment

"""Роутер корзины: /api/cart/*."""
from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.business import get_or_create_cart, recalc_cart_total, reload_cart
from app.database import get_db
from app.deps import get_current_user
from app.models import CartItem, Client, Product
from app.schemas import CartItemAdd, CartItemOut, CartItemUpdate, CartOut

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _cart_to_out(cart, total: Decimal) -> CartOut:
    """Собирает CartOut из ORM-объекта."""
    items = [
        CartItemOut(
            cart_item_id=item.cart_item_id,
            product_id=item.product_id,
            product_name=item.product.name,
            unit=item.product.unit,
            quantity=item.quantity,
            price=item.product.price,
        )
        for item in cart.items
    ]
    return CartOut(cart_id=cart.cart_id, items=items, total=total)


@router.get("", response_model=CartOut)
async def get_cart(
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartOut:
    """Получить содержимое корзины."""
    await get_or_create_cart(db, current_user)
    cart = await reload_cart(db, current_user)
    return _cart_to_out(cart, recalc_cart_total(cart))


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
async def add_item(
    payload: CartItemAdd,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartOut:
    """Добавить товар в корзину (или увеличить количество)."""
    result = await db.execute(select(Product).where(Product.product_id == payload.product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Товар не найден")

    if product.stock_quantity < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недостаточно товара на складе: доступно {product.stock_quantity}",
        )

    cart = await get_or_create_cart(db, current_user)
    # Перезагружаем корзину с items, чтобы безопасно искать существующую позицию
    cart = await reload_cart(db, current_user)

    existing = next(
        (i for i in cart.items if i.product_id == payload.product_id),
        None,
    )
    if existing is not None:
        existing.quantity += payload.quantity
    else:
        cart.items.append(
            CartItem(product_id=payload.product_id, quantity=payload.quantity)
        )

    await db.commit()
    cart = await reload_cart(db, current_user)
    return _cart_to_out(cart, recalc_cart_total(cart))


@router.put("/items/{item_id}", response_model=CartOut)
async def update_item(
    item_id: int,
    payload: CartItemUpdate,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartOut:
    """Изменить количество товара в корзине."""
    await get_or_create_cart(db, current_user)
    cart = await reload_cart(db, current_user)

    item = next((i for i in cart.items if i.cart_item_id == item_id), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Строка корзины не найдена")

    result = await db.execute(select(Product).where(Product.product_id == item.product_id))
    product = result.scalar_one()
    if product.stock_quantity < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недостаточно товара на складе: доступно {product.stock_quantity}",
        )

    item.quantity = payload.quantity
    await db.commit()
    cart = await reload_cart(db, current_user)
    return _cart_to_out(cart, recalc_cart_total(cart))


@router.delete("/items/{item_id}", response_model=CartOut)
async def delete_item(
    item_id: int,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartOut:
    """Удалить товар из корзины."""
    await get_or_create_cart(db, current_user)
    cart = await reload_cart(db, current_user)

    item = next((i for i in cart.items if i.cart_item_id == item_id), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Строка корзины не найдена")

    await db.delete(item)
    await db.commit()
    cart = await reload_cart(db, current_user)
    return _cart_to_out(cart, recalc_cart_total(cart))

"""Бизнес-логика предметной области.

Здесь сосредоточены все расчёты, чтобы роутеры оставались тонкими:
    - вычисление total_amount заказа
    - применение скидки постоянного клиента (2% при сумме покупок ≥ 5000)
    - обновление total_purchases_amount клиента
    - проверка остатков на складе
    - правила перехода между статусами заказа
"""
from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models import Cart, CartItem, Client, Order, OrderItem, Product


async def reload_cart(db: AsyncSession, client: Client) -> Cart:
    """Перезагружает корзину клиента со всеми связями (items + products).

    Обязательно для использования перед сериализацией ответа: иначе
    асинхронный SQLAlchemy не сможет сделать lazy-load `item.product`
    вне сессии и упадёт с `MissingGreenlet`.
    """
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.client_id == client.client_id)
    )
    cart = result.scalar_one_or_none()
    if cart is None:
        # Корзина ещё не создана — создаём и снова перезагружаем
        cart = Cart(client_id=client.client_id)
        db.add(cart)
        await db.flush()
        result = await db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.client_id == client.client_id)
        )
        cart = result.scalar_one()
    return cart


# --------------------------------------------------------------------------- #
# Скидки и суммы                                                              #
# --------------------------------------------------------------------------- #
def quantize_money(value: Decimal) -> Decimal:
    """Округляет сумму до копеек (2 знака)."""
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_discount(client: Client, subtotal: Decimal) -> tuple[Decimal, Decimal]:
    """Возвращает (сумма_скидки, итоговая_сумма).

    Если клиент «постоянный» (total_purchases_amount ≥ порога),
    применяется скидка `regular_customer_discount` (по умолчанию 2%).
    """
    if client.is_regular:
        discount = quantize_money(subtotal * Decimal(str(settings.regular_customer_discount)))
    else:
        discount = Decimal("0.00")
    return discount, quantize_money(subtotal - discount)


# --------------------------------------------------------------------------- #
# Корзина                                                                     #
# --------------------------------------------------------------------------- #
async def get_or_create_cart(db: AsyncSession, client: Client) -> Cart:
    """Возвращает (или создаёт) корзину клиента.

    Никогда не обращается к `client.cart` напрямую — это lazy-load
    связь, которая в async-контекте падает с MissingGreenlet.
    Используем явный SELECT.
    """
    result = await db.execute(select(Cart).where(Cart.client_id == client.client_id))
    cart = result.scalar_one_or_none()
    if cart is not None:
        return cart

    cart = Cart(client_id=client.client_id)
    db.add(cart)
    await db.flush()
    return cart


def recalc_cart_total(cart: Cart) -> Decimal:
    """Считает сумму корзины по текущим ценам товаров.

    Требует, чтобы у каждого `cart_item.product` уже была загружена
    связь (см. `reload_cart`).
    """
    return quantize_money(
        sum(
            (item.product.price * item.quantity for item in cart.items),
            start=Decimal("0"),
        )
    )


# --------------------------------------------------------------------------- #
# Заказ                                                                       #
# --------------------------------------------------------------------------- #
async def validate_cart_has_items(cart: Cart) -> None:
    """Бросает 400, если корзина пустая."""
    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Корзина пуста — невозможно оформить заказ",
        )


async def validate_stock(cart: Cart) -> None:
    """Бросает 400, если хотя бы один товар не хватает на складе."""
    for item in cart.items:
        if item.product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Недостаточно товара «{item.product.name}» на складе: "
                    f"запрошено {item.quantity}, доступно {item.product.stock_quantity}"
                ),
            )


async def create_order_from_cart(
    db: AsyncSession, client: Client, cart: Cart, payload
) -> Order:
    """Создаёт заказ из корзины с применением всех бизнес-правил.

    Шаги:
      1. Проверить, что корзина не пуста.
      2. Проверить остатки на складе.
      3. Рассчитать subtotal = Σ(price_at_sale × quantity).
      4. Применить скидку постоянного клиента.
      5. Создать заказ + строки (копия цены в price_at_sale).
      6. Списать остатки товаров.
      7. Очистить корзину.
      8. Обновить total_purchases_amount клиента.
    """
    await validate_cart_has_items(cart)
    await validate_stock(cart)

    # Перезагружаем товары в корзине, чтобы получить актуальные цены
    product_ids = [item.product_id for item in cart.items]
    result = await db.execute(select(Product).where(Product.product_id.in_(product_ids)))
    products_by_id = {p.product_id: p for p in result.scalars().all()}

    subtotal = Decimal("0")
    order_items: list[OrderItem] = []
    for cart_item in cart.items:
        product = products_by_id[cart_item.product_id]
        price_at_sale = product.price
        line_total = quantize_money(price_at_sale * cart_item.quantity)
        subtotal += line_total

        order_items.append(
            OrderItem(
                product_id=product.product_id,
                quantity=cart_item.quantity,
                price_at_sale=price_at_sale,
            )
        )
        # Списываем со склада
        product.stock_quantity = quantize_money(product.stock_quantity - cart_item.quantity)

    subtotal = quantize_money(subtotal)
    discount, total = compute_discount(client, subtotal)

    order = Order(
        client_id=client.client_id,
        total_amount=total,
        status="new",
        delivery_address=payload.delivery_address,
        delivery_method=payload.delivery_method,
        payment_method=payload.payment_method,
        discount_applied=discount,
        items=order_items,
    )
    db.add(order)

    # Обновляем сумму покупок клиента
    client.total_purchases_amount = quantize_money(client.total_purchases_amount + total)

    # Очищаем корзину
    for cart_item in list(cart.items):
        await db.delete(cart_item)

    await db.flush()
    return order


# --------------------------------------------------------------------------- #
# Переходы статусов заказа                                                    #
# --------------------------------------------------------------------------- #
ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "new": {"processing", "cancelled"},
    "processing": {"shipped", "cancelled"},
    "shipped": {"delivered"},
    "delivered": set(),
    "cancelled": set(),
}


def assert_status_transition(current: str, target: str) -> None:
    """Бросает 400, если переход статуса запрещён."""
    if target == current:
        return
    allowed = ALLOWED_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Запрещённый переход статуса: {current!r} → {target!r}",
        )


# --------------------------------------------------------------------------- #
# Утилиты                                                                     #
# --------------------------------------------------------------------------- #
async def load_order_with_items(db: AsyncSession, order_id: int) -> Order:
    """Загружает заказ вместе со строками и товарами (для ответа)."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.order_id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ {order_id} не найден",
        )
    return order

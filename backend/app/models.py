"""SQLAlchemy-модели.

Расширяют исходную схему v1.0 (client, product, orders, order_item)
дополнительными сущностями для полной реализации EndPoint.md:
    - cart / cart_item  — персональная корзина клиента
    - delivery          — доставка заказа
    - payment           — оплата заказа
    - review            — отзыв клиента на товар

Все названия таблиц и колонки совпадают с `docs/db/db_create_v1.0.sql`
и `docs/db/db_semantics.md`, чтобы ER-диаграмма оставалась актуальной.
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# --------------------------------------------------------------------------- #
# 1. Клиент                                                                   #
# --------------------------------------------------------------------------- #
class Client(Base):
    """Клиент / пользователь системы.

    Роли: 'client' (по умолчанию), 'manager', 'admin'.
    Поле `total_purchases_amount` обновляется автоматически после каждого
    оформленного заказа — именно оно определяет «постоянного клиента»
    (сумма покупок > 5000 руб. → скидка 2%).
    """

    __tablename__ = "client"

    client_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500))
    reg_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    role: Mapped[str] = mapped_column(String(20), default="client", nullable=False)
    total_purchases_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )

    # --- Связи ---
    orders: Mapped[list["Order"]] = relationship(
        back_populates="client", cascade="all, delete-orphan"
    )
    cart: Mapped[Optional["Cart"]] = relationship(
        back_populates="client", uselist=False, cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="client", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("role IN ('client', 'manager', 'admin')", name="ck_client_role"),
    )

    @property
    def is_regular(self) -> bool:
        """Постоянный ли клиент (сумма покупок ≥ порога)."""
        return self.total_purchases_amount >= Decimal("5000")


# --------------------------------------------------------------------------- #
# 2. Товар                                                                    #
# --------------------------------------------------------------------------- #
class Product(Base):
    """Товар, выставленный на продажу в интернет-магазине."""

    __tablename__ = "product"

    product_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(10), nullable=False)  # 'шт', 'кг', 'л'
    description: Mapped[Optional[str]] = mapped_column(String(2000))
    stock_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    brand: Mapped[Optional[str]] = mapped_column(String(100), default=None)

    # --- Связи ---
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")
    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="product")
    reviews: Mapped[list["Review"]] = relationship(back_populates="product")

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_product_price_non_negative"),
        CheckConstraint("stock_quantity >= 0", name="ck_product_stock_non_negative"),
        CheckConstraint("unit IN ('шт', 'кг', 'л')", name="ck_product_unit"),
    )


# --------------------------------------------------------------------------- #
# 3. Заказ                                                                    #
# --------------------------------------------------------------------------- #
class Order(Base):
    """Заказ клиента.

    `total_amount` — итог после применения скидки постоянного клиента.
    `sale_date`    — дата оформления (фиксируется автоматически).
    `delivery_date`— фактическая/ожидаемая дата доставки.
    """

    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(
        ForeignKey("client.client_id", ondelete="CASCADE"), nullable=False
    )
    sale_date: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
    delivery_date: Mapped[Optional[date]] = mapped_column(Date)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="new", nullable=False)
    delivery_address: Mapped[Optional[str]] = mapped_column(String(500))
    delivery_method: Mapped[Optional[str]] = mapped_column(String(50))
    payment_method: Mapped[Optional[str]] = mapped_column(String(50))
    discount_applied: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=False
    )

    # --- Связи ---
    client: Mapped["Client"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    delivery: Mapped[Optional["Delivery"]] = relationship(
        back_populates="order", uselist=False, cascade="all, delete-orphan"
    )
    payment: Mapped[Optional["Payment"]] = relationship(
        back_populates="order", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')",
            name="ck_orders_status",
        ),
        CheckConstraint("total_amount >= 0", name="ck_orders_total_non_negative"),
    )


# --------------------------------------------------------------------------- #
# 4. Состав заказа                                                            #
# --------------------------------------------------------------------------- #
class OrderItem(Base):
    """Строка заказа: товар + количество + цена на момент покупки."""

    __tablename__ = "order_item"

    order_item_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.product_id"), nullable=False
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    price_at_sale: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_item_quantity_positive"),
        CheckConstraint("price_at_sale >= 0", name="ck_order_item_price_non_negative"),
    )

    @property
    def product_name(self) -> str:
        """Название товара (требует загруженной связи product)."""
        return self.product.name if self.product is not None else ""

    @property
    def line_total(self) -> Decimal:
        """Стоимость строки = quantity × price_at_sale."""
        return self.quantity * self.price_at_sale


# --------------------------------------------------------------------------- #
# 5. Корзина (доп. к v1.0 — нужна для /api/cart)                              #
# --------------------------------------------------------------------------- #
class Cart(Base):
    """Персональная корзина клиента (1:1 с client)."""

    __tablename__ = "cart"

    cart_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(
        ForeignKey("client.client_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )

    client: Mapped["Client"] = relationship(back_populates="cart")
    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart", cascade="all, delete-orphan"
    )


class CartItem(Base):
    """Строка корзины."""

    __tablename__ = "cart_item"

    cart_item_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    cart_id: Mapped[int] = mapped_column(
        ForeignKey("cart.cart_id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.product_id", ondelete="CASCADE"), nullable=False
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    cart: Mapped["Cart"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="cart_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_cart_item_quantity_positive"),
    )


# --------------------------------------------------------------------------- #
# 6. Доставка                                                                 #
# --------------------------------------------------------------------------- #
class Delivery(Base):
    """Информация о доставке заказа (1:1 с orders)."""

    __tablename__ = "delivery"

    delivery_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    delivery_date: Mapped[Optional[date]] = mapped_column(Date)
    delivery_method: Mapped[str] = mapped_column(String(50), default="Курьер")
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)

    order: Mapped["Order"] = relationship(back_populates="delivery")

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'shipped', 'delivered', 'cancelled')",
            name="ck_delivery_status",
        ),
    )


# --------------------------------------------------------------------------- #
# 7. Оплата                                                                   #
# --------------------------------------------------------------------------- #
class Payment(Base):
    """Информация об оплате заказа (1:1 с orders)."""

    __tablename__ = "payment"

    payment_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    payment_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )

    order: Mapped["Order"] = relationship(back_populates="payment")

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'paid', 'failed', 'refunded')",
            name="ck_payment_status",
        ),
        CheckConstraint("payment_amount >= 0", name="ck_payment_amount_non_negative"),
    )


# --------------------------------------------------------------------------- #
# 8. Отзыв                                                                    #
# --------------------------------------------------------------------------- #
class Review(Base):
    """Отзыв клиента на товар."""

    __tablename__ = "review"

    review_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.product_id", ondelete="CASCADE"), nullable=False
    )
    client_id: Mapped[int] = mapped_column(
        ForeignKey("client.client_id", ondelete="CASCADE"), nullable=False
    )
    rating: Mapped[int] = mapped_column(nullable=False)  # 1..5
    review_text: Mapped[Optional[str]] = mapped_column(String(2000))
    review_date: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )

    product: Mapped["Product"] = relationship(back_populates="reviews")
    client: Mapped["Client"] = relationship(back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating_range"),
    )

    @property
    def client_name(self) -> str:
        """Имя клиента для сериализации (требует загруженной связи client)."""
        return self.client.full_name if self.client is not None else ""
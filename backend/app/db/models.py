from typing import List

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, Boolean, DateTime, Date, ForeignKey, Text, Index
from datetime import datetime
from db.database import Base


class AppUser(Base):
    __tablename__ = "app_user"

    user_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="client")
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    reg_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    total_purchases_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    # связи
    cart_items: Mapped[List["CartItem"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[List["Order"]] = relationship(back_populates="user")
    reset_tokens: Mapped[List["PasswordResetToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_user_role", "role"),)


class Product(Base):
    __tablename__ = "product"

    product_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(10), nullable=False)
    stock_quantity: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    cart_items: Mapped[List["CartItem"]] = relationship(back_populates="product")
    order_items: Mapped[List["OrderItem"]] = relationship(back_populates="product")


class CartItem(Base):
    __tablename__ = "cart_item"

    cart_item_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.user_id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.product_id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["AppUser"] = relationship(back_populates="cart_items")
    product: Mapped["Product"] = relationship(back_populates="cart_items")

    __table_args__ = (Index("idx_cart_user_id", "user_id"),)


class Order(Base):
    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.user_id", ondelete="CASCADE"), nullable=False)
    sale_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    delivery_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="new")

    user: Mapped["AppUser"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_orders_user_id", "user_id"), Index("idx_orders_status", "status"))


class OrderItem(Base):
    __tablename__ = "order_item"

    order_item_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.product_id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    price_at_sale: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_token"

    token_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.user_id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    user: Mapped["AppUser"] = relationship(back_populates="reset_tokens")
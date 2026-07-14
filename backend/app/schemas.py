"""Pydantic-схемы (DTO) для валидации входных и выходных данных API.

Имена полей совпадают с именами колонок в БД, но это разные слои:
    - models.py  описывает, КАК данные хранятся
    - schemas.py описывает, КАК данные передаются по сети
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# --------------------------------------------------------------------------- #
# 1. Auth                                                                     #
# --------------------------------------------------------------------------- #
class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    phone: str = Field(..., min_length=6, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    address: Optional[str] = Field(default=None, max_length=500)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    role: str
    client_id: int


# --------------------------------------------------------------------------- #
# 2. Client                                                                   #
# --------------------------------------------------------------------------- #
class ClientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    client_id: int
    full_name: str
    phone: str
    email: str
    address: Optional[str] = None
    reg_date: date
    role: str
    is_blocked: bool = False
    total_purchases_amount: Decimal
    is_regular: bool = False


class ClientUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    phone: Optional[str] = Field(default=None, min_length=6, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(default=None, max_length=500)


class ChangeRoleRequest(BaseModel):
    role: Literal["client", "manager", "admin"]


# --------------------------------------------------------------------------- #
# 3. Product                                                                  #
# --------------------------------------------------------------------------- #
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: Decimal = Field(..., ge=0)
    unit: Literal["шт", "кг", "л"]
    description: Optional[str] = Field(default=None, max_length=2000)
    stock_quantity: Decimal = Field(default=Decimal("0"), ge=0)
    category: Optional[str] = Field(default=None, max_length=100)
    brand: Optional[str] = Field(default=None, max_length=100)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    price: Optional[Decimal] = Field(default=None, ge=0)
    unit: Optional[Literal["шт", "кг", "л"]] = None
    description: Optional[str] = Field(default=None, max_length=2000)
    stock_quantity: Optional[Decimal] = Field(default=None, ge=0)
    category: Optional[str] = Field(default=None, max_length=100)
    brand: Optional[str] = Field(default=None, max_length=100)


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    product_id: int


# --------------------------------------------------------------------------- #
# 4. Cart                                                                     #
# --------------------------------------------------------------------------- #
class CartItemAdd(BaseModel):
    product_id: int
    quantity: Decimal = Field(..., gt=0)


class CartItemUpdate(BaseModel):
    quantity: Decimal = Field(..., gt=0)


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cart_item_id: int
    product_id: int
    product_name: str
    unit: str
    quantity: Decimal
    price: Decimal  # текущая цена товара


class CartOut(BaseModel):
    cart_id: int
    items: list[CartItemOut]
    total: Decimal


# --------------------------------------------------------------------------- #
# 5. Order                                                                    #
# --------------------------------------------------------------------------- #
class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_item_id: int
    product_id: int
    product_name: str
    quantity: Decimal
    price_at_sale: Decimal
    line_total: Decimal


class OrderCreate(BaseModel):
    delivery_address: str = Field(..., min_length=5, max_length=500)
    delivery_method: str = Field(default="Курьер", max_length=50)
    payment_method: str = Field(default="Карта", max_length=50)


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: int
    client_id: int
    sale_date: datetime
    delivery_date: Optional[date] = None
    total_amount: Decimal
    status: str
    delivery_address: Optional[str] = None
    delivery_method: Optional[str] = None
    payment_method: Optional[str] = None
    discount_applied: Decimal
    items: list[OrderItemOut] = []


class OrderStatusUpdate(BaseModel):
    status: Literal["new", "processing", "shipped", "delivered", "cancelled"]


# --------------------------------------------------------------------------- #
# 6. Delivery                                                                 #
# --------------------------------------------------------------------------- #
class DeliveryCreate(BaseModel):
    order_id: int
    address: str = Field(..., min_length=5, max_length=500)
    delivery_method: str = Field(default="Курьер", max_length=50)
    delivery_date: Optional[date] = None


class DeliveryStatusUpdate(BaseModel):
    status: Literal["pending", "shipped", "delivered", "cancelled"]
    delivery_date: Optional[date] = None


class DeliveryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    delivery_id: int
    order_id: int
    address: str
    delivery_date: Optional[date] = None
    delivery_method: str
    status: str


# --------------------------------------------------------------------------- #
# 7. Payment                                                                  #
# --------------------------------------------------------------------------- #
class PaymentCreate(BaseModel):
    order_id: int
    payment_method: str = Field(default="Карта", max_length=50)


class PaymentStatusUpdate(BaseModel):
    status: Literal["pending", "paid", "failed", "refunded"]


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    payment_id: int
    order_id: int
    payment_method: str
    payment_amount: Decimal
    status: str
    created_at: datetime


# --------------------------------------------------------------------------- #
# 8. Review                                                                   #
# --------------------------------------------------------------------------- #
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = Field(default=None, max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    review_id: int
    product_id: int
    client_id: int
    client_name: str
    rating: int
    review_text: Optional[str] = None
    review_date: datetime


# --------------------------------------------------------------------------- #
# 9. Sale (агрегат над orders)                                                #
# --------------------------------------------------------------------------- #
class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sale_id: int  # = order_id
    sale_date: datetime
    sale_amount: Decimal
    client_id: int
    client_name: str
    order_id: int
    status: str


# --------------------------------------------------------------------------- #
# 10. Admin / Statistics                                                      #
# --------------------------------------------------------------------------- #
class StatisticsOut(BaseModel):
    total_clients: int
    regular_clients: int
    total_products: int
    total_orders: int
    total_revenue: Decimal
    average_order_value: Decimal
    orders_by_status: dict[str, int]

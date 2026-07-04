"""Пакет API-роутеров."""
from __future__ import annotations

from app.api import (
    admin,
    auth,
    cart,
    customers,
    deliveries,
    orders,
    payments,
    products,
    reviews,
    sales,
)

ALL_ROUTERS = [
    auth.router,
    customers.router,
    products.router,
    cart.router,
    orders.router,
    deliveries.router,
    payments.router,
    reviews.router,
    sales.router,
    admin.router,
]

__all__ = ["ALL_ROUTERS"]

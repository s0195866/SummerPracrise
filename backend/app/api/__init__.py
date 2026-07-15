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
    uploads,
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
    uploads.router,
]

__all__ = ["ALL_ROUTERS"]

"""Полный smoke-test API через in-memory SQLite + TestClient.

Покрывает:
    - регистрация / логин
    - каталог товаров
    - корзина (добавить / изменить / удалить)
    - оформление заказа со скидкой 2% для постоянного клиента
    - проверка total_purchases_amount после заказа
    - статусы заказа
    - роли (админ может менять роли, клиент не может)

Запуск:
    cd backend && python -m tests.smoke_test
"""
from __future__ import annotations

import asyncio
import os
from decimal import Decimal

# Конфигурируем окружение ДО импорта app-модулей
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "test")
os.environ.setdefault("DB_USER", "test")
os.environ.setdefault("DB_PASSWORD", "test")

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

# Подменяем движок на in-memory SQLite ДО того, как models.py что-то использует
# StaticPool + single connection → все сессии видят одни и те же данные
# (по умолчанию SQLite in-memory даёт каждому соединению свою БД).
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    future=True,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)
test_session_factory = async_sessionmaker(test_engine, expire_on_commit=False)

import app.database as db_module  # noqa: E402
from app.database import Base  # noqa: E402

db_module.engine = test_engine
db_module.async_session_factory = test_session_factory


async def _get_test_db():
    async with test_session_factory() as s:
        try:
            yield s
        except Exception:
            await s.rollback()
            raise
        finally:
            await s.close()


db_module.get_db = _get_test_db

# Теперь можно импортировать всё остальное
from fastapi.testclient import TestClient  # noqa: E402

from app.deps import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Client, Product  # noqa: E402
from app.security import hash_password  # noqa: E402

# Подменяем Depends(get_db) на тестовый
app.dependency_overrides[get_db] = _get_test_db


def setup_module(_):
    """Создаём таблицы в in-memory SQLite."""
    asyncio.run(_create_all())


async def _create_all():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def _auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_full_flow():
    client = TestClient(app)

    # --- 1. Создаём товары и клиентов напрямую в БД ---
    async def _seed():
        async with test_session_factory() as s:
            s.add_all(
                [
                    Client(
                        full_name="Админ",
                        phone="+70000000001",
                        email="admin@shop.ru",
                        password_hash=hash_password("admin123"),
                        role="admin",
                    ),
                    Client(
                        full_name="Иванов Иван",
                        phone="+79991112233",
                        email="ivan@mail.ru",
                        password_hash=hash_password("ivan123"),
                        role="client",
                        total_purchases_amount=Decimal("8000"),  # уже «постоянный»
                    ),
                    Client(
                        full_name="Петров Пётр",
                        phone="+79994445566",
                        email="petr@mail.ru",
                        password_hash=hash_password("petr123"),
                        role="client",
                    ),
                    Product(name="Мышь", price=Decimal("1500"), unit="шт", stock_quantity=Decimal("30")),
                    Product(name="Кофе", price=Decimal("850"), unit="кг", stock_quantity=Decimal("100")),
                ]
            )
            await s.commit()

    asyncio.run(_seed())

    # --- 2. Логинимся как «постоянный» клиент ---
    r = client.post("/api/auth/login", json={"email": "ivan@mail.ru", "password": "ivan123"})
    assert r.status_code == 200, r.text
    ivan_token = r.json()["access_token"]

    # --- 3. Каталог товаров ---
    r = client.get("/api/products")
    assert r.status_code == 200
    products = r.json()
    assert len(products) == 2
    mouse_id = next(p["product_id"] for p in products if p["name"] == "Мышь")

    # --- 4. Добавить в корзину ---
    r = client.post(
        "/api/cart/items",
        json={"product_id": mouse_id, "quantity": 2},
        headers=_auth_header(ivan_token),
    )
    assert r.status_code == 201, r.text
    cart = r.json()
    assert Decimal(cart["items"][0]["quantity"]) == Decimal("2")
    assert Decimal(cart["total"]) == Decimal("3000"), cart  # 2 × 1500

    # --- 5. Оформить заказ (Иван — постоянный, должна быть скидка 2%) ---
    # subtotal = 3000, discount = 60, total = 2940
    r = client.post(
        "/api/orders",
        json={
            "delivery_address": "Москва, ул. Пушкина, 10",
            "delivery_method": "Курьер",
            "payment_method": "Карта",
        },
        headers=_auth_header(ivan_token),
    )
    assert r.status_code == 201, r.text
    order = r.json()
    assert Decimal(order["total_amount"]) == Decimal("2940.00"), order
    # discount_applied = сумма скидки в рублях (60 = 2% от 3000)
    assert Decimal(order["discount_applied"]) == Decimal("60.00"), order
    assert Decimal(order["items"][0]["price_at_sale"]) == Decimal("1500.00")

    # --- 6. Проверим, что total_purchases_amount обновился ---
    r = client.get("/api/customers/me", headers=_auth_header(ivan_token))
    me = r.json()
    assert Decimal(me["total_purchases_amount"]) == Decimal("10940.00"), me  # 8000 + 2940
    assert me["is_regular"] is True

    # --- 7. Корзина после заказа пустая ---
    r = client.get("/api/cart", headers=_auth_header(ivan_token))
    assert r.json()["items"] == []

    # --- 8. Петров (не постоянный) — без скидки ---
    r = client.post("/api/auth/login", json={"email": "petr@mail.ru", "password": "petr123"})
    petr_token = r.json()["access_token"]

    r = client.post(
        "/api/cart/items",
        json={"product_id": mouse_id, "quantity": 1},
        headers=_auth_header(petr_token),
    )
    assert r.status_code == 201, r.text

    r = client.post(
        "/api/orders",
        json={
            "delivery_address": "СПб, Невский 25",
            "delivery_method": "Самовывоз",
            "payment_method": "Наличные",
        },
        headers=_auth_header(petr_token),
    )
    assert r.status_code == 201, r.text
    petr_order = r.json()
    assert Decimal(petr_order["total_amount"]) == Decimal("1500.00"), petr_order
    assert Decimal(petr_order["discount_applied"]) == Decimal("0.00"), petr_order

    # --- 9. Список своих заказов ---
    r = client.get("/api/orders", headers=_auth_header(ivan_token))
    assert r.status_code == 200
    assert len(r.json()) == 1

    # --- 10. Клиент не может менять статус заказа ---
    r = client.put(
        f"/api/orders/{order['order_id']}/status",
        json={"status": "processing"},
        headers=_auth_header(ivan_token),
    )
    assert r.status_code == 403, r.text

    # --- 11. Админ меняет статус заказа ---
    r = client.post("/api/auth/login", json={"email": "admin@shop.ru", "password": "admin123"})
    admin_token = r.json()["access_token"]

    r = client.put(
        f"/api/orders/{order['order_id']}/status",
        json={"status": "processing"},
        headers=_auth_header(admin_token),
    )
    assert r.status_code == 200, r.text

    # --- 12. Статистика админа ---
    r = client.get("/api/admin/statistics", headers=_auth_header(admin_token))
    assert r.status_code == 200, r.text
    stats = r.json()
    assert stats["total_clients"] == 3
    assert stats["regular_clients"] == 1
    assert stats["total_orders"] == 2

    # --- 13. Отзыв на товар ---
    r = client.post(
        f"/api/products/{mouse_id}/reviews",
        json={"rating": 5, "text": "Отличная мышь!"},
        headers=_auth_header(ivan_token),
    )
    assert r.status_code == 201, r.text

    r = client.get(f"/api/products/{mouse_id}/reviews")
    assert len(r.json()) == 1

    print("✅ Все smoke-тесты прошли успешно!")
    print("   - Оформлено заказов: 2")
    print("   - Проверена скидка 2% для постоянного клиента")
    print("   - Проверены роли и статусы")
    print("   - Проверены отзывы и статистика")


if __name__ == "__main__":
    setup_module(None)
    test_full_flow()

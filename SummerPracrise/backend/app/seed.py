"""Заполнение БД тестовыми данными.

Запуск:
    python -m app.seed

Создаёт:
    - 4 клиента: 1 админ, 1 менеджер, 2 обычных клиента
      (один из клиентов — «постоянный», уже имеет сумму покупок > 5000)
    - 5 товаров с разными единицами измерения
    - 2 заказа (с разной суммой, чтобы продемонстрировать скидку)
    - По одной доставке и оплате для каждого заказа
    - Несколько отзывов
"""
from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.database import async_session_factory, init_db
from app.models import (
    Cart,
    Client,
    Delivery,
    Order,
    OrderItem,
    Payment,
    Product,
    Review,
)
from app.security import hash_password


PRODUCTS_DATA = [
    {
        "name": "Ноутбук Lenovo IdeaPad",
        "price": Decimal("50000.00"),
        "unit": "шт",
        "description": "15.6\", 8 ГБ ОЗУ, SSD 512 ГБ",
        "stock_quantity": Decimal("10"),
    },
    {
        "name": "Мышь беспроводная Logitech",
        "price": Decimal("1500.00"),
        "unit": "шт",
        "description": "Беспроводная, 2 кнопки + колесо",
        "stock_quantity": Decimal("30"),
    },
    {
        "name": "Клавиатура механическая",
        "price": Decimal("3500.00"),
        "unit": "шт",
        "description": "Подсветка, USB",
        "stock_quantity": Decimal("20"),
    },
    {
        "name": "Кофе зёрна Арабика",
        "price": Decimal("850.00"),
        "unit": "кг",
        "description": "Средняя обжарка, 1 кг",
        "stock_quantity": Decimal("100"),
    },
    {
        "name": "Сок апельсиновый",
        "price": Decimal("120.00"),
        "unit": "л",
        "description": "Натуральный, 1 л",
        "stock_quantity": Decimal("200"),
    },
]

CLIENTS_DATA = [
    {
        "full_name": "Администратор Системы",
        "phone": "+70000000001",
        "email": "admin@shop.ru",
        "password": "admin123",
        "role": "admin",
        "address": "г. Москва, ул. Тверская, 1",
        "total_purchases_amount": Decimal("0"),
    },
    {
        "full_name": "Менеджер Магазина",
        "phone": "+70000000002",
        "email": "manager@shop.ru",
        "password": "manager123",
        "role": "manager",
        "address": "г. Москва, ул. Ленина, 5",
        "total_purchases_amount": Decimal("0"),
    },
    {
        "full_name": "Иванов Иван",
        "phone": "+79991112233",
        "email": "ivan@mail.ru",
        "password": "ivan123",
        "role": "client",
        "address": "г. Москва, ул. Пушкина, 10",
        # Уже «постоянный» клиент —> на следующий заказ будет скидка 2%
        "total_purchases_amount": Decimal("8000"),
    },
    {
        "full_name": "Петров Пётр",
        "phone": "+79994445566",
        "email": "petr@mail.ru",
        "password": "petr123",
        "role": "client",
        "address": "г. Санкт-Петербург, Невский пр., 25",
        "total_purchases_amount": Decimal("0"),
    },
]


async def seed() -> None:
    await init_db()

    async with async_session_factory() as db:
        # --- Клиенты ---
        clients: list[Client] = []
        for data in CLIENTS_DATA:
            password = data.pop("password")
            client = Client(password_hash=hash_password(password), **data)
            db.add(client)
            clients.append(client)
        await db.flush()

        # --- Товары ---
        products: list[Product] = []
        for data in PRODUCTS_DATA:
            product = Product(**data)
            db.add(product)
            products.append(product)
        await db.flush()

        # --- Заказ 1: Иванов (постоянный клиент → скидка 2%) ---
        # Ноутбук 1 шт × 50000 = 50000, скидка 2% = 1000, итого = 49000
        order1 = Order(
            client_id=clients[2].client_id,
            total_amount=Decimal("49000.00"),
            status="delivered",
            delivery_address=clients[2].address,
            delivery_method="Курьер",
            payment_method="Карта",
            discount_applied=Decimal("1000.00"),  # 2% от 50000
        )
        db.add(order1)
        await db.flush()

        db.add_all(
            [
                OrderItem(
                    order_id=order1.order_id,
                    product_id=products[0].product_id,
                    quantity=Decimal("1"),
                    price_at_sale=Decimal("50000.00"),
                ),
            ]
        )
        db.add(
            Delivery(
                order_id=order1.order_id,
                address=clients[2].address,
                delivery_method="Курьер",
                status="delivered",
            )
        )
        db.add(
            Payment(
                order_id=order1.order_id,
                payment_method="Карта",
                payment_amount=Decimal("49000.00"),
                status="paid",
            )
        )

        # --- Заказ 2: Петров (не постоянный → без скидки) ---
        # Мышь 2 шт × 1500 + Кофе 1 кг × 850 = 3850
        order2 = Order(
            client_id=clients[3].client_id,
            total_amount=Decimal("3850.00"),
            status="shipped",
            delivery_address=clients[3].address,
            delivery_method="Самовывоз",
            payment_method="Наличные",
            discount_applied=Decimal("0.00"),
        )
        db.add(order2)
        await db.flush()

        db.add_all(
            [
                OrderItem(
                    order_id=order2.order_id,
                    product_id=products[1].product_id,
                    quantity=Decimal("2"),
                    price_at_sale=Decimal("1500.00"),
                ),
                OrderItem(
                    order_id=order2.order_id,
                    product_id=products[3].product_id,
                    quantity=Decimal("1"),
                    price_at_sale=Decimal("850.00"),
                ),
            ]
        )
        db.add(
            Delivery(
                order_id=order2.order_id,
                address=clients[3].address,
                delivery_method="Самовывоз",
                status="shipped",
            )
        )
        db.add(
            Payment(
                order_id=order2.order_id,
                payment_method="Наличные",
                payment_amount=Decimal("3850.00"),
                status="pending",
            )
        )

        # --- Отзывы ---
        db.add_all(
            [
                Review(
                    product_id=products[0].product_id,
                    client_id=clients[2].client_id,
                    rating=5,
                    review_text="Отличный ноутбук, пользуюсь полгода — нареканий нет.",
                ),
                Review(
                    product_id=products[1].product_id,
                    client_id=clients[3].client_id,
                    rating=4,
                    review_text="Удобная мышь, но немного тяжёлая.",
                ),
                Review(
                    product_id=products[3].product_id,
                    client_id=clients[2].client_id,
                    rating=5,
                    review_text="Свежие зёрна, аромат отличный.",
                ),
            ]
        )

        # --- Пустые корзины для клиентов (для удобства тестов) ---
        db.add_all(
            [
                Cart(client_id=clients[2].client_id),
                Cart(client_id=clients[3].client_id),
            ]
        )

        await db.commit()

    print("✅ Тестовые данные успешно добавлены:")
    print("   Клиенты:")
    for c in CLIENTS_DATA:
        print(f"     - {c['email']} / {c.get('password', '••••••')}  ({c['role']})")
    print("   Товаров: 5")
    print("   Заказов: 2")
    print("   Отзывов: 3")


if __name__ == "__main__":
    asyncio.run(seed())

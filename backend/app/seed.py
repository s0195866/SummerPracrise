"""Заполнение БД тестовыми данными.

Запуск:
    python -m app.seed

Создаёт:
    - 4 клиента: 1 админ, 1 менеджер, 2 обычных клиента
      (один из клиентов — «постоянный», уже имеет сумму покупок > 5000)
    - 12 товаров с разными категориями и брендами
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
        "name": "Samsung Galaxy S24 Ultra 256 ГБ",
        "price": Decimal("89990.00"),
        "unit": "шт",
        "description": "Флагманский смартфон Samsung с камерой 200 МП, S Pen, 12 ГБ ОЗУ",
        "stock_quantity": Decimal("15"),
        "category": "Смартфоны",
        "brand": "Samsung",
    },
    {
        "name": "Apple MacBook Air M3 13\" 8/256 ГБ",
        "price": Decimal("119990.00"),
        "unit": "шт",
        "description": "Ноутбук Apple с процессором M3, 8 ГБ ОЗУ, SSD 256 ГБ",
        "stock_quantity": Decimal("10"),
        "category": "Ноутбуки",
        "brand": "Apple",
    },
    {
        "name": "Sony WH-1000XM5 Беспроводные наушники",
        "price": Decimal("24990.00"),
        "unit": "шт",
        "description": "Беспроводные наушники с активным шумоподавлением",
        "stock_quantity": Decimal("20"),
        "category": "Аудио",
        "brand": "Sony",
    },
    {
        "name": "Apple Watch Series 9 45 мм GPS",
        "price": Decimal("39990.00"),
        "unit": "шт",
        "description": "Умные часы Apple Watch Series 9 с дисплеем 45 мм",
        "stock_quantity": Decimal("12"),
        "category": "Умные часы",
        "brand": "Apple",
    },
    {
        "name": "Xiaomi 14T Pro 256 ГБ Titanium",
        "price": Decimal("69990.00"),
        "unit": "шт",
        "description": "Флагманский смартфон Xiaomi с камерой Leica",
        "stock_quantity": Decimal("8"),
        "category": "Смартфоны",
        "brand": "Xiaomi",
    },
    {
        "name": "ASUS ROG Zephyrus G14 Ryzen 9",
        "price": Decimal("149990.00"),
        "unit": "шт",
        "description": "Игровой ноутбук ASUS ROG с Ryzen 9, RTX 4060, 16 ГБ ОЗУ",
        "stock_quantity": Decimal("5"),
        "category": "Ноутбуки",
        "brand": "ASUS",
    },
    {
        "name": "Ноутбук Lenovo IdeaPad 15.6\"",
        "price": Decimal("50000.00"),
        "unit": "шт",
        "description": "15.6\", 8 ГБ ОЗУ, SSD 512 ГБ",
        "stock_quantity": Decimal("10"),
        "category": "Ноутбуки",
        "brand": "Lenovo",
    },
    {
        "name": "Мышь беспроводная Logitech",
        "price": Decimal("1500.00"),
        "unit": "шт",
        "description": "Беспроводная, 2 кнопки + колесо",
        "stock_quantity": Decimal("30"),
        "category": "Компьютеры",
        "brand": "Logitech",
    },
    {
        "name": "Клавиатура механическая",
        "price": Decimal("3500.00"),
        "unit": "шт",
        "description": "Подсветка, USB",
        "stock_quantity": Decimal("20"),
        "category": "Компьютеры",
        "brand": "Logitech",
    },
    {
        "name": "Наушники Apple AirPods Pro 2",
        "price": Decimal("18990.00"),
        "unit": "шт",
        "description": "Беспроводные наушники Apple с активным шумоподавлением",
        "stock_quantity": Decimal("25"),
        "category": "Аудио",
        "brand": "Apple",
    },
    {
        "name": "Смартфон Google Pixel 8 Pro",
        "price": Decimal("79990.00"),
        "unit": "шт",
        "description": "Камерофон Google с чипом Tensor G3",
        "stock_quantity": Decimal("7"),
        "category": "Смартфоны",
        "brand": "Google",
    },
    {
        "name": "Умные часы Samsung Galaxy Watch 6",
        "price": Decimal("24990.00"),
        "unit": "шт",
        "description": "Умные часы Samsung с Wear OS, 44 мм",
        "stock_quantity": Decimal("14"),
        "category": "Умные часы",
        "brand": "Samsung",
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
        # Проверяем, есть ли уже данные (чтобы не дублировать при перезапуске)
        existing = await db.execute(select(Client).limit(1))
        if existing.scalar_one_or_none() is not None:
            print("✅ Данные уже есть в БД, пропускаем seed.")
            return

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
        order1 = Order(
            client_id=clients[2].client_id,
            total_amount=Decimal("49000.00"),
            status="delivered",
            delivery_address=clients[2].address,
            delivery_method="Курьер",
            payment_method="Карта",
            discount_applied=Decimal("999.99"),
        )
        db.add(order1)
        await db.flush()

        db.add_all(
            [
                OrderItem(
                    order_id=order1.order_id,
                    product_id=products[6].product_id,
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

        # --- Заказ 2: Петров ---
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
                    product_id=products[7].product_id,
                    quantity=Decimal("2"),
                    price_at_sale=Decimal("1500.00"),
                ),
                OrderItem(
                    order_id=order2.order_id,
                    product_id=products[6].product_id,
                    quantity=Decimal("1"),
                    price_at_sale=Decimal("50000.00"),
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
                    review_text="Отличный смартфон, камера впечатляет!",
                ),
                Review(
                    product_id=products[1].product_id,
                    client_id=clients[2].client_id,
                    rating=5,
                    review_text="MacBook Air M3 — лучший выбор для работы и учёбы.",
                ),
                Review(
                    product_id=products[2].product_id,
                    client_id=clients[3].client_id,
                    rating=4,
                    review_text="Отличное шумоподавление, удобные амбушюры.",
                ),
                Review(
                    product_id=products[6].product_id,
                    client_id=clients[2].client_id,
                    rating=5,
                    review_text="Отличный ноутбук, пользуюсь полгода — нареканий нет.",
                ),
                Review(
                    product_id=products[7].product_id,
                    client_id=clients[3].client_id,
                    rating=4,
                    review_text="Удобная мышь, но немного тяжёлая.",
                ),
            ]
        )

        # --- Пустые корзины для клиентов ---
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
    print("   Товаров: 12")
    print("   Заказов: 2")
    print("   Отзывов: 5")


if __name__ == "__main__":
    asyncio.run(seed())
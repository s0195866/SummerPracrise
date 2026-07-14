"""Заполнение БД тестовыми данными."""
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
    # ===== СМАРТФОНЫ =====
    {
        "name": "Xiaomi Redmi 15 256 ГБ черный",
        "price": Decimal("15999.00"),
        "unit": "шт",
        "description": "Дисплей: 6.9\", 2340x1080, IPS, 144 Гц\nСвязь: 3G, 4G, Nano-SIM\nПроцессор: Qualcomm Snapdragon 685, 8 x 2.8 ГГц\nПамять: 8 ГБ / 256 ГБ\nКамера: 50 Мп",
        "stock_quantity": Decimal("15"),
        "category": "Смартфоны",
        "brand": "Xiaomi",
    },
    {
        "name": "Apple iPhone 15 128 ГБ черный",
        "price": Decimal("57999.00"),
        "unit": "шт",
        "description": "Дисплей: 6.1\", 2556x1179, Super Retina XDR, 60 Гц\nСвязь: 3G, 4G, 5G, eSIM, Nano-SIM\nПроцессор: Apple A16 Bionic, 6 x 3.46 ГГц\nПамять: 6 ГБ / 128 ГБ\nКамера: 48+12 Мп",
        "stock_quantity": Decimal("10"),
        "category": "Смартфоны",
        "brand": "Apple",
    },
    {
        "name": "Apple iPhone 17 Pro 256 ГБ серебристый",
        "price": Decimal("124999.00"),
        "unit": "шт",
        "description": "Дисплей: 6.3\", 2622x1206, Super Retina XDR, 120 Гц\nСвязь: 3G, 4G, 5G, eSIM, Nano-SIM\nПроцессор: Apple A19 Pro, 6\nПамять: 12 ГБ / 256 ГБ\nКамера: 48+48+48 Мп",
        "stock_quantity": Decimal("5"),
        "category": "Смартфоны",
        "brand": "Apple",
    },
    {
        "name": "Samsung Galaxy S25 FE 512 ГБ черный",
        "price": Decimal("53999.00"),
        "unit": "шт",
        "description": "Дисплей: 6.7\", 2340x1080, Dynamic AMOLED 2X, 120 Гц\nСвязь: 3G, 4G, 5G, eSIM, Nano-SIM\nПроцессор: Samsung Exynos 2400, 10 x 3.2 ГГц\nПамять: 8 ГБ / 512 ГБ\nКамера: 50+8+12 Мп",
        "stock_quantity": Decimal("8"),
        "category": "Смартфоны",
        "brand": "Samsung",
    },
    {
        "name": "Apple iPhone 17 256 ГБ черный",
        "price": Decimal("84499.00"),
        "unit": "шт",
        "description": "Дисплей: 6.3\", 2622x1206, Super Retina XDR, 120 Гц\nСвязь: 3G, 4G, 5G, eSIM, Nano-SIM\nПроцессор: Apple A19, 6\nПамять: 8 ГБ / 256 ГБ\nКамера: 48+48 Мп",
        "stock_quantity": Decimal("7"),
        "category": "Смартфоны",
        "brand": "Apple",
    },
    # ===== НОУТБУКИ =====
    {
        "name": "HUAWEI MateBook D 16 2024 MCLF-X серый",
        "price": Decimal("58999.00"),
        "unit": "шт",
        "description": "Процессор: Intel Core i5-12450H (4 + 4 x 2 ГГц + 1.5 ГГц)\nПамять: ОЗУ/16 ГБ, SSD/512 ГБ\nОС: без ОС\nЭкран: 16\" (1920x1200)\nВес: 1.72 кг",
        "stock_quantity": Decimal("10"),
        "category": "Ноутбуки",
        "brand": "HUAWEI",
    },
    {
        "name": "HONOR MagicBook X16 AMD 2025 серый",
        "price": Decimal("51999.00"),
        "unit": "шт",
        "description": "Процессор: AMD Ryzen 5 6600H (6 x 3.3 ГГц)\nПамять: ОЗУ/16 ГБ, SSD/512 ГБ\nОС: без ОС\nЭкран: 16\" (1920x1200)\nВес: 1.74 кг",
        "stock_quantity": Decimal("8"),
        "category": "Ноутбуки",
        "brand": "HONOR",
    },
    {
        "name": "ASUS Vivobook S S3607VA-RP103 серый",
        "price": Decimal("59999.00"),
        "unit": "шт",
        "description": "Процессор: Intel Core 5 210H (4 + 4 x 2.2 ГГц + 1.6 ГГц)\nПамять: ОЗУ/16 ГБ, SSD/512 ГБ\nОС: без ОС\nЭкран: 16\" (1920x1200)\nВес: 1.8 кг",
        "stock_quantity": Decimal("6"),
        "category": "Ноутбуки",
        "brand": "ASUS",
    },
    {
        "name": "ASUS TUF Gaming FA808UM-S8030 серый",
        "price": Decimal("123999.00"),
        "unit": "шт",
        "description": "Процессор: AMD Ryzen 7 260 (8 x 3.8 ГГц)\nПамять: ОЗУ/16 ГБ, SSD/512 ГБ\nВидеокарта: GeForce RTX 5060 для ноутбуков / 8 ГБ\nОС: без ОС\nЭкран: 18\" (1920x1200)\nВес: 2.6 кг",
        "stock_quantity": Decimal("4"),
        "category": "Ноутбуки",
        "brand": "ASUS",
    },
    {
        "name": "Apple MacBook Air M4 серебристый",
        "price": Decimal("105999.00"),
        "unit": "шт",
        "description": "Процессор: Apple M4 10-core (4 + 6)\nПамять: ОЗУ/16 ГБ, SSD/256 ГБ\nОС: macOS\nЭкран: 13.6\" (2560x1664)\nВес: 1.24 кг\nРаскладка: английская/русская",
        "stock_quantity": Decimal("7"),
        "category": "Ноутбуки",
        "brand": "Apple",
    },
    # ===== КОМПЬЮТЕРЫ =====
    {
        "name": "ARDOR GAMING NEO M171",
        "price": Decimal("80299.00"),
        "unit": "шт",
        "description": "Процессор: Intel Core i5-12400F, 6 x 2.5 ГГц - 4.4 ГГц\nОЗУ: 16 ГБ, DDR4\nSSD: 1 TB M.2 PCIe\nВидеокарта: GeForce RTX 3050 8 ГБ\nЧипсет: Intel H610\nМощность БП: 500 Вт",
        "stock_quantity": Decimal("5"),
        "category": "Компьютеры",
        "brand": "ARDOR GAMING",
    },
    {
        "name": "ARDOR GAMING NEO M279",
        "price": Decimal("91299.00"),
        "unit": "шт",
        "description": "Процессор: AMD Ryzen 5 8400F, 6 x 4.2 ГГц - 4.7 ГГц\nОЗУ: 16 ГБ, DDR5\nSSD: 1 TB M.2 PCIe\nВидеокарта: GeForce RTX 5050 8 ГБ\nЧипсет: AMD A620\nМощность БП: 500 Вт",
        "stock_quantity": Decimal("4"),
        "category": "Компьютеры",
        "brand": "ARDOR GAMING",
    },
    {
        "name": "ARDOR GAMING NEO M299",
        "price": Decimal("62999.00"),
        "unit": "шт",
        "description": "Процессор: AMD Ryzen 5 5500, 6 x 3.6 ГГц - 4.2 ГГц\nОЗУ: 16 ГБ, DDR4\nSSD: 480 GB 2.5\" SATA\nВидеокарта: GeForce RTX 3050 6 ГБ\nЧипсет: AMD A520\nМощность БП: 500 Вт",
        "stock_quantity": Decimal("6"),
        "category": "Компьютеры",
        "brand": "ARDOR GAMING",
    },
    {
        "name": "ARDOR GAMING NEO M276",
        "price": Decimal("89799.00"),
        "unit": "шт",
        "description": "Процессор: Intel Core i5-12400F, 6 x 2.5 ГГц - 4.4 ГГц\nОЗУ: 16 ГБ, DDR4\nSSD: 1 TB M.2 PCIe\nВидеокарта: GeForce RTX 5060 8 ГБ\nЧипсет: Intel H610\nМощность БП: 600 Вт",
        "stock_quantity": Decimal("3"),
        "category": "Компьютеры",
        "brand": "ARDOR GAMING",
    },
    {
        "name": "ARDOR GAMING NEO M256",
        "price": Decimal("100999.00"),
        "unit": "шт",
        "description": "Процессор: AMD Ryzen 5 7500F, 6 x 3.7 ГГц - 5 ГГц\nОЗУ: 16 ГБ, DDR5\nSSD: 1 TB M.2 PCIe\nВидеокарта: GeForce RTX 5060 8 ГБ\nЧипсет: AMD B650\nМощность БП: 500 Вт",
        "stock_quantity": Decimal("3"),
        "category": "Компьютеры",
        "brand": "ARDOR GAMING",
    },
    # ===== АУДИО =====
    {
        "name": "Apple EarPods (Type-C) белый 2023",
        "price": Decimal("2799.00"),
        "unit": "шт",
        "description": "Тип: вкладыши\nТип соединения: проводной, кабель 1.2 м\nДиапазон частот: 20 Гц - 20000 Гц\nСопротивление: 16Ω",
        "stock_quantity": Decimal("30"),
        "category": "Аудио",
        "brand": "Apple",
    },
    {
        "name": "Apple AirPods Pro 3 белый 2025",
        "price": Decimal("23999.00"),
        "unit": "шт",
        "description": "Тип: внутриканальные\nТип соединения: Bluetooth 5.3\nАктивное шумоподавление: есть\nВремя работы: до 10 ч\nСтепень защиты: IP57",
        "stock_quantity": Decimal("12"),
        "category": "Аудио",
        "brand": "Apple",
    },
    {
        "name": "Apple AirPods 4 ANC белый 2024",
        "price": Decimal("17999.00"),
        "unit": "шт",
        "description": "Тип: вкладыши\nТип соединения: Bluetooth 5.3\nАктивное шумоподавление: есть\nВремя работы: до 5 ч\nСтепень защиты: IP54\nБеспроводная зарядка: есть",
        "stock_quantity": Decimal("15"),
        "category": "Аудио",
        "brand": "Apple",
    },
    {
        "name": "Xiaomi Redmi Buds 6 Play черный 2024",
        "price": Decimal("999.00"),
        "unit": "шт",
        "description": "Тип: внутриканальные\nТип соединения: Bluetooth 5.4\nВремя работы: до 7.5 ч\nСтепень защиты: IPX4\nДиапазон частот: 20 Гц - 20000 Гц\nСопротивление: 16Ω",
        "stock_quantity": Decimal("25"),
        "category": "Аудио",
        "brand": "Xiaomi",
    },
    {
        "name": "Samsung Galaxy Buds 4 Pro черный 2026",
        "price": Decimal("15399.00"),
        "unit": "шт",
        "description": "Тип: внутриканальные\nТип соединения: Bluetooth 6.1\nАктивное шумоподавление: есть\nВремя работы: до 7 ч\nСтепень защиты: IP57\nДиапазон частот: 20 Гц - 20000 Гц",
        "stock_quantity": Decimal("10"),
        "category": "Аудио",
        "brand": "Samsung",
    },
    # ===== УМНЫЕ ЧАСЫ =====
    {
        "name": "Apple Watch SE 3 40 mm",
        "price": Decimal("24699.00"),
        "unit": "шт",
        "description": "Экран: 1.57\" OLED, 394x324\nИзмерения: сон, пульс, стресс\nВремя работы: 32 ч\nСвязь: Bluetooth, NFC, Wi-Fi\nНавигация: GPS",
        "stock_quantity": Decimal("8"),
        "category": "Умные часы",
        "brand": "Apple",
    },
    {
        "name": "Xiaomi Smart Band 10",
        "price": Decimal("3599.00"),
        "unit": "шт",
        "description": "Экран: 1.72\" AMOLED, 520x212\nИзмерения: шаги, сон, пульс\nСтепень защиты: IP68\nВремя работы: 504 ч\nСвязь: Bluetooth",
        "stock_quantity": Decimal("20"),
        "category": "Умные часы",
        "brand": "Xiaomi",
    },
    {
        "name": "Xiaomi REDMI Watch 5 Active",
        "price": Decimal("2999.00"),
        "unit": "шт",
        "description": "Экран: 2\" IPS, 385x320\nИзмерения: шаги, калории, сон, пульс\nСтепень защиты: IPX8\nВремя работы: 432 ч\nСвязь: Bluetooth",
        "stock_quantity": Decimal("15"),
        "category": "Умные часы",
        "brand": "Xiaomi",
    },
    {
        "name": "Apple Watch Series 11 42 mm",
        "price": Decimal("34799.00"),
        "unit": "шт",
        "description": "Экран: 1.77\" OLED, 374x446\nИзмерения: сон, пульс, кислород, стресс\nВремя работы: 38 ч\nСвязь: Bluetooth, NFC, Wi-Fi\nНавигация: GPS",
        "stock_quantity": Decimal("6"),
        "category": "Умные часы",
        "brand": "Apple",
    },
    {
        "name": "Samsung Galaxy Watch8 40 mm LTE",
        "price": Decimal("22399.00"),
        "unit": "шт",
        "description": "Экран: 1.34\" Super AMOLED, 438x438\nИзмерения: давление, шаги, сон\nСтепень защиты: IP68\nСвязь: Bluetooth, NFC, Wi-Fi\nНавигация: GPS",
        "stock_quantity": Decimal("7"),
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
        # Уже «постоянный» клиент
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

        # --- Заказ 1: Иванов ---
        order1 = Order(
            client_id=clients[2].client_id,
            total_amount=Decimal("15999.00"),
            status="delivered",
            delivery_address=clients[2].address,
            delivery_method="Курьер",
            payment_method="Карта",
            discount_applied=Decimal("999.99"),
        )
        db.add(order1)
        await db.flush()

        db.add_all([
            OrderItem(
                order_id=order1.order_id,
                product_id=products[0].product_id,
                quantity=Decimal("1"),
                price_at_sale=Decimal("15999.00"),
            ),
        ])
        db.add(Delivery(order_id=order1.order_id, address=clients[2].address, delivery_method="Курьер", status="delivered"))
        db.add(Payment(order_id=order1.order_id, payment_method="Карта", payment_amount=Decimal("15999.00"), status="paid"))

        # --- Заказ 2: Петров ---
        order2 = Order(
            client_id=clients[3].client_id,
            total_amount=Decimal("2799.00"),
            status="shipped",
            delivery_address=clients[3].address,
            delivery_method="Самовывоз",
            payment_method="Наличные",
            discount_applied=Decimal("0.00"),
        )
        db.add(order2)
        await db.flush()

        db.add_all([
            OrderItem(
                order_id=order2.order_id,
                product_id=products[15].product_id,
                quantity=Decimal("1"),
                price_at_sale=Decimal("2799.00"),
            ),
        ])
        db.add(Delivery(order_id=order2.order_id, address=clients[3].address, delivery_method="Самовывоз", status="shipped"))
        db.add(Payment(order_id=order2.order_id, payment_method="Наличные", payment_amount=Decimal("2799.00"), status="pending"))

        # --- Отзывы ---
        db.add_all([
            Review(product_id=products[0].product_id, client_id=clients[2].client_id, rating=5, review_text="Отличный смартфон за свои деньги!"),
            Review(product_id=products[5].product_id, client_id=clients[2].client_id, rating=4, review_text="Хороший ноутбук для работы."),
            Review(product_id=products[15].product_id, client_id=clients[3].client_id, rating=5, review_text="Классические наушники, отличный звук."),
            Review(product_id=products[10].product_id, client_id=clients[2].client_id, rating=5, review_text="Мощный ПК для игр!"),
            Review(product_id=products[20].product_id, client_id=clients[3].client_id, rating=4, review_text="Хорошие часы за свою цену."),
        ])

        # --- Пустые корзины ---
        db.add_all([Cart(client_id=clients[2].client_id), Cart(client_id=clients[3].client_id)])

        await db.commit()

    print("✅ Тестовые данные успешно добавлены:")
    print("   Клиенты: 4")
    print("   Товаров: 25")
    print("   Заказов: 2")
    print("   Отзывов: 5")


if __name__ == "__main__":
    asyncio.run(seed())
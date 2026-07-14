-- 
-- Скрипт создания всех таблиц базы данных summer_practice
-- с тестовыми данными для интернет-магазина SIGMA-TECH
-- 
-- Запуск: psql -U postgres -d summer_practice -f init.sql
-- Пароль суперпользователя: 123
--

DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS cart_item CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS delivery CASCADE;
DROP TABLE IF EXISTS order_item CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS client CASCADE;

CREATE TABLE client (
    client_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    reg_date DATE NOT NULL DEFAULT CURRENT_DATE,
    role VARCHAR(20) NOT NULL DEFAULT 'client',
    total_purchases_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT ck_client_role CHECK (role IN ('client', 'manager', 'admin'))
);

CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    description VARCHAR(2000),
    stock_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    category VARCHAR(100),
    brand VARCHAR(100),
    CONSTRAINT ck_product_price_non_negative CHECK (price >= 0),
    CONSTRAINT ck_product_stock_non_negative CHECK (stock_quantity >= 0),
    CONSTRAINT ck_product_unit CHECK (unit IN ('шт', 'кг', 'л'))
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES client(client_id) ON DELETE CASCADE,
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    delivery_address VARCHAR(500),
    delivery_method VARCHAR(50),
    payment_method VARCHAR(50),
    discount_applied NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT ck_orders_status CHECK (status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')),
    CONSTRAINT ck_orders_total_non_negative CHECK (total_amount >= 0)
);

CREATE TABLE order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES product(product_id),
    quantity NUMERIC(10, 2) NOT NULL,
    price_at_sale NUMERIC(10, 2) NOT NULL,
    CONSTRAINT ck_order_item_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_order_item_price_non_negative CHECK (price_at_sale >= 0)
);

CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    client_id INTEGER UNIQUE NOT NULL REFERENCES client(client_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_item (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES cart(cart_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL,
    CONSTRAINT ck_cart_item_quantity_positive CHECK (quantity > 0)
);

CREATE TABLE delivery (
    delivery_id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    address VARCHAR(500) NOT NULL,
    delivery_date DATE,
    delivery_method VARCHAR(50) NOT NULL DEFAULT 'Курьер',
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    CONSTRAINT ck_delivery_status CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled'))
);

CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    payment_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_payment_status CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    CONSTRAINT ck_payment_amount_non_negative CHECK (payment_amount >= 0)
);

CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES client(client_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    review_text VARCHAR(2000),
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_review_rating_range CHECK (rating BETWEEN 1 AND 5)
);

-- ================================================================
-- DATA
-- ================================================================

INSERT INTO client (full_name, phone, email, password_hash, address, role, total_purchases_amount)
VALUES
    ('Администратор Системы', '+70000000001', 'admin@shop.ru', '$2b$12$5Z0VBxqTZe080EQliH6lCeXF.yzPAbYabX/CKtBBCbWkxLov4pwNa', 'г. Москва, ул. Тверская, 1', 'admin', 0.00),
    ('Менеджер Магазина', '+70000000002', 'manager@shop.ru', '$2b$12$Le8OERZfdDDMyu5Y7ST6N.kNmbNw94bNeuPBWdafEz0rX6A6WyKH6', 'г. Москва, ул. Ленина, 5', 'manager', 0.00),
    ('Иванов Иван', '+79991112233', 'ivan@mail.ru', '$2b$12$4nTkkWmQPFeIaK0.N0M4jO.z8FadZ7tT6CdUI4BMXMkM6TljQNW6m', 'г. Москва, ул. Пушкина, 10', 'client', 8000.00),
    ('Петров Пётр', '+79994445566', 'petr@mail.ru', '$2b$12$YHaKZY8zINPMe8869BKon.u5dwYhUY0OZc6UJIwCGdlHdLwC8J5aC', 'г. Санкт-Петербург, Невский пр., 25', 'client', 0.00);

INSERT INTO product (name, price, unit, description, stock_quantity, category, brand)
VALUES
    -- Смартфоны (5 шт)
    ('Xiaomi Redmi 15 256 ГБ черный', 15999.00, 'шт', 'Дисплей: 6.9", 2340x1080, IPS, 144 Гц
Связь: 3G, 4G, Nano-SIM
Процессор: Qualcomm Snapdragon 685, 8 x 2.8 ГГц
Память: 8 ГБ / 256 ГБ
Камера: 50 Мп', 15.00, 'Смартфоны', 'Xiaomi'),
    ('Apple iPhone 15 128 ГБ черный', 57999.00, 'шт', 'Дисплей: 6.1", 2556x1179, Super Retina XDR, 60 Гц
Связь: 3G, 4G, 5G, eSIM, Nano-SIM
Процессор: Apple A16 Bionic, 6 x 3.46 ГГц
Память: 6 ГБ / 128 ГБ
Камера: 48+12 Мп', 10.00, 'Смартфоны', 'Apple'),
    ('Apple iPhone 17 Pro 256 ГБ серебристый', 124999.00, 'шт', 'Дисплей: 6.3", 2622x1206, Super Retina XDR, 120 Гц
Связь: 3G, 4G, 5G, eSIM, Nano-SIM
Процессор: Apple A19 Pro, 6
Память: 12 ГБ / 256 ГБ
Камера: 48+48+48 Мп', 5.00, 'Смартфоны', 'Apple'),
    ('Samsung Galaxy S25 FE 512 ГБ черный', 53999.00, 'шт', 'Дисплей: 6.7", 2340x1080, Dynamic AMOLED 2X, 120 Гц
Связь: 3G, 4G, 5G, eSIM, Nano-SIM
Процессор: Samsung Exynos 2400, 10 x 3.2 ГГц
Память: 8 ГБ / 512 ГБ
Камера: 50+8+12 Мп', 8.00, 'Смартфоны', 'Samsung'),
    ('Apple iPhone 17 256 ГБ черный', 84499.00, 'шт', 'Дисплей: 6.3", 2622x1206, Super Retina XDR, 120 Гц
Связь: 3G, 4G, 5G, eSIM, Nano-SIM
Процессор: Apple A19, 6
Память: 8 ГБ / 256 ГБ
Камера: 48+48 Мп', 7.00, 'Смартфоны', 'Apple'),
    -- Ноутбуки (5 шт)
    ('HUAWEI MateBook D 16 2024 MCLF-X серый', 58999.00, 'шт', 'Процессор: Intel Core i5-12450H (4 + 4 x 2 ГГц + 1.5 ГГц)
Память: ОЗУ/16 ГБ, SSD/512 ГБ
ОС: без ОС
Экран: 16" (1920x1200)
Вес: 1.72 кг', 10.00, 'Ноутбуки', 'HUAWEI'),
    ('HONOR MagicBook X16 AMD 2025 серый', 51999.00, 'шт', 'Процессор: AMD Ryzen 5 6600H (6 x 3.3 ГГц)
Память: ОЗУ/16 ГБ, SSD/512 ГБ
ОС: без ОС
Экран: 16" (1920x1200)
Вес: 1.74 кг', 8.00, 'Ноутбуки', 'HONOR'),
    ('ASUS Vivobook S S3607VA-RP103 серый', 59999.00, 'шт', 'Процессор: Intel Core 5 210H (4 + 4 x 2.2 ГГц + 1.6 ГГц)
Память: ОЗУ/16 ГБ, SSD/512 ГБ
ОС: без ОС
Экран: 16" (1920x1200)
Вес: 1.8 кг', 6.00, 'Ноутбуки', 'ASUS'),
    ('ASUS TUF Gaming FA808UM-S8030 серый', 123999.00, 'шт', 'Процессор: AMD Ryzen 7 260 (8 x 3.8 ГГц)
Память: ОЗУ/16 ГБ, SSD/512 ГБ
Видеокарта: GeForce RTX 5060 для ноутбуков / 8 ГБ
ОС: без ОС
Экран: 18" (1920x1200)
Вес: 2.6 кг', 4.00, 'Ноутбуки', 'ASUS'),
    ('Apple MacBook Air M4 серебристый', 105999.00, 'шт', 'Процессор: Apple M4 10-core (4 + 6)
Память: ОЗУ/16 ГБ, SSD/256 ГБ
ОС: macOS
Экран: 13.6" (2560x1664)
Вес: 1.24 кг
Раскладка: английская/русская', 7.00, 'Ноутбуки', 'Apple'),
    -- Компьютеры (5 шт)
    ('ARDOR GAMING NEO M171', 80299.00, 'шт', 'Процессор: Intel Core i5-12400F, 6 x 2.5 ГГц - 4.4 ГГц
ОЗУ: 16 ГБ, DDR4
SSD: 1 TB M.2 PCIe
Видеокарта: GeForce RTX 3050 8 ГБ
Чипсет: Intel H610
Мощность БП: 500 Вт', 5.00, 'Компьютеры', 'ARDOR GAMING'),
    ('ARDOR GAMING NEO M279', 91299.00, 'шт', 'Процессор: AMD Ryzen 5 8400F, 6 x 4.2 ГГц - 4.7 ГГц
ОЗУ: 16 ГБ, DDR5
SSD: 1 TB M.2 PCIe
Видеокарта: GeForce RTX 5050 8 ГБ
Чипсет: AMD A620
Мощность БП: 500 Вт', 4.00, 'Компьютеры', 'ARDOR GAMING'),
    ('ARDOR GAMING NEO M299', 62999.00, 'шт', 'Процессор: AMD Ryzen 5 5500, 6 x 3.6 ГГц - 4.2 ГГц
ОЗУ: 16 ГБ, DDR4
SSD: 480 GB 2.5" SATA
Видеокарта: GeForce RTX 3050 6 ГБ
Чипсет: AMD A520
Мощность БП: 500 Вт', 6.00, 'Компьютеры', 'ARDOR GAMING'),
    ('ARDOR GAMING NEO M276', 89799.00, 'шт', 'Процессор: Intel Core i5-12400F, 6 x 2.5 ГГц - 4.4 ГГц
ОЗУ: 16 ГБ, DDR4
SSD: 1 TB M.2 PCIe
Видеокарта: GeForce RTX 5060 8 ГБ
Чипсет: Intel H610
Мощность БП: 600 Вт', 3.00, 'Компьютеры', 'ARDOR GAMING'),
    ('ARDOR GAMING NEO M256', 100999.00, 'шт', 'Процессор: AMD Ryzen 5 7500F, 6 x 3.7 ГГц - 5 ГГц
ОЗУ: 16 ГБ, DDR5
SSD: 1 TB M.2 PCIe
Видеокарта: GeForce RTX 5060 8 ГБ
Чипсет: AMD B650
Мощность БП: 500 Вт', 3.00, 'Компьютеры', 'ARDOR GAMING'),
    -- Аудио (5 шт)
    ('Apple EarPods (Type-C) белый 2023', 2799.00, 'шт', 'Тип: вкладыши
Тип соединения: проводной, кабель 1.2 м
Диапазон частот: 20 Гц - 20000 Гц
Сопротивление: 16Ом', 30.00, 'Аудио', 'Apple'),
    ('Apple AirPods Pro 3 белый 2025', 23999.00, 'шт', 'Тип: внутриканальные
Тип соединения: Bluetooth 5.3
Активное шумоподавление: есть
Время работы: до 10 ч
Степень защиты: IP57', 12.00, 'Аудио', 'Apple'),
    ('Apple AirPods 4 ANC белый 2024', 17999.00, 'шт', 'Тип: вкладыши
Тип соединения: Bluetooth 5.3
Активное шумоподавление: есть
Время работы: до 5 ч
Степень защиты: IP54
Беспроводная зарядка: есть', 15.00, 'Аудио', 'Apple'),
    ('Xiaomi Redmi Buds 6 Play черный 2024', 999.00, 'шт', 'Тип: внутриканальные
Тип соединения: Bluetooth 5.4
Время работы: до 7.5 ч
Степень защиты: IPX4
Диапазон частот: 20 Гц - 20000 Гц
Сопротивление: 16Ом', 25.00, 'Аудио', 'Xiaomi'),
    ('Samsung Galaxy Buds 4 Pro черный 2026', 15399.00, 'шт', 'Тип: внутриканальные
Тип соединения: Bluetooth 6.1
Активное шумоподавление: есть
Время работы: до 7 ч
Степень защиты: IP57
Диапазон частот: 20 Гц - 20000 Гц', 10.00, 'Аудио', 'Samsung'),
    -- Умные часы (5 шт)
    ('Apple Watch SE 3 40 mm', 24699.00, 'шт', 'Экран: 1.57" OLED, 394x324
Измерения: сон, пульс, стресс
Время работы: 32 ч
Связь: Bluetooth, NFC, Wi-Fi
Навигация: GPS', 8.00, 'Умные часы', 'Apple'),
    ('Xiaomi Smart Band 10', 3599.00, 'шт', 'Экран: 1.72" AMOLED, 520x212
Измерения: шаги, сон, пульс
Степень защиты: IP68
Время работы: 504 ч
Связь: Bluetooth', 20.00, 'Умные часы', 'Xiaomi'),
    ('Xiaomi REDMI Watch 5 Active', 2999.00, 'шт', 'Экран: 2" IPS, 385x320
Измерения: шаги, калории, сон, пульс
Степень защиты: IPX8
Время работы: 432 ч
Связь: Bluetooth', 15.00, 'Умные часы', 'Xiaomi'),
    ('Apple Watch Series 11 42 mm', 34799.00, 'шт', 'Экран: 1.77" OLED, 374x446
Измерения: сон, пульс, кислород, стресс
Время работы: 38 ч
Связь: Bluetooth, NFC, Wi-Fi
Навигация: GPS', 6.00, 'Умные часы', 'Apple'),
    ('Samsung Galaxy Watch8 40 mm LTE', 22399.00, 'шт', 'Экран: 1.34" Super AMOLED, 438x438
Измерения: давление, шаги, сон
Степень защиты: IP68
Связь: Bluetooth, NFC, Wi-Fi
Навигация: GPS', 7.00, 'Умные часы', 'Samsung');

-- Заказы
INSERT INTO orders (client_id, total_amount, status, delivery_address, delivery_method, payment_method, discount_applied)
VALUES (3, 15999.00, 'delivered', 'г. Москва, ул. Пушкина, 10', 'Курьер', 'Карта', 999.99);

INSERT INTO orders (client_id, total_amount, status, delivery_address, delivery_method, payment_method, discount_applied)
VALUES (4, 2799.00, 'shipped', 'г. Санкт-Петербург, Невский пр., 25', 'Самовывоз', 'Наличные', 0.00);

-- Состав заказов
INSERT INTO order_item (order_id, product_id, quantity, price_at_sale)
VALUES (1, 1, 1.00, 15999.00);

INSERT INTO order_item (order_id, product_id, quantity, price_at_sale)
VALUES (2, 16, 1.00, 2799.00);

-- Доставки
INSERT INTO delivery (order_id, address, delivery_method, status)
VALUES (1, 'г. Москва, ул. Пушкина, 10', 'Курьер', 'delivered');

INSERT INTO delivery (order_id, address, delivery_method, status)
VALUES (2, 'г. Санкт-Петербург, Невский пр., 25', 'Самовывоз', 'shipped');

-- Оплаты
INSERT INTO payment (order_id, payment_method, payment_amount, status)
VALUES (1, 'Карта', 15999.00, 'paid');

INSERT INTO payment (order_id, payment_method, payment_amount, status)
VALUES (2, 'Наличные', 2799.00, 'pending');

-- Отзывы
INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (1, 3, 5, 'Отличный смартфон за свои деньги!');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (6, 3, 4, 'Хороший ноутбук для работы.');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (16, 4, 5, 'Классические наушники, отличный звук.');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (11, 3, 5, 'Мощный ПК для игр!');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (21, 4, 4, 'Хорошие часы за свою цену.');

-- Пустые корзины
INSERT INTO cart (client_id) VALUES (3);
INSERT INTO cart (client_id) VALUES (4);

SELECT count(*) AS total_clients FROM client;
SELECT count(*) AS total_products FROM product;
SELECT count(*) AS total_orders FROM orders;
SELECT count(*) AS total_reviews FROM review;
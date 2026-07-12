-- 
-- Скрипт создания всех таблиц базы данных summer_practice
-- с тестовыми данными для интернет-магазина SIGMA-TECH
-- 
-- Запуск: psql -U postgres -d summer_practice -f init.sql
-- Пароль суперпользователя: 123
--

-- ================================================================
-- 1. Клиент (client)
-- ================================================================
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
    ('Samsung Galaxy S24 Ultra 256 ГБ', 89990.00, 'шт', 'Флагманский смартфон Samsung с камерой 200 МП, S Pen, 12 ГБ ОЗУ', 15.00, 'Смартфоны', 'Samsung'),
    ('Apple MacBook Air M3 13" 8/256 ГБ', 119990.00, 'шт', 'Ноутбук Apple с процессором M3, 8 ГБ ОЗУ, SSD 256 ГБ', 10.00, 'Ноутбуки', 'Apple'),
    ('Sony WH-1000XM5 Беспроводные наушники', 24990.00, 'шт', 'Беспроводные наушники с активным шумоподавлением', 20.00, 'Аудио', 'Sony'),
    ('Apple Watch Series 9 45 мм GPS', 39990.00, 'шт', 'Умные часы Apple Watch Series 9 с дисплеем 45 мм', 12.00, 'Умные часы', 'Apple'),
    ('Xiaomi 14T Pro 256 ГБ Titanium', 69990.00, 'шт', 'Флагманский смартфон Xiaomi с камерой Leica', 8.00, 'Смартфоны', 'Xiaomi'),
    ('ASUS ROG Zephyrus G14 Ryzen 9', 149990.00, 'шт', 'Игровой ноутбук ASUS ROG с Ryzen 9, RTX 4060, 16 ГБ ОЗУ', 5.00, 'Ноутбуки', 'ASUS'),
    ('Ноутбук Lenovo IdeaPad 15.6"', 50000.00, 'шт', '15.6", 8 ГБ ОЗУ, SSD 512 ГБ', 10.00, 'Ноутбуки', 'Lenovo'),
    ('Мышь беспроводная Logitech', 1500.00, 'шт', 'Беспроводная, 2 кнопки + колесо', 30.00, 'Компьютеры', 'Logitech'),
    ('Клавиатура механическая', 3500.00, 'шт', 'Подсветка, USB', 20.00, 'Компьютеры', 'Logitech'),
    ('Наушники Apple AirPods Pro 2', 18990.00, 'шт', 'Беспроводные наушники Apple с активным шумоподавлением', 25.00, 'Аудио', 'Apple'),
    ('Смартфон Google Pixel 8 Pro', 79990.00, 'шт', 'Камерофон Google с чипом Tensor G3', 7.00, 'Смартфоны', 'Google'),
    ('Умные часы Samsung Galaxy Watch 6', 24990.00, 'шт', 'Умные часы Samsung с Wear OS, 44 мм', 14.00, 'Умные часы', 'Samsung');

INSERT INTO orders (client_id, total_amount, status, delivery_address, delivery_method, payment_method, discount_applied)
VALUES (3, 49000.00, 'delivered', 'г. Москва, ул. Пушкина, 10', 'Курьер', 'Карта', 999.99);

INSERT INTO orders (client_id, total_amount, status, delivery_address, delivery_method, payment_method, discount_applied)
VALUES (4, 3850.00, 'shipped', 'г. Санкт-Петербург, Невский пр., 25', 'Самовывоз', 'Наличные', 0.00);

INSERT INTO order_item (order_id, product_id, quantity, price_at_sale)
VALUES (1, 7, 1.00, 50000.00);

INSERT INTO order_item (order_id, product_id, quantity, price_at_sale)
VALUES (2, 8, 2.00, 1500.00);

INSERT INTO order_item (order_id, product_id, quantity, price_at_sale)
VALUES (2, 7, 1.00, 50000.00);

INSERT INTO delivery (order_id, address, delivery_method, status)
VALUES (1, 'г. Москва, ул. Пушкина, 10', 'Курьер', 'delivered');

INSERT INTO delivery (order_id, address, delivery_method, status)
VALUES (2, 'г. Санкт-Петербург, Невский пр., 25', 'Самовывоз', 'shipped');

INSERT INTO payment (order_id, payment_method, payment_amount, status)
VALUES (1, 'Карта', 49000.00, 'paid');

INSERT INTO payment (order_id, payment_method, payment_amount, status)
VALUES (2, 'Наличные', 3850.00, 'pending');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (1, 3, 5, 'Отличный смартфон, камера впечатляет!');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (2, 3, 5, 'MacBook Air M3 - лучший выбор для работы и учёбы.');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (3, 4, 4, 'Отличное шумоподавление, удобные амбушюры.');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (7, 3, 5, 'Отличный ноутбук, пользуюсь полгода - нареканий нет.');

INSERT INTO review (product_id, client_id, rating, review_text)
VALUES (8, 4, 4, 'Удобная мышь, но немного тяжёлая.');

INSERT INTO cart (client_id) VALUES (3);
INSERT INTO cart (client_id) VALUES (4);

SELECT count(*) AS total_clients FROM client;
SELECT count(*) AS total_products FROM product;
SELECT count(*) AS total_orders FROM orders;
SELECT count(*) AS total_reviews FROM review;
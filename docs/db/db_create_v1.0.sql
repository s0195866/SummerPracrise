-- Таблица клиентов
CREATE TABLE client (
    client_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    reg_date DATE NOT NULL DEFAULT CURRENT_DATE,
    role VARCHAR(20) DEFAULT 'client', -- 'admin', 'manager', 'client'
    total_purchases_amount NUMERIC(10,2) DEFAULT 0
);

-- Таблица товаров
CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    stock_quantity NUMERIC(10,2) NOT NULL
);

-- Таблица заказов
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES client(client_id) ON DELETE CASCADE,
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'new'
);

-- Таблица состава заказа
CREATE TABLE order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES product(product_id),
    quantity NUMERIC(10,2) NOT NULL,
    price_at_sale NUMERIC(10,2) NOT NULL
);
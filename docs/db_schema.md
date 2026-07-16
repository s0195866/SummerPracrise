# Схема базы данных

Краткая схема БД проекта интернет-магазина. Источник: `backend/app/models.py`.

## Таблицы и ключи

### 1. `client` — клиенты / пользователи
| Поле | Тип | Описание |
|---|---|---|
| **client_id** | int PK | идентификатор |
| full_name | varchar(200) | ФИО |
| phone | varchar(20) | телефон |
| email | varchar(100) UNIQUE | email |
| password_hash | varchar(255) | хеш пароля |
| address | varchar(500) | адрес |
| reg_date | date | дата регистрации (default today) |
| role | varchar(20) | `client` / `manager` / `admin` |
| is_blocked | bool | блокировка |
| total_purchases_amount | numeric(12,2) | сумма покупок (для «постоянного» клиента) |

### 2. `product` — товары
| Поле | Тип | Описание |
|---|---|---|
| **product_id** | int PK | идентификатор |
| name | varchar(200) | название |
| price | numeric(10,2) | цена |
| unit | varchar(10) | `шт` / `кг` / `л` |
| description | varchar(2000) | описание |
| stock_quantity | numeric(12,2) | остаток на складе |
| category | varchar(100) | категория |
| brand | varchar(100) | бренд |
| photo | varchar(500) | путь к фото |

### 3. `orders` — заказы
| Поле | Тип | Описание |
|---|---|---|
| **order_id** | int PK | идентификатор |
| client_id | int FK → `client.client_id` | кто заказал |
| sale_date | timestamp | дата оформления |
| delivery_date | date | дата доставки |
| total_amount | numeric(12,2) | итог (со скидкой) |
| status | varchar(30) | `new`/`processing`/`shipped`/`delivered`/`cancelled` |
| delivery_address | varchar(500) | адрес доставки |
| delivery_method | varchar(50) | способ доставки |
| payment_method | varchar(50) | способ оплаты |
| discount_applied | numeric(12,2) | применённая скидка |

### 4. `order_item` — состав заказа
| Поле | Тип | Описание |
|---|---|---|
| **order_item_id** | int PK | идентификатор |
| order_id | int FK → `orders.order_id` | заказ |
| product_id | int FK → `product.product_id` | товар |
| quantity | numeric(10,2) | количество |
| price_at_sale | numeric(10,2) | цена на момент покупки |

### 5. `cart` — корзина клиента (1:1 с client)
| Поле | Тип | Описание |
|---|---|---|
| **cart_id** | int PK | идентификатор |
| client_id | int FK → `client.client_id` UNIQUE | владелец |
| created_at | timestamp | дата создания |

### 6. `cart_item` — строки корзины
| Поле | Тип | Описание |
|---|---|---|
| **cart_item_id** | int PK | идентификатор |
| cart_id | int FK → `cart.cart_id` | корзина |
| product_id | int FK → `product.product_id` | товар |
| quantity | numeric(10,2) | количество |

### 7. `delivery` — доставка заказа (1:1 с orders)
| Поле | Тип | Описание |
|---|---|---|
| **delivery_id** | int PK | идентификатор |
| order_id | int FK → `orders.order_id` UNIQUE | заказ |
| address | varchar(500) | адрес |
| delivery_date | date | дата доставки |
| delivery_method | varchar(50) | способ |
| status | varchar(30) | `pending`/`shipped`/`delivered`/`cancelled` |

### 8. `payment` — оплата заказа (1:1 с orders)
| Поле | Тип | Описание |
|---|---|---|
| **payment_id** | int PK | идентификатор |
| order_id | int FK → `orders.order_id` UNIQUE | заказ |
| payment_method | varchar(50) | способ оплаты |
| payment_amount | numeric(12,2) | сумма |
| status | varchar(30) | `pending`/`paid`/`failed`/`refunded` |
| created_at | timestamp | дата создания |

### 9. `review` — отзывы на товары
| Поле | Тип | Описание |
|---|---|---|
| **review_id** | int PK | идентификатор |
| product_id | int FK → `product.product_id` | товар |
| client_id | int FK → `client.client_id` | автор |
| rating | int | оценка 1–5 |
| review_text | varchar(2000) | текст |
| review_date | timestamp | дата |

## Связи

```
client ─┬──< orders ───< order_item >── product
        │            │
        │            ├─── 1:1 ── delivery
        │            └─── 1:1 ── payment
        │
        ├── 1:1 ── cart ──< cart_item >── product
        │
        └──< review >── product
```

| Связь | Тип | Описание |
|---|---|---|
| `client` → `orders` | 1:N | клиент имеет много заказов |
| `client` → `cart` | 1:1 | у клиента одна корзина |
| `client` → `review` | 1:N | клиент оставляет отзывы |
| `orders` → `order_item` | 1:N | заказ состоит из строк |
| `product` → `order_item` | 1:N | товар встречается в строках заказов |
| `product` → `cart_item` | 1:N | товар встречается в корзинах |
| `product` → `review` | 1:N | у товара много отзывов |
| `cart` → `cart_item` | 1:N | корзина состоит из строк |
| `orders` → `delivery` | 1:1 | у заказа одна доставка |
| `orders` → `payment` | 1:1 | у заказа одна оплата |

## Каскадное удаление

- `client` → `orders`, `cart`, `review` (`ondelete=CASCADE`)
- `orders` → `order_item`, `delivery`, `payment` (`ondelete=CASCADE`)
- `cart` → `cart_item` (`ondelete=CASCADE`)
- `product` → `cart_item`, `review` (`ondelete=CASCADE`)
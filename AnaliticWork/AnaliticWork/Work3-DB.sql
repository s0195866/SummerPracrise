Клиент
-------
id_client PK
full_name
phone
email UNIQUE
is_regular_customer

Товар
-------
id_product PK;
name;
price;
unit;
description;
stock_quantity.

Заказ
-------
id_order PK;
created_at;
status;
total_price;
id_client FK.

СоставЗаказа
-------
id_item PK;
id_order FK;
id_product FK;
quantity;
purchase_price.

Доставка
-------
id_delivery PK;
address;
delivery_date;
delivery_status;
id_order FK.

Оплата
-------
id_payment PK;
payment_method;
payment_amount;
payment_status;
id_order FK.

Продажа
-------
id_sale PK;
sale_date;
sale_amount;
id_client FK;
id_order FK.

Отзыв
-------
id_review PK;
review_text;
rating;
review_date;
id_client FK;
id_product FK.

Необходимые связи:

Клиент
   |
   | 1:N
   |
Заказ
  | \
  |  \
  |   \1:1
  |    \
  |   Доставка
  |
  |1:1
  |
 Оплата
  |
  |1:N
  |
СоставЗаказа
  |
  |N:1
  |
 Товар
  |
  |1:N
  |
 Отзыв
  |
  N:1
  |
Клиент


Пример заполнения таблицы

| Таблица | Поле      | Тип           | Описание              |
| ------- | --------- | ------------- | --------------------- |
| Клиент  | id_client | INT           | Идентификатор клиента |
| Клиент  | full_name | VARCHAR(100)  | ФИО клиента           |
| Клиент  | email     | VARCHAR(100)  | Email клиента         |
| Товар   | price     | DECIMAL(10,2) | Цена товара           |

Тестовые Данные 

Клиенты
| ID | ФИО         | Телефон     | Email                               |
| -- | ----------- | ----------- | ----------------------------------- |
| 1  | Иванов Иван | 89991112233 | [ivan@mail.ru](mailto:ivan@mail.ru) |
| 2  | Петров Петр | 89994445566 | [petr@mail.ru](mailto:petr@mail.ru) |
| ID | Название   | Цена  | Остаток |
Товары
| -- | ---------- | ----- | ------- |
| 1  | Ноутбук    | 50000 | 10      |
| 2  | Мышь       | 1500  | 30      |
| 3  | Клавиатура | 3500  | 20      |
Заказы
| ID | Клиент | Статус    | Стоимость |
| -- | ------ | --------- | --------- |
| 1  | Иванов | Создан    | 53000     |
| 2  | Петров | Доставлен | 3500      |
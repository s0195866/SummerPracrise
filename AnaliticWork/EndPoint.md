Регистрация клиента:

POST /api/auth/register

{
  "fullName": "Иван Иванов",
  "phone": "+79991234567",
  "email": "ivan@mail.ru",
  "password": "123456"
}

Авторизация
POST /api/auth/login
{
  "email": "ivan@mail.ru",
  "password": "123456"
}

Выход из системы
POST /api/auth/logout

Получить профиль
GET /api/customers/me

Изменить профиль
PUT /api/customers/me

{
  "fullName": "Иван Иванов",
  "phone": "+79991234567",
  "email": "new@mail.ru"
}

История покупок
GET /api/customers/me/orders

Получить каталог товаров
GET /api/products

GET /api/products?name=телефон
GET /api/products?sort=price
GET /api/products?minPrice=1000&maxPrice=5000

Получить товар
GET /api/products/{productId}

Добавить товар
POST /api/products

Роль: Администратор
{
  "name": "Ноутбук",
  "price": 50000,
  "unit": "шт",
  "description": "Игровой ноутбук",
  "stock": 15
}

Редактировать товар
PUT /api/products/{productId}

Удалить товар
DELETE /api/products/{productId}

Получить корзину
GET /api/cart

Добавить товар
POST /api/cart/items

{
  "productId": 5,
  "quantity": 2
}

Изменить количество
PUT /api/cart/items/{itemId}

{
  "quantity": 3
}

Удалить товар из корзины
DELETE /api/cart/items/{itemId}

Создать заказ
POST /api/orders

{
  "deliveryAddress": "Москва, ул. Ленина, 10",
  "deliveryMethod": "Курьер",
  "paymentMethod": "Карта"
}

Получить свои заказы
GET /api/orders

Получить заказ
GET /api/orders/{orderId}

Отменить заказ
PUT /api/orders/{orderId}/cancel

Изменить статус заказа
PUT /api/orders/{orderId}/status

{
  "status": "DELIVERING"
}

Получить данные доставки
GET /api/deliveries/{deliveryId}

Создать доставку
Роль:Менеджер
POST /api/deliveries

Изменить статус доставки
PUT /api/deliveries/{deliveryId}

{
  "status": "DELIVERED"
}

Создать оплату
POST /api/payments

{
  "orderId": 15,
  "paymentMethod": "CARD"
}

Получить информацию об оплате
GET /api/payments/{paymentId}

Изменить статус оплаты
PUT /api/payments/{paymentId}

Получить отзывы товара
GET /api/products/{productId}/reviews

Оставить отзыв
POST /api/products/{productId}/reviews

{
  "rating": 5,
  "text": "Отличный товар"
}

Удалить отзыв
Роль:Администратор
DELETE /api/reviews/{reviewId}

Получить список продаж
Роль:Менеджер
GET /api/sales

Получить информацию о продаже
GET /api/sales/{saleId}

Получить список клиентов
GET /api/customers

Получить клиента
GET /api/customers/{customerId}

Получить пользователей
Роль:Администратор
GET /api/admin/users

Изменить роль пользователя
Роль:Администратор
PUT /api/admin/users/{userId}/role

Получить статистику
Роль:Администратор
GET /api/admin/statistics

| Функция                   | Гость | Клиент | Менеджер | Администратор |
| ------------------------- | ----- | ------ | -------- | ------------- |
| Просмотр товаров          | ✓     | ✓      | ✓       | ✓             |
| Регистрация               | ✓     |        |          |               |
| Оформление заказа         |       | ✓      |          |               |
| Отзывы                    |       | ✓      |          |               |
| Просмотр клиентов         |       |        | ✓        | ✓             |
| Просмотр продаж           |       |        | ✓        | ✓             |
| Управление товарами       |       |        |          | ✓             |
| Управление пользователями |       |        |          | ✓             |
| Просмотр статистики       |       |        |          | ✓             |
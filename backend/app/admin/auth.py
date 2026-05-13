from sqladmin import Admin, ModelView
from app.db.models import AppUser, Product, Order, OrderItem, PasswordResetToken, CartItem
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request






class AuthAdmin(AuthenticationBackend):
    

    async def login(self, request: Request)-> bool:
        form = await request.form()

        username = form['username']
        password = form['password']

        if username == 'admin' and password == '123':
            request.session.update({'token': 'admin'}
                                   )
            return True
        return False
    

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True
    

    async def authenticate(self, request: Request)-> bool:
        token = request.session.get('token')

        if token == 'admin':
            return True
        return False        
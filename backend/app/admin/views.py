from sqladmin import ModelView
from app.db.models import AppUser



class UserAdmin(ModelView, model=AppUser):
    column_list = [AppUser.user_id, AppUser.email]
    
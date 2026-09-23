from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'phone_number', 'role', 'is_active_tenant', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Rentease Info', {'fields': ('role', 'phone_number', 'is_active_tenant', 'must_change_password')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Rentease Info', {'fields': ('role', 'phone_number')}),
    )


admin.site.register(User, CustomUserAdmin)
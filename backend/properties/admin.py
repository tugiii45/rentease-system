from django.contrib import admin
from .models import Property, Unit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'address')


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('code', 'property', 'monthly_rent', 'is_occupied')
    list_filter = ('property', 'is_occupied')
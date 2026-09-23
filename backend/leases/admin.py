from django.contrib import admin
from .models import Lease, RepairExpense


class RepairExpenseInline(admin.TabularInline):
    model = RepairExpense
    extra = 1


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'unit', 'move_in_date', 'deposit_amount', 'is_active')
    list_filter = ('is_active', 'unit__property')
    inlines = [RepairExpenseInline]
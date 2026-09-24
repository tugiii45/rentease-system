from django.urls import path
from .views import CreateTenantView

urlpatterns = [
    path('create-tenant/', CreateTenantView.as_view(), name='create-tenant'),
]
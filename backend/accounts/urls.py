from django.urls import path
from .views import CreateTenantView, CurrentUserView

urlpatterns = [
    path('create-tenant/', CreateTenantView.as_view(), name='create-tenant'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
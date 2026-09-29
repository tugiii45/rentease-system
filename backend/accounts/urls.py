from django.urls import path
from .views import CreateTenantView, CurrentUserView, ChangePasswordView, RegisterPushTokenView

urlpatterns = [
    path('create-tenant/', CreateTenantView.as_view(), name='create-tenant'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('register-push-token/', RegisterPushTokenView.as_view(), name='register-push-token'),

]
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Password reset
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),

    # App routes
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('properties.urls')),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    path('api/', include('invoicing.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/', include('notices.urls')),
    path('api/', include('issues.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

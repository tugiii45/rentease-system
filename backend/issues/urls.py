from rest_framework.routers import DefaultRouter
from .views import IssueTicketViewSet

router = DefaultRouter()
router.register('issues', IssueTicketViewSet, basename='issue')

urlpatterns = router.urls
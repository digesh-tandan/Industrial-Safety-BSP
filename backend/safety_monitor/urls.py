from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterUserView, LoginUserView, DepartmentViewSet, EmployeeViewSet,
    CameraViewSet, ViolationViewSet, AlertViewSet, GlobalSearchView,
    SCADAAnalyticsView, ExportReportsView
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'cameras', CameraViewSet, basename='camera')
router.register(r'violations', ViolationViewSet, basename='violation')
router.register(r'alerts', AlertViewSet, basename='alert')

urlpatterns = [
    # Router CRUD endpoints
    path('', include(router.urls)),
    
    # Custom Authentication endpoints
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    path('auth/login/', LoginUserView.as_view(), name='login'),
    
    # Global search and metrics dashboard endpoints
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('analytics/dashboard/', SCADAAnalyticsView.as_view(), name='dashboard-kpis'),
    path('reports/export/', ExportReportsView.as_view(), name='export-reports'),
]

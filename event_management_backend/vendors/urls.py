from rest_framework.routers import DefaultRouter
from .views import VendorViewSet,AssignVendorToTaskViewSet
from django.urls import path, include
from events.views import CrewTaskViewSet

router = DefaultRouter()
""" router.register(r'crew/tasks', CrewTaskViewSet, basename="crew-task") """
router.register(r'vendors', VendorViewSet)
router.register(r'tasks', CrewTaskViewSet, basename='tasks')
router.register(r'assign-vendor-to-tasks', AssignVendorToTaskViewSet, basename="task-assign")

urlpatterns = [
    path("", include(router.urls)),
   

]
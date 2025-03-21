""" from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import test_create_openai, UserRegistrationView, UserLoginView, EventViewSet, TaskViewSet

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('events/test_openai/', test_create_openai, name='test_create_openai'),
]

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns += router.urls

urlpatterns += [
    path('events/create_with_openai/', EventViewSet.as_view({'post': 'create_with_openai'}), name='create_with_openai'),
] """




from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView,
    UserLoginView,
    EventViewSet,
    TaskViewSet,
    UserViewSet,
    test_create_openai,
    import_eventbrite_events,
    EventReportViewSet,
    TaskReportViewSet,
    VendorReportViewSet,
    CrewTaskViewSet, CrewEventViewSet, CrewVendorViewSet
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'users', UserViewSet, basename='user')
router.register(r'reports/events', EventReportViewSet, basename='event-reports')
router.register(r'reports/tasks', TaskReportViewSet, basename='task-reports')
router.register(r'reports/vendors', VendorReportViewSet, basename='vendor-reports')
router.register(r'crew/tasks', CrewTaskViewSet, basename='crew-tasks')
router.register(r'crew/events', CrewEventViewSet, basename='crew-events')
router.register(r'crew/vendors', CrewVendorViewSet, basename='crew-vendors')



urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('events/test_openai/', test_create_openai, name='test_create_openai'),
    path('eventbrite/import/', import_eventbrite_events, name='import_eventbrite_events'),
    path('', include(router.urls)),
]
urlpatterns += router.urls

urlpatterns += [
    path('events/create_with_openai/', EventViewSet.as_view({'post': 'create_with_openai'}), name='create_with_openai'),
]
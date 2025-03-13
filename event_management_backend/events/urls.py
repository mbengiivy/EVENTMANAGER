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
    test_create_openai,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('events/test_openai/', test_create_openai, name='test_create_openai'),
    path('', include(router.urls)),
]
urlpatterns += router.urls

urlpatterns += [
    path('events/create_with_openai/', EventViewSet.as_view({'post': 'create_with_openai'}), name='create_with_openai'),
]
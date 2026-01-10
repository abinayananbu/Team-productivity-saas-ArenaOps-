from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SignupView, LoginView, InviteUserView, AcceptInviteView, GoogleLoginView


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('', include(router.urls)),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/invite/', InviteUserView.as_view()),
    path('auth/accept-invite/<uuid:token>/', AcceptInviteView.as_view()),
    path("auth/google/", GoogleLoginView.as_view()),
]

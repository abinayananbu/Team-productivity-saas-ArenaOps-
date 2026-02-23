from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SignupView, LoginView, InviteUserView, AcceptInviteView, GoogleLoginView, MeView, ProjectView, ShowProject, ProjectDetailView, TaskListView, TaskCreateView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('', include(router.urls)),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/invite/', InviteUserView.as_view()),
    path('auth/accept-invite/<uuid:token>/', AcceptInviteView.as_view()),
    path("auth/google/", GoogleLoginView.as_view()),
    path("auth/me/", MeView.as_view(), name="me"),
    path('auth/project/', ProjectView.as_view()),
    path('auth/projects/', ShowProject.as_view()),
    path("projects/<int:id>/", ProjectDetailView.as_view()),
    path("tasks/", TaskListView.as_view()),
    path("tasks/create/", TaskCreateView.as_view()),
]

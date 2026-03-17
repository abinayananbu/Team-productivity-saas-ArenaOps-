from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (UserViewSet, SignupView, LoginView, InviteUserView, AcceptInviteView, GoogleLoginView, MeView, ProjectView, ShowProject, ProjectDetailView, TaskListView, 
                    TaskCreateView, TaskDetailView, DeleteTaskView , UpdateTaskView, ProjectDeleteView, ChannelMessagesView, CookieTokenRefreshView, LogoutView, ActivityLogView, 
                    DocumentView, DocumentListView, DocumentDetailView, DocumentDeleteView,MeAvatarChangeView)
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('', include(router.urls)),

    ##Auths
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", CookieTokenRefreshView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path('auth/invite/', InviteUserView.as_view()),
    path('auth/accept-invite/<uuid:token>/', AcceptInviteView.as_view()),
    path("auth/google/", GoogleLoginView.as_view()),

    path("auth/me/", MeView.as_view()),
    path("auth/me/avatar/", MeAvatarChangeView.as_view()),

    ##Projects
    path('auth/project/', ProjectView.as_view()),
    path('auth/projects/', ShowProject.as_view()),
    path("auth/projects/<int:id>/", ProjectDetailView.as_view()),
    path('auth/project/delete/<int:id>/', ProjectDeleteView.as_view()),

    ##Tasks
    path("auth/tasks/create/", TaskCreateView.as_view()),
    path("auth/tasks/", TaskListView.as_view()),
    path('auth/tasks/details/<int:task_id>/', TaskDetailView.as_view()),
    path('auth/tasks/delete/<int:task_id>/', DeleteTaskView.as_view()),
    path('auth/tasks/update/<int:task_id>/', UpdateTaskView.as_view()),

    path("channels/<int:channel_id>/messages/", ChannelMessagesView.as_view()),

    path("auth/activity-logs/", ActivityLogView.as_view()),

    ##Documents
    path("auth/documents/create/", DocumentView.as_view()),
    path("auth/documents/", DocumentListView.as_view()),     
    path("auth/documents/<int:pk>/", DocumentDetailView.as_view()),
    path("auth/document/delete/<int:id>/", DocumentDeleteView.as_view()),
]

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import login
from .utils.audit import create_activity_log
from .models import User, UserInvite, Project, Task, Message, ActivityLog, Document
from .serializers import UserSerializer, SignupSerializer, LoginSerializer, AcceptInviteSerializer, InviteUserSerializer, GoogleAuthSerializer, ProjectSerializer, TaskSerializer, MessageSerializer, ActivityLogSerializer, DocumentSerializer
from .permissions import IsOrganizationMember, ReadOnlyForMembers, IsOwnerOrAdmin

# Create your views here.
# User detail
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return User.objects.filter(
            organization=self.request.user.organization
        )

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated(), ReadOnlyForMembers()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            role='MEMBER'   # force role
        )
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        if user.role == 'OWNER':
            raise PermissionDenied("OWNER account cannot be deleted")

        return super().destroy(request, *args, **kwargs)
    
ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"

COOKIE_SETTINGS = {
    "httponly": True,
    "secure": False,
    "samesite": "Lax",
    "path": "/",
}

class SignupView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        response = Response(
            {"message": "Signup successful", "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED
        )
        response.set_cookie(key=ACCESS_COOKIE, value=str(refresh.access_token), **COOKIE_SETTINGS)
        response.set_cookie(key=REFRESH_COOKIE, value=str(refresh), **COOKIE_SETTINGS)
        return response


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        create_activity_log(
            user=user,
            organization=user.organization,
            action="👤logged in",
            metadata={
                "ip": request.META.get("REMOTE_ADDR"),
            }
        )
        response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        response.set_cookie(key=ACCESS_COOKIE, value=str(refresh.access_token), **COOKIE_SETTINGS)
        response.set_cookie(key=REFRESH_COOKIE, value=str(refresh), **COOKIE_SETTINGS)
        return response


class CookieTokenRefreshView(APIView):
    permission_classes = []  

    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh_token:
            raise AuthenticationFailed("No refresh token")
        try:
            token = RefreshToken(refresh_token)
            response = Response({"message": "Token refreshed"})
            response.set_cookie(key=ACCESS_COOKIE, value=str(token.access_token), **COOKIE_SETTINGS)
            return response
        except Exception:
            raise AuthenticationFailed("Invalid refresh token")


class LogoutView(APIView):
    permission_classes = [] 

    def post(self, request):
        try:
            token = RefreshToken(request.COOKIES.get(REFRESH_COOKIE))
            token.blacklist()
        except Exception:
            pass
        response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie(ACCESS_COOKIE, path="/")
        response.delete_cookie(REFRESH_COOKIE, path="/")
        return response


class GoogleLoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return Response({"error": "Invalid Google token"}, status=400)

        email = idinfo["email"]
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={"organization": None, "role": "MEMBER"}
        )

        refresh = RefreshToken.for_user(user)
        response = Response({"user": UserSerializer(user).data}, status=200)
        response.set_cookie(key=ACCESS_COOKIE, value=str(refresh.access_token), **COOKIE_SETTINGS)
        response.set_cookie(key=REFRESH_COOKIE, value=str(refresh), **COOKIE_SETTINGS)
        return response
    
# invite user
class InviteUserView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def post(self, request):
        serializer = InviteUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        organization = request.user.organization

        #  Check if user already exists
        existing_user = User.objects.filter(email=email).first()

        if existing_user:
            # If already in same org
            if existing_user.organization == organization:
                return Response(
                    {"message": "User already in this organization"},
                    status=status.HTTP_200_OK
                )

            # Add user to organization
            existing_user.organization = organization
            existing_user.save()

            return Response(
                {"message": "Existing user added to organization"},
                status=status.HTTP_200_OK
            )

        # 📨 If user does NOT exist → create invite
        invite = UserInvite.objects.create(
            email=email,
            organization=organization
        )

        invite_link = f"http://localhost:3000/accept-invite/{invite.token}"

        send_mail(
            subject="You're invited to join Arena",
            message=f"Click to join: {invite_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        return Response(
            {"message": "Invitation sent successfully"},
            status=status.HTTP_201_CREATED
        )

# Accept user 
class AcceptInviteView(APIView):
    permission_classes = []

    def post(self, request, token):
        invite = UserInvite.objects.filter(
            token=token, is_used=False
        ).first()

        if not invite:
            return Response(
                {"error": "Invalid or expired invite"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            email=invite.email,
            password=serializer.validated_data['password'],
            organization=invite.organization,
            role='MEMBER'
        )

        invite.is_used = True
        invite.save()

        return Response(
            {"message": "Account created successfully"},
            status=status.HTTP_201_CREATED
        )


    
# Profile
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "email": user.email,
            "avatar": (
                request.build_absolute_uri(user.avatar.url)
                if user.avatar else None
            ),    
            "role": user.role,
            "organization": {
                "name": user.organization.name if user.organization else None,
            }
        })
    
# Create Projects
class ProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProjectSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        project = serializer.save()

        # 🔥 Audit log
        create_activity_log(
            user=request.user,
            organization=request.user.organization,
            action="📁 New project created",
            metadata={
                "project_name": project.name,
                "project_id": project.id
            }
        )

        return Response(
            {"message": "Project created successfully"},
            status=status.HTTP_201_CREATED
        )

# Show projects
class ShowProject(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(
            organization=request.user.organization
        )

        serializer = ProjectSerializer(projects, many=True)

        return Response(serializer.data)
    
#Show project by id
class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        project = Project.objects.filter(
            id=id,
            organization=request.user.organization
        ).first()

        if not project:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(project)
        return Response(serializer.data)
    
#Delete Project
class ProjectDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):

        if not id:
            raise ValidationError({"message":"ID required to delete the project"})

        project = get_object_or_404(
            Project, 
            id=id,
            organization=request.user.organization
            )

        project.delete()

        # 🔥 Audit log
        create_activity_log(
            user=request.user,
            organization=request.user.organization,
            action="❌ Existing project deleted",
            metadata={
                "project_name": project.name,
                "project_id": project.id
            }
        )

        return Response(
            {"Message": "Project is Deleted"},
            status = status.HTTP_200_OK
        )   
    
# Create Task
class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TaskSerializer(
            data=request.data,
            context={"request": request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        task = serializer.save()

        create_activity_log(
            user=request.user,
            organization=request.user.organization,
            action="📁 New task created",
            metadata={
                "task_name": task.title,
                "task_id": task.id
            }
        )

        return Response(
            {"message": "Task created successfully"},
            status=status.HTTP_201_CREATED
        )    

# Show Task List
class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project")

        tasks = Task.objects.filter(
            organization=request.user.organization,
            project_id=project_id
        ).order_by("-created_at")

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


#Show task detail by id
class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):

        if not task_id:
            raise ValidationError({"task": "Task ID is required."})

        task = get_object_or_404(
            Task,
            id=task_id,
            organization=request.user.organization
        )

        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
 #Delete task   
class DeleteTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, task_id):

        if not task_id:
            raise ValidationError({"task": "Task ID is required."})

        task = get_object_or_404(
            Task,
            id=task_id,
            organization=request.user.organization
        )

        task.delete()

        # 🔥 Audit log
        create_activity_log(
            user=request.user,
            organization=request.user.organization,
            action="❌ Existing task deleted",
            metadata={
                "task_name": task.title,
                "task_id": task.id
            }
        )

        return Response(
            {"message": "Task deleted"},
            status=status.HTTP_200_OK
        )
    
#Update Task
class UpdateTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, task_id):

        if not task_id:
            raise ValidationError({"task": "Task ID is required."})

        task = get_object_or_404(
            Task,
            id=task_id,
            organization=request.user.organization
        )

        serializer = TaskSerializer(
            task,
            data=request.data,
            partial=True,   
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        # 🔥 Audit log
        create_activity_log(
            user=request.user,
            organization=request.user.organization,
            action="✅ Existing task updated",
            metadata={
                "task_name": task.title,
                "task_id": task.id
            }
        )

        return Response(serializer.data)
    

class ChannelMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, channel_id):
        messages = Message.objects.filter(channel_id=channel_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

#Activity log
class ActivityLogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = ActivityLog.objects.filter(
            organization=request.user.organization
        ).order_by("-created_at")[:8]

        serializer = ActivityLogSerializer(logs, many=True)

        return Response(serializer.data)
    

#Documentation
class DocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DocumentSerializer(
            data=request.data,
            context={"request": request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        document = serializer.save()
        return Response({
            "message": "Document created successfully",
            "document": DocumentSerializer(document).data
        }, status=status.HTTP_201_CREATED)

class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        documents = Document.objects.filter(
            organization=request.user.organization,
            user=request.user
        )
        serializer = DocumentSerializer(documents, many=True)

        return Response(serializer.data)
    

class DocumentDetailView(APIView):
    def patch(self, request, pk):
        document = Document.objects.get(pk=pk, user=request.user)
        serializer = DocumentSerializer(document, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]  

    def delete(self, request, id):

        if not id:
            raise ValidationError({"Document": "Document ID is required."})

        document = get_object_or_404(
            Document,
            id=id,
            user = request.user,
        ) 

        document.delete()  
        
        return Response({
            "message": "Document deleted successfully",
        }, status=status.HTTP_200_OK)    
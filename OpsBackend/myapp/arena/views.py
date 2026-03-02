from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import login
from .models import User, UserInvite, Project, Task, Message
from .serializers import UserSerializer, SignupSerializer, LoginSerializer, AcceptInviteSerializer, InviteUserSerializer, GoogleAuthSerializer, ProjectSerializer, TaskSerializer, MessageSerializer
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
    
# Signing Up
class SignupView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Signup successful",
                "access_token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )

# Login 
class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Django session login
        login(request, user)
        # Django token
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "user": UserSerializer(user).data,
                "access_token": str(refresh.access_token),
                "refresh": str(refresh)
            },
            status=status.HTTP_200_OK
        )

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

# Continue with Google
class GoogleLoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return Response(
                {"error": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = idinfo["email"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "organization": None,
                "role": "MEMBER",
            }
        )

        if created:
            # Optional: create personal org or wait for invite
            pass

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "access_token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )

# Logout 
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"message": "Logged out successfully"})
    
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
        serializer.save()

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
        serializer.save()

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

        return Response(serializer.data)
    

class ChannelMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, channel_id):
        messages = Message.objects.filter(channel_id=channel_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

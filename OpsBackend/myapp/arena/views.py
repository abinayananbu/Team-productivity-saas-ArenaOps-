from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenRefreshView
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import login
from .models import User, UserInvite
from .serializers import UserSerializer, SignupSerializer, LoginSerializer, AcceptInviteSerializer, InviteUserSerializer
from .permissions import IsOrganizationMember, ReadOnlyForMembers, IsOwnerOrAdmin


# Create your views here.

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

class SignupView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Signup successful",
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Optional: Django session login
        login(request, user)

        return Response(
            {
                "message": "Login successful",
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )


class InviteUserView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def post(self, request):
        serializer = InviteUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invite = UserInvite.objects.create(
            email=serializer.validated_data['email'],
            organization=request.user.organization
        )

        invite_link = f"http://localhost:3000/accept-invite/{invite.token}"

        send_mail(
            subject="You're invited to join Arena",
            message=f"Click to join: {invite_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invite.email],
        )

        return Response(
            {"message": "Invitation sent"},
            status=status.HTTP_201_CREATED
        )


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

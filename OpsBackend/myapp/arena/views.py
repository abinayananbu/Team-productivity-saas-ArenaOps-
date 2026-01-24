from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import login
from .models import User, UserInvite
from .serializers import UserSerializer, SignupSerializer, LoginSerializer, AcceptInviteSerializer, InviteUserSerializer, GoogleAuthSerializer
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
                "access_token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"message": "Logged out successfully"})
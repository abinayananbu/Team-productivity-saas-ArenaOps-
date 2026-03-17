from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import Organization, Tag, Project, Task, Plan, Message, ActivityLog, Document

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    # Read: returns full absolute URL
    avatar_url = serializers.SerializerMethodField()

    # Write: accepts the uploaded file
    avatar = serializers.ImageField(required=False, allow_null=True)

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'organization', 'avatar', 'avatar_url']
        read_only_fields = ['email']


class OrganizationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Organization
        fields = ['id', 'name', 'plan', 'is_active', 'created_at']
        read_only_fields = ['plan', 'created_at']


class SignupSerializer(serializers.Serializer):
    organization_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        with transaction.atomic():
            organization = Organization.objects.create(
                name=validated_data['organization_name']
            )

            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                role='OWNER',
                organization=organization
            )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            email=data.get('email'),
            password=data.get('password')
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is inactive")

        data['user'] = user
        return data

class InviteUserSerializer(serializers.Serializer):
    email = serializers.EmailField()


class AcceptInviteSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value

class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


class ProjectSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    task_assigned_member_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'created_by',
            'created_at',
            'tags',
            'task_count',
            'task_assigned_member_count',
        ]
        read_only_fields = ['created_at', 'created_by']
        
    def create(self, validated_data):
        request = self.context['request']
    
        return Project.objects.create(
            organization=request.user.organization,
            created_by = request.user,
            **validated_data
        )
    
    def get_task_count(self, obj):
        return obj.task_set.count()
    
    def get_task_assigned_member_count(self, obj):
        return obj.task_set.filter(assigned_to__isnull=False).values('assigned_to').distinct().count()
    

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.CharField(
        source="assigned_to.email",
        read_only=True
    )

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'is_completed',
            'deadline',
            'project',
            'assigned_to',
            'assigned_to_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context['request']

        return Task.objects.create(
            organization=request.user.organization,
            **validated_data
        )
    

# serializers.py

class MessageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "channel", "user", "user_name", "content", "created_at"]
        read_only_fields = ["user", "created_at"]

#Audit
class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_display = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ["action","user", "organization",'user_email', 'user_display', "metadata", "created_at"]
        read_only_fields = ["user", "created_at"]

    def get_user_display(self, obj):
        if obj.user:
            # Returns "john" from "john@example.com"
            return obj.user.email.split('@')[0]
        return 'System'    
    
#Document
class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Document
        fields = ["id", "organization", "user", "title" , "content", "created_at", "updated_at"]
        read_only_fields = ["organization", "user", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context['request']

        return Document.objects.create(
            user = request.user,
            organization = request.user.organization,
            **validated_data
        )    


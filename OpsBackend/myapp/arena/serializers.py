from rest_framework import serializers
from .models import User, Organization, Project, Task, Tag, Plan, Subscription

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'organization', 'avatar']

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'plan', 'is_active', 'created_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ProjectSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, source='tags'
    )

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'organization', 'created_by', 'created_at', 'tags', 'tag_ids']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'deadline', 'is_completed', 'project', 'assigned_to', 'organization', 'created_at', 'updated_at']

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'price', 'max_users', 'max_projects']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'organization', 'plan', 'start_date', 'end_date', 'is_active', 'stripe_subscription_id']

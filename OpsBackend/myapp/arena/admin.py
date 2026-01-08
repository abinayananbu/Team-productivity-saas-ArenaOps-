from django.contrib import admin
from .models import User, Organization, Project, Task, ActivityLog, Plan, Subscription, Tag

# Register your models here.

# User admin
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'organization', 'is_staff')
    list_filter = ('role', 'organization', 'is_staff')
    search_fields = ('email',)
    # Show avatar in admin
    readonly_fields = ('avatar_preview',)

    def avatar_preview(self, obj):
        if obj.avatar:
            return f'<img src="{obj.avatar.url}" width="50" height="50"/>'
        return "-"
    avatar_preview.allow_tags = True

# Project admin
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'created_by', 'created_at')
    list_filter = ('organization',)
    search_fields = ('name',)
    filter_horizontal = ('tags',)  # Show tags in admin as multi-select

# Task admin
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'status', 'priority', 'is_completed', 'deadline')
    list_filter = ('status', 'priority', 'organization')
    search_fields = ('title', 'description')

# Other models
admin.site.register(Organization)
admin.site.register(Tag)
admin.site.register(ActivityLog)
admin.site.register(Plan)
admin.site.register(Subscription)

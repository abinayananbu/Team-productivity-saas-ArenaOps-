from arena.models import ActivityLog

def create_activity_log(user, organization, action, metadata=None):
    ActivityLog.objects.create(
        user=user,
        organization=organization,
        action=action,
        metadata=metadata or {}
    )
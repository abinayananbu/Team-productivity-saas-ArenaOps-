from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOrganizationMember(BasePermission):
    """
    Allows access only to objects belonging to user's organization
    """

    def has_object_permission(self, request, view, obj):
        user_org = request.user.organization
        obj_org = getattr(obj, 'organization', None)
        return user_org == obj_org


class IsOwnerOrAdmin(BasePermission):
    """
    Only OWNER or ADMIN can modify data
    """

    def has_permission(self, request, view):
        return request.user.role in ['OWNER', 'ADMIN']


class ReadOnlyForMembers(BasePermission):
    """
    MEMBERS can only read data
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ['OWNER', 'ADMIN']

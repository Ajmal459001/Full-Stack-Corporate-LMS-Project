from rest_framework import permissions

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow users with INSTRUCTOR role to create/edit courses.
    Employees can only read courses.
    """
    def has_permission(self, request, view):
        # 1. Allow any safe method (GET, HEAD, OPTIONS) for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # 2. For write methods (POST, PUT, PATCH, DELETE), user must be an INSTRUCTOR or ADMIN
        return request.user and request.user.is_authenticated and request.user.role in ['INSTRUCTOR', 'ADMIN']
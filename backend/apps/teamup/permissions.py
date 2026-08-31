"""
apps/teamup/permissions.py

Custom DRF permission: only the post creator can perform creator-only actions.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCreatorOrReadOnly(BasePermission):
    """
    Object-level permission:
    - Read access is allowed for everyone (safe methods).
    - Write access is only allowed to the creator of the TeamRequest.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.creator == request.user


class IsCreator(BasePermission):
    """
    Object-level permission: only the creator can perform the action.
    Used for reduce-slots and similar creator-only endpoints.
    """
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user

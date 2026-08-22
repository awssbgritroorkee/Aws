from django.contrib import admin
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display    = ['name', 'email', 'year', 'created_at']
    list_filter     = ['year']
    search_fields   = ['name', 'email']
    ordering        = ['-created_at']
    # All fields are read-only — messages should never be edited, only read & deleted
    readonly_fields = ['name', 'email', 'message', 'year', 'domains', 'created_at']

    def has_add_permission(self, request):
        """Prevent manual creation of messages through admin — they come from the form."""
        return False

from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display        = ['title', 'date', 'status', 'registration_link']
    list_filter         = ['status']
    list_editable       = ['status']
    list_display_links  = ['title']
    date_hierarchy      = 'date'
    search_fields       = ['title', 'description']
    ordering            = ['-date']

    fieldsets = (
        ('Event Details', {
            'fields': ('title', 'date', 'status', 'description', 'poster'),
        }),
        ('Registration', {
            'fields': ('registration_link',),
        }),
    )

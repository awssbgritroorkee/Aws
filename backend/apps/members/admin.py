from django.contrib import admin
from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display  = ['name', 'role', 'is_lead', 'order']
    list_editable = ['order', 'is_lead']
    search_fields = ['name', 'role']

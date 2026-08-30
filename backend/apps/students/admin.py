import csv
from django.contrib import admin
from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import render
from unfold.admin import ModelAdmin
from unfold.decorators import display
from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin

from .models import StudentProfile, EventRegistration
from apps.events.models import Event
from django.contrib.auth.models import User


# ── Import-Export Resource ────────────────────────────────────────────────────

class EventRegistrationResource(resources.ModelResource):
    """
    Defines the default Excel/CSV column layout for EventRegistration exports.
    Uses dehydrate_student_name to ensure Google SSO users never have blank names.
    """
    student_name    = fields.Field(column_name='Full Name')
    email           = fields.Field(column_name='Email',
                                   attribute='student__user__email')
    father_name     = fields.Field(column_name='Father Name',
                                   attribute='student__father_name')
    course          = fields.Field(column_name='Course',
                                   attribute='student__course')
    branch          = fields.Field(column_name='Branch',
                                   attribute='student__branch')
    section         = fields.Field(column_name='Section',
                                   attribute='student__section')
    roll_number     = fields.Field(column_name='Roll Number',
                                   attribute='student__roll_number')
    mobile_number   = fields.Field(column_name='Mobile Number',
                                   attribute='student__mobile_number')

    # ── Event info ────────────────────────────────────────────────────────────
    event_title     = fields.Field(column_name='Event',
                                   attribute='event__title')
    event_date      = fields.Field(column_name='Event Date',
                                   attribute='event__date')
    registered_at   = fields.Field(column_name='Registered At',
                                   attribute='registered_at')

    class Meta:
        model  = EventRegistration
        fields = (
            'student_name', 'email', 'father_name',
            'course', 'branch', 'section', 'roll_number', 'mobile_number',
            'event_title', 'event_date', 'registered_at',
        )
        export_order = fields

    def dehydrate_student_name(self, obj):
        user = obj.student.user
        return user.get_full_name() or user.first_name or user.username or user.email


# ── StudentProfile Admin ──────────────────────────────────────────────────────

@admin.register(StudentProfile)
class StudentProfileAdmin(ModelAdmin):
    compressed_fields  = True
    warn_unsaved_form  = True

    # Annotate queryset so total_events_attended is sortable in the list view
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Order by event count descending by default (top attendees first)
        return qs.annotate(_event_count=Count('registrations')).order_by('-_event_count')

    # ── List view ─────────────────────────────────────────────────────────────
    list_display       = [
        'student_name', 'email_display', 'course', 'branch',
        'roll_number', 'total_events_attended',
    ]
    list_display_links = ['student_name']
    search_fields      = [
        'user__email', 'user__first_name', 'user__last_name',
        'roll_number', 'mobile_number',
    ]
    list_filter        = ['course', 'branch']

    # ── Detail form ───────────────────────────────────────────────────────────
    fieldsets = (
        ('🔐 Linked Account', {
            'fields': ('user',),
        }),
        ('🎓 Academic Details', {
            'fields': ('father_name', 'course', 'branch', 'section', 'roll_number', 'mobile_number'),
        }),
    )

    # ── Custom display columns ────────────────────────────────────────────────
    @display(description='Student', ordering='user__first_name')
    def student_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    @display(description='Email', ordering='user__email')
    def email_display(self, obj):
        return obj.user.email

    @display(description='Events Attended', ordering='_event_count')
    def total_events_attended(self, obj):
        """Returns the annotated count — sortable in the admin list view."""
        return getattr(obj, '_event_count', 0)


# ── EventRegistration Admin & Custom Export Action ────────────────────────────

class UnfoldImportExportModelAdmin(ImportExportModelAdmin, ModelAdmin):
    """
    Combines django-import-export's ImportExportModelAdmin with Unfold's ModelAdmin
    so that the admin panel keeps the Unfold theme while gaining export buttons.
    """
    pass


AVAILABLE_EXPORT_COLUMNS = [
    ('student_name',  'Full Name'),
    ('email',         'Email'),
    ('father_name',   "Father's Name"),
    ('course',        'Course'),
    ('branch',        'Branch'),
    ('section',       'Section'),
    ('roll_number',   'Roll Number'),
    ('mobile_number', 'Mobile Number'),
    ('event_title',   'Event Title'),
    ('event_date',    'Event Date'),
    ('registered_at', 'Registered At'),
]

COLUMN_EXTRACTORS = {
    'student_name':  lambda r: r.student.user.get_full_name() or r.student.user.first_name or r.student.user.username or r.student.user.email,
    'email':         lambda r: r.student.user.email,
    'father_name':   lambda r: r.student.father_name,
    'course':        lambda r: r.student.course,
    'branch':        lambda r: r.student.branch,
    'section':       lambda r: r.student.section,
    'roll_number':   lambda r: r.student.roll_number,
    'mobile_number': lambda r: r.student.mobile_number,
    'event_title':   lambda r: r.event.title,
    'event_date':    lambda r: str(r.event.date),
    'registered_at': lambda r: r.registered_at.strftime('%Y-%m-%d %H:%M:%S') if r.registered_at else '',
}


@admin.register(EventRegistration)
class EventRegistrationAdmin(UnfoldImportExportModelAdmin):
    resource_classes   = [EventRegistrationResource]
    compressed_fields  = True
    warn_unsaved_form  = True

    actions            = ['export_selective_data']

    # ── List view ─────────────────────────────────────────────────────────────
    list_display       = ['student_display', 'event', 'registered_at']
    list_display_links = ['student_display']
    list_filter        = ['event']
    search_fields      = [
        'student__user__email',
        'student__user__first_name',
        'student__roll_number',
        'event__title',
    ]
    ordering           = ['-registered_at']
    date_hierarchy     = 'registered_at'

    readonly_fields    = ['registered_at']

    # ── Custom column ─────────────────────────────────────────────────────────
    @display(description='Student', ordering='student__user__first_name')
    def student_display(self, obj):
        name  = obj.student.user.get_full_name() or obj.student.user.email
        roll  = obj.student.roll_number
        return f'{name} ({roll})'

    @admin.action(description="Export Selected Registration Data (Custom Columns)")
    def export_selective_data(self, request, queryset):
        """
        Intermediate custom admin action:
        1. If 'apply' is in POST: generates dynamic CSV containing only checked columns for selected records.
        2. Otherwise: renders custom_export.html intermediate page with column checkboxes.
        """
        if 'apply' in request.POST:
            selected_cols = request.POST.getlist('columns')
            if not selected_cols:
                selected_cols = [c[0] for c in AVAILABLE_EXPORT_COLUMNS]

            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = 'attachment; filename="selective_event_registrations.csv"'

            writer = csv.writer(response)

            # Write selected header labels
            headers = [label for key, label in AVAILABLE_EXPORT_COLUMNS if key in selected_cols]
            writer.writerow(headers)

            # Write rows
            for reg in queryset.select_related('student__user', 'event'):
                row = [COLUMN_EXTRACTORS[key](reg) for key in selected_cols if key in COLUMN_EXTRACTORS]
                writer.writerow(row)

            return response

        context = {
            'queryset': queryset,
            'opts': self.model._meta,
            'available_columns': AVAILABLE_EXPORT_COLUMNS,
        }
        return render(request, 'admin/custom_export.html', context)

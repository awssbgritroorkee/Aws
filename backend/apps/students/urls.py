from django.urls import path
from .views import StudentProfileView, EventRegisterView, AnalyticsView, ExportExcelView

urlpatterns = [
    # GET  /api/student-profile/ — fetch autofill data for the modal
    path('student-profile/', StudentProfileView.as_view(), name='student-profile'),

    # POST /api/events/<event_id>/register/ — submit event registration
    path('events/<int:event_id>/register/', EventRegisterView.as_view(), name='event-register'),

    # Admin Analytics & Excel Export
    path('students/analytics/', AnalyticsView.as_view(), name='students-analytics'),
    path('students/analytics/export-excel/', ExportExcelView.as_view(), name='students-analytics-export-excel'),
]

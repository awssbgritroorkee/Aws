from django.urls import path
from .views import StudentProfileView, EventRegisterView

urlpatterns = [
    # GET  /api/student-profile/ — fetch autofill data for the modal
    path('student-profile/', StudentProfileView.as_view(), name='student-profile'),

    # POST /api/events/<event_id>/register/ — submit event registration
    path('events/<int:event_id>/register/', EventRegisterView.as_view(), name='event-register'),
]

from rest_framework import generics, permissions
from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    """
    POST /api/contact/
    Accepts a contact / membership application from the frontend.
    Returns HTTP 201 on success.

    GET is intentionally NOT available — messages are read via Django Admin only.
    This prevents public exposure of applicant personal data.
    """
    queryset         = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]


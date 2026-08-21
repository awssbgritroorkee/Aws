from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/ideas/',   include('apps.ideas.urls')),
    path('api/teams/',   include('apps.teams.urls')),
    path('api/members/', include('apps.members.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

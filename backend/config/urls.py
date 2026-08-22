from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Existing endpoints ────────────────────────────────────────────────────
    path('api/ideas/',   include('apps.ideas.urls')),
    path('api/teams/',   include('apps.teams.urls')),

    # ── Team & People ─────────────────────────────────────────────────────────
    path('api/members/', include('apps.members.urls')),

    # ── New dynamic content endpoints ─────────────────────────────────────────
    path('api/events/',  include('apps.events.urls')),
    path('api/gallery/', include('apps.gallery.urls')),
    path('api/contact/', include('apps.contact.urls')),
]

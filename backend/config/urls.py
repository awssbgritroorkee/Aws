from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ── Favicon redirect (stops browser 404 on /favicon.ico) ─────────────────
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.svg', permanent=True)),

    path('admin/', admin.site.urls),

    # ── Authentication & Social Login ─────────────────────────────────────────
    path('api/auth/',    include('apps.accounts.urls')),

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

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

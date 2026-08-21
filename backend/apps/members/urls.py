from django.urls import path
from .views import MemberListView, MemberDetailView

urlpatterns = [
    path('',          MemberListView.as_view(),   name='member-list'),
    path('<int:pk>/', MemberDetailView.as_view(), name='member-detail'),
]

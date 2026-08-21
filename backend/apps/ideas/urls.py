from django.urls import path
from .views import IdeaListCreateView, IdeaDetailView

urlpatterns = [
    path('',        IdeaListCreateView.as_view(), name='idea-list'),
    path('<int:pk>/', IdeaDetailView.as_view(),   name='idea-detail'),
]

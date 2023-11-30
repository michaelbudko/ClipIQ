# clipiq/urls.py
from django.urls import path
from .views import download_audio

urlpatterns = [
    path('download/', download_audio, name='download_audio'),
]
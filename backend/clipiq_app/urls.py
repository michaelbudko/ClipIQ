# clipiq/urls.py
from django.urls import path
from .views import download_and_transcribe_audio

urlpatterns = [
    path('download/', download_and_transcribe_audio, name='download_and_transcribe_audio'),
]
# clipiq/urls.py
from django.urls import path
from .views import download_and_transcribe_audio, get_video_details

urlpatterns = [
    path('download/', download_and_transcribe_audio, name='download_and_transcribe_audio'),
    path('get-video-details/', get_video_details, name='get_video_details'),
]
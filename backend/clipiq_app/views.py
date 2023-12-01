from django.shortcuts import render
from django.http import HttpResponse
from pytube import YouTube

def download_audio(request):
    video_url = request.GET.get('url', '')
    if not video_url:
        return HttpResponse('Please provide a valid YouTube video URL.')
    try:
        yt = YouTube(video_url)
        audio_stream = yt.streams.filter(only_audio=True).first()
        audio_stream.download('media/')  # Save the audio file in the 'media' directory
        return HttpResponse('Audio download successful!')
    except Exception as e:
        return HttpResponse(f'Error: {str(e)}')


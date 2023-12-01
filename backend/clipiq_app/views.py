from django.shortcuts import render
from django.http import HttpResponse, FileResponse
from django.views.decorators.http import require_GET
from django.http import HttpResponse
from pytube import YouTube

@require_GET
def download_audio(request):
    video_url = request.GET.get('url', '')
    if not video_url:
        return HttpResponse('Please provide a valid YouTube video URL.')
    try:
        yt = YouTube(video_url)
        audio_stream = yt.streams.filter(only_audio=True).first()
        # Replace problematic characters in the video title
        sanitized_title = ''.join(c if c.isalnum() or c in [' ', '_'] else '_' for c in yt.title)
        audio_path = f'media/{sanitized_title}'
        audio_stream.download('media/', filename=sanitized_title)
        # Return the audio file as a response
        response = FileResponse(open(audio_path, 'rb'), content_type='audio/mp3')
        response['Content-Disposition'] = f'attachment; filename="{sanitized_title}.mp3"'
        return response

    except Exception as e:
        return HttpResponse(f'Error: {str(e)}')


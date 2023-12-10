from django.shortcuts import render
from django.http import HttpResponse, FileResponse, JsonResponse
from django.views.decorators.http import require_GET
from pytube import YouTube
import requests
import os


def transcribe_audio_with_whisper_api(file_path, api_key):
    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    data = {
        "model": "whisper-1",
        "response_format": "srt"
    }
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, headers=headers, data=data, files=files)
        print(response.json())
    return response.json().get('text', '')

@require_GET
def download_and_transcribe_audio(request):
    video_url = request.GET.get('url', '')
    if not video_url:
        return HttpResponse('Please provide a valid YouTube video URL.')

    try:
        # Downloading the audio
        yt = YouTube(video_url)
        audio_stream = yt.streams.filter(only_audio=True).first()
        sanitized_title = ''.join(c if c.isalnum() or c in [' ', '_'] else '_' for c in yt.title) + '.mp3'
        audio_path = f'media/{sanitized_title}'
        audio_stream.download('media/', filename=sanitized_title)

        # Transcribing the audio
        api_key = os.environ.get('CHATGPT_API_KEY', 'fallback_value')
        transcript = transcribe_audio_with_whisper_api(audio_path, api_key)
        # Optionally, delete the audio file after transcription
        os.remove(audio_path)

        # Returning the transcript as a JSON response
        return JsonResponse({"transcript": transcript})

    except Exception as e:
        return HttpResponse(f'Error: {str(e)}')


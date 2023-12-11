from django.shortcuts import render
from django.http import HttpResponse, FileResponse, JsonResponse
from django.views.decorators.http import require_GET
from pytube import YouTube
import requests
import os
import openai
from dotenv import load_dotenv
from datetime import timedelta

# Load the .env file
load_dotenv()
api_key = os.environ.get('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")
client = openai.OpenAI()


def transcribe_audio_with_whisper_api(file_path):
    try:
        print(file_path)
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                response_format="srt",  # Set the response format to SRT
                file=audio_file
            )
            print(transcript)
    except Exception as e:
        print(f"An error occurred: {e}")


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
        transcript = transcribe_audio_with_whisper_api(audio_path)
        # Optionally, delete the audio file after transcription
        os.remove(audio_path)

        # Returning the transcript as a JSON response
        return JsonResponse({"transcript": transcript})

    except Exception as e:
        return HttpResponse(f'Error: {str(e)}')
    
@require_GET
def get_video_details(request):
    video_url = request.GET.get('url', '')
    if not video_url:
        return JsonResponse({'error': 'No URL provided'}, status=400)

    try:
        yt = YouTube(video_url)
        video_details = {
            'thumbnail_url': yt.thumbnail_url,
            'title': yt.title,
            'duration': yt.length
        }
        return JsonResponse(video_details)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


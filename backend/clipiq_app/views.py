import json
from django.shortcuts import render
from django.http import HttpResponse, FileResponse, JsonResponse
from django.views.decorators.http import require_GET
from pytube import YouTube
import requests
import os
import re
import openai
import pysrt
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
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                response_format="srt",
                file=audio_file
            )
        srt_path = file_path.replace('.mp3', '.srt')
        with open(srt_path, "w") as srt_file:
            srt_file.write(transcript)
        return srt_path
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def parse_srt(file_path):
    subs = pysrt.open(file_path)
    subtitles = [{'index': i, 'start': str(sub.start), 'end': str(sub.end), 'text': sub.text} for i, sub in enumerate(subs)]
    return subtitles

def find_interesting_moments(subtitles):
    prompt = "Return only indexes of most interesting moments from SRT file, you can combine indexes to generate 10-15 clips of max length of 60 seconds. Return should have format of [startIdx, endIdx, title]:\n"
    prompt += "\n\n".join([f"{sub['index']}: {sub['text']}" for sub in subtitles]) # NOTE: index is offset by -1

    try:
        response = client.completions.create(prompt=prompt, model="gpt-3.5-turbo-instruct", max_tokens=300) #NOTE: max tokens dictates number of clips
        if response.choices:
            response_text = response.choices[0].text.strip()
            interesting_indexes = parse_chatgpt_response(response_text)
            print("LENGTH " + str(len(interesting_indexes)))
            return interesting_indexes
        else:
            raise Exception("No response from OpenAI API")
    except Exception as e:
        print(f"An error occurred: {e}")
        return []
    
def parse_chatgpt_response(response_data):
    # Use a regular expression to find all instances of the pattern [index, index, "title"]
    pattern = r"\[(\d+), (\d+), \"(.*?)\"\]"
    matches = re.findall(pattern, response_data)

    # Convert each match to the desired format: [startIdx, endIdx, title]
    interesting_clips = []
    for match in matches:
        startIdx, endIdx, title = match
        interesting_clips.append([int(startIdx), int(endIdx), title])

    return interesting_clips

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
        srt_path = transcribe_audio_with_whisper_api(audio_path)

        # Parse the SRT file and find interesting moments
        subtitles = parse_srt(srt_path)
        print("GOT HERE1")
        interesting_indexes = find_interesting_moments(subtitles)
        print("INTERESTING INDEXES: " + str(interesting_indexes))
        print("GOT HERE2")

        # Optionally, delete the audio file after transcription
        os.remove(audio_path)

        # Returning the transcript as a JSON response
        return JsonResponse({"interesting_indexes": interesting_indexes})

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


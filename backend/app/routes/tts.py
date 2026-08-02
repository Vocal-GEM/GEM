from flask import Blueprint, request, jsonify
import os
import requests
from ..extensions import limiter

tts_bp = Blueprint('tts', __name__, url_prefix='/api/tts')

ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY')

@tts_bp.route('/synthesize', methods=['POST'])
@limiter.limit("5 per minute")
def synthesize_speech():
    """
    Proxy endpoint for ElevenLabs TTS API.
    Keeps API key secure on backend.
    """
    if not ELEVENLABS_API_KEY:
        return jsonify({
            "error": "ElevenLabs API key not configured on server"
        }), 503

    data = request.json
    text = data.get('text', '')
    voice_id = data.get('voiceId', '21m00Tcm4TlvDq8ikWAM')  # Default Rachel
    model_id = data.get('modelId', 'eleven_turbo_v2_5')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Forward request to ElevenLabs API
        response = requests.post(
            f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}',
            headers={
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            json={
                'text': text,
                'model_id': model_id,
                'voice_settings': {
                    'stability': 0.5,
                    'similarity_boost': 0.75
                }
            },
            timeout=30
        )

        if not response.ok:
            error_text = response.text
            return jsonify({
                "error": f"ElevenLabs API error: {response.status_code}",
                "details": error_text
            }), response.status_code

        # Return audio data
        return response.content, 200, {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'inline'
        }

    except requests.exceptions.Timeout:
        return jsonify({"error": "Request to ElevenLabs timed out"}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to ElevenLabs: {str(e)}"}), 502


@tts_bp.route('/voices', methods=['GET'])
@limiter.limit("20 per minute")
def get_voices():
    """
    Fetch available voices from ElevenLabs API.
    """
    if not ELEVENLABS_API_KEY:
        return jsonify({
            "error": "ElevenLabs API key not configured on server",
            "voices": []
        }), 503

    try:
        response = requests.get(
            'https://api.elevenlabs.io/v1/voices',
            headers={
                'xi-api-key': ELEVENLABS_API_KEY
            },
            timeout=10
        )

        if not response.ok:
            return jsonify({
                "error": f"Failed to fetch voices: {response.status_code}",
                "voices": []
            }), response.status_code

        data = response.json()
        return jsonify(data), 200

    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out", "voices": []}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect: {str(e)}", "voices": []}), 502

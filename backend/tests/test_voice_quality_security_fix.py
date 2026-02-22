
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
import sys
import os
import io

# Mock external dependencies that might not be installed
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['librosa'] = MagicMock()

# Mock internal services that depend on external libraries
sys.modules['backend.app.services.voicelab_service'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()

# Import the blueprint after mocking
from backend.app.routes.voice_quality import voice_quality_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.register_blueprint(voice_quality_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_clean_audio_error_leakage(client):
    """
    Test that clean_audio endpoint does not leak exception details.
    """
    # Mock validate_file_upload to pass
    with patch('backend.app.routes.voice_quality.validate_file_upload', return_value=(True, None)):
        # Patch load_audio or clean_audio_signal to raise an exception with sensitive info
        with patch('backend.app.routes.voice_quality.load_audio', side_effect=ValueError("SENSITIVE_DB_INFO_LEAK")):
            data = {
                'audio': (io.BytesIO(os.urandom(100)), 'test.wav')
            }
            response = client.post('/api/voice-quality/clean', data=data, content_type='multipart/form-data')

            # Check status code
            assert response.status_code == 500

            # Check that sensitive info is NOT in the response
            json_data = response.get_json()
            assert "SENSITIVE_DB_INFO_LEAK" not in json_data.get('error', '')
            assert json_data.get('error') == "An internal error occurred during audio cleaning."

def test_manipulate_file_error_leakage(client):
    """
    Test that manipulate_file endpoint does not leak exception details.
    """
    # Mock validate_file_upload to pass
    with patch('backend.app.routes.voice_quality.validate_file_upload', return_value=(True, None)):
        # Patch parselmouth which is imported inside the function
        # Since it's a local import, we patch sys.modules or the class where it is used if possible
        # Or easier: verify that manipulate_voice raises the error, assuming parselmouth works
        with patch('backend.app.services.voicelab_service.manipulate_voice', side_effect=ValueError("SENSITIVE_API_KEY_LEAK")):
            data = {
                'audio': (io.BytesIO(os.urandom(100)), 'test.wav'),
                'pitch_shift': 2.0
            }
            response = client.post('/api/voice-quality/manipulate', data=data, content_type='multipart/form-data')

            # Check status code
            assert response.status_code == 500

            # Check that sensitive info is NOT in the response
            json_data = response.get_json()
            assert "SENSITIVE_API_KEY_LEAK" not in json_data.get('error', '')
            assert json_data.get('error') == "An internal error occurred during voice manipulation."

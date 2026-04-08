import pytest
import os
import requests
from flask import Flask
from unittest.mock import patch, MagicMock
import sys

# Make sure we don't try to mock flask_limiter because backend.app.extensions uses its real objects
# We will just let it import naturally since we pip installed it.
if 'backend.extensions' in sys.modules:
    del sys.modules['backend.extensions']
if 'flask_limiter' in sys.modules:
    del sys.modules['flask_limiter']

from backend.app.routes.tts import tts_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(tts_bp)
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_tts_synthesize_error_leak(client, monkeypatch):
    import backend.app.routes.tts
    monkeypatch.setattr(backend.app.routes.tts, 'ELEVENLABS_API_KEY', 'test_key')

    with patch("backend.app.routes.tts.requests.post") as mock_post:
        mock_post.side_effect = requests.exceptions.RequestException("Sensitive Database Connection String Leaked Here")

        response = client.post('/api/tts/synthesize', json={"text": "Hello"})
        assert response.status_code == 502
        data = response.get_json()
        assert "Sensitive Database Connection String Leaked Here" not in data.get("error", "")
        assert "Failed to connect to ElevenLabs API." in data.get("error", "")

def test_tts_voices_error_leak(client, monkeypatch):
    import backend.app.routes.tts
    monkeypatch.setattr(backend.app.routes.tts, 'ELEVENLABS_API_KEY', 'test_key')

    with patch("backend.app.routes.tts.requests.get") as mock_get:
        mock_get.side_effect = requests.exceptions.RequestException("Sensitive ElevenLabs Connection String Leaked Here")

        response = client.get('/api/tts/voices')
        assert response.status_code == 502
        data = response.get_json()
        assert "Sensitive ElevenLabs Connection String Leaked Here" not in data.get("error", "")
        assert "Failed to connect to ElevenLabs API." in data.get("error", "")

def test_tts_response_error_leak(client, monkeypatch):
    import backend.app.routes.tts
    monkeypatch.setattr(backend.app.routes.tts, 'ELEVENLABS_API_KEY', 'test_key')

    with patch("backend.app.routes.tts.requests.post") as mock_post:
        mock_response = MagicMock()
        mock_response.ok = False
        mock_response.status_code = 401
        mock_response.text = "Sensitive ElevenLabs Internal Error"
        mock_post.return_value = mock_response

        response = client.post('/api/tts/synthesize', json={"text": "Hello"})
        assert response.status_code == 401
        data = response.get_json()
        assert "Sensitive ElevenLabs Internal Error" not in data.get("error", "")
        assert "Sensitive ElevenLabs Internal Error" not in data.get("details", "")
        assert "ElevenLabs API error: 401" in data.get("error", "")

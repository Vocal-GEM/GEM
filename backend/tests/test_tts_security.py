import pytest
from unittest.mock import patch, MagicMock
from flask import Flask, jsonify
import sys
import os

sys.path.append(os.path.abspath('backend'))
from app.routes.tts import tts_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    # Mock limiter
    from unittest.mock import MagicMock
    limiter = MagicMock()
    app.extensions['limiter'] = limiter
    app.register_blueprint(tts_bp)

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify(error="Internal Server Error"), 500

    # Mock ELEVENLABS_API_KEY globally for testing
    import app.routes.tts as tts_module
    tts_module.ELEVENLABS_API_KEY = 'test_key'

    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('app.routes.tts.requests.post')
def test_synthesize_ssrf_protection_valid_input(mock_post, client):
    """Test valid inputs are accepted."""
    mock_response = MagicMock()
    mock_response.ok = True
    mock_response.content = b'audio_data'
    mock_post.return_value = mock_response

    response = client.post('/api/tts/synthesize', json={
        'text': 'Hello world',
        'voiceId': 'valid_id-123',
        'modelId': 'valid_model_v2'
    })

    assert response.status_code == 200
    assert mock_post.called
    args, kwargs = mock_post.call_args
    assert 'valid_id-123' in args[0]

def test_synthesize_ssrf_protection_invalid_input(client):
    """Test invalid inputs are rejected."""

    # Invalid voiceId
    response = client.post('/api/tts/synthesize', json={
        'text': 'Hello world',
        'voiceId': '../malicious/path',
        'modelId': 'valid_model_v2'
    })
    assert response.status_code == 400
    assert 'Invalid voiceId format' in response.json['error']

    # Invalid modelId
    response = client.post('/api/tts/synthesize', json={
        'text': 'Hello world',
        'voiceId': 'valid_id-123',
        'modelId': 'invalid/model?param=1'
    })
    assert response.status_code == 400
    assert 'Invalid modelId format' in response.json['error']

    # None voiceId
    response = client.post('/api/tts/synthesize', json={
        'text': 'Hello world',
        'voiceId': None,
        'modelId': 'valid_model_v2'
    })
    assert response.status_code == 400

    # List voiceId
    response = client.post('/api/tts/synthesize', json={
        'text': 'Hello world',
        'voiceId': ['list', 'is', 'invalid'],
        'modelId': 'valid_model_v2'
    })
    assert response.status_code == 400

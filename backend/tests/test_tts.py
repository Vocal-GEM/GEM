import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_tts_ssrf_validation(client):
    invalid_payloads = [
        {"text": "hello", "voiceId": "../invalid"},
        {"text": "hello", "voiceId": "123?param=1"},
        {"text": "hello", "voiceId": "<script>"},
        {"text": "hello", "modelId": "../123"},
    ]

    # Mock environment variable to bypass the 503 check for missing API key
    import os
    os.environ['ELEVENLABS_API_KEY'] = 'mock_key'

    for payload in invalid_payloads:
        response = client.post('/api/tts/synthesize', json=payload)
        assert response.status_code == 400
        assert b"Invalid" in response.data

    # Test valid validation works
    # We will mock requests.post to just return a dummy response so it doesn't fail with connection errors
    from unittest.mock import patch
    with patch('app.routes.tts.requests.post') as mock_post:
        mock_response = type('MockResponse', (), {'ok': True, 'content': b'audio data'})()
        mock_post.return_value = mock_response

        valid_payload = {"text": "hello", "voiceId": "valid_id-123", "modelId": "model_123"}
        response = client.post('/api/tts/synthesize', json=valid_payload)

        assert response.status_code == 200
        assert response.data == b'audio data'
        assert mock_post.called

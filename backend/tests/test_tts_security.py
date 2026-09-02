from app import create_app
import pytest

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_tts_voices_no_key(client):
    response = client.get('/api/tts/voices')
    assert response.status_code == 503
    assert b"ElevenLabs API key not configured" in response.data

def test_tts_synthesize_no_key(client):
    response = client.post('/api/tts/synthesize', json={"text": "Hello"})
    assert response.status_code == 503
    assert b"ElevenLabs API key not configured" in response.data

import pytest
from unittest.mock import MagicMock, patch, ANY
import sys
import os
import io
from flask import Flask

# Ensure backend is in path
sys.path.append(os.path.abspath('backend'))

from backend.app.routes.community import community_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['LOGIN_DISABLED'] = True # Bypass login for this test

    # Mock extensions
    # We need to patch where they are imported IN THE MODULE
    with patch('backend.app.routes.community.db'):
        with patch('backend.app.routes.community.limiter'):
             app.register_blueprint(community_bp)
             yield app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('backend.app.routes.community.current_user')
@patch('backend.app.routes.community.validate_file_upload')
@patch('backend.app.routes.community.anonymize_audio')
@patch('backend.app.routes.community.secure_filename')
@patch('werkzeug.datastructures.FileStorage.save')
@patch('backend.app.routes.community.os')
@patch('backend.app.routes.community.db')
def test_share_voice_cleanup_logic(mock_db, mock_os, mock_storage_save, mock_secure_filename, mock_anonymize, mock_validate, mock_user, client):
    # Setup mocks
    mock_user.id = 123
    mock_storage_save.return_value = None
    mock_validate.return_value = (True, None)
    mock_secure_filename.return_value = 'safe_audio.wav'
    mock_anonymize.return_value = 'path/to/anon_audio.wav'

    # Mock os.path
    mock_os.path.join.return_value = '/fake/upload/path/123_timestamp_safe_audio.wav'
    mock_os.path.exists.return_value = True # File exists when checked for deletion
    mock_os.makedirs.return_value = None

    # Mock file upload
    data = {
        'audio': (io.BytesIO(b"fake audio content"), 'test.wav'),
        'context': 'Test context',
        'expiration_days': '7'
    }

    # Success Case
    response = client.post('/share-voice', data=data, content_type='multipart/form-data')

    assert response.status_code == 200

    # Verify execution order and cleanup

    # 1. Validation called
    mock_validate.assert_called()

    # 2. Anonymize called with correct path
    mock_anonymize.assert_called_with('/fake/upload/path/123_timestamp_safe_audio.wav')

    # 3. Cleanup called (os.remove)
    # verify it was called with the filepath
    mock_os.remove.assert_called_with('/fake/upload/path/123_timestamp_safe_audio.wav')

    # Failure Case (Anonymization fails)
    mock_anonymize.side_effect = Exception("Anonymization failed")
    mock_os.remove.reset_mock()

    # Re-create data for the second request because the stream was consumed
    data = {
        'audio': (io.BytesIO(b"fake audio content"), 'test.wav'),
        'context': 'Test context',
        'expiration_days': '7'
    }

    response_error = client.post('/share-voice', data=data, content_type='multipart/form-data')
    assert response_error.status_code == 500

    # Cleanup should still be called
    mock_os.remove.assert_called_with('/fake/upload/path/123_timestamp_safe_audio.wav')

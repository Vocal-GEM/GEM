import pytest
from unittest.mock import MagicMock, patch
import sys
import os
from flask import Flask
import io

# Mock dependencies that might be missing or slow
sys.modules['librosa'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['numpy'] = MagicMock()

# Ensure we can import backend modules
sys.path.append(os.path.abspath('.'))

# We need to mock models and extensions to avoid side effects during import
# We will use patch.dict on sys.modules but we need to retain some things.
# It's easier to let them import but mock their content if possible.
# But extensions imports things.

# Let's rely on standard imports but mock the side-effect heavy parts in the fixture or test.
# The route file imports:
# from ..extensions import db, limiter
# from ..models import ...

# If we run this test in an environment where dependencies are missing, it might fail.
# Sentinel's environment seems to have requirements installed (based on available tools).

# We will try to import the blueprint.
try:
    from backend.app.routes.community import community_bp, anonymize_audio
except ImportError as e:
    # If this fails, we might need to adjust python path
    print(f"ImportError: {e}")
    # Try adding backend to path explicitly if not working
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from backend.app.routes.community import community_bp, anonymize_audio

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['LOGIN_DISABLED'] = True # Bypass @login_required
    app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
    app.config['SECRET_KEY'] = 'test-secret'

    # Initialize limiter with the app (it's used in decorators)
    # Since the decorators are already applied, we need the limiter extension to be attached to app.
    from backend.app.extensions import limiter
    limiter.init_app(app)

    # Register blueprint
    app.register_blueprint(community_bp, url_prefix='/api/community')

    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('backend.app.routes.community.current_user')
@patch('backend.app.routes.community.db')
@patch('backend.app.routes.community.anonymize_audio')
@patch('backend.app.routes.community.validate_file_upload')
@patch('backend.app.routes.community.sanitize_html')
@patch('os.remove')
@patch('os.path.exists')
@patch('werkzeug.datastructures.FileStorage.save')
def test_share_voice_cleanup(mock_save, mock_exists, mock_remove, mock_sanitize, mock_validate, mock_anonymize, mock_db, mock_user, client, app):
    """
    Test that the original audio file is deleted after anonymization.
    This verifies the fix for the security vulnerability where raw audio might be retained.
    """
    # Setup mocks
    mock_user.id = 1
    mock_validate.return_value = (True, None)
    mock_sanitize.return_value = 'safe context'
    mock_anonymize.return_value = '/tmp/uploads/anon_test.wav'

    # Important: mock_exists must return True so that os.remove is attempted
    mock_exists.return_value = True

    # Prepare multipart upload data
    data = {
        'audio': (io.BytesIO(b'fake audio content'), 'test.wav'),
        'context': 'I want to share my voice',
        'expiration_days': 7
    }

    # Execute request
    response = client.post('/api/community/share-voice', data=data, content_type='multipart/form-data')

    # Debug info if fails
    if response.status_code != 200:
        print(f"Response: {response.data}")

    # Assertions
    assert response.status_code == 200

    # Verify save was called (file must be saved before anonymization)
    assert mock_save.called

    # Verify anonymize was called
    assert mock_anonymize.called

    # Verify os.remove was called (The Fix)
    assert mock_remove.called

    # Check that os.remove was called with the path that was saved
    # Get the path passed to save
    args, _ = mock_save.call_args
    filepath = args[0]

    # Check remove called with same path
    mock_remove.assert_called_with(filepath)

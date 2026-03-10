import pytest
from unittest.mock import MagicMock, patch
import sys
import os
import importlib.util

# Ensure backend is in path
sys.path.insert(0, os.path.abspath('.'))

# --- MOCK SETUP START ---

mock_flask = MagicMock()
mock_flask_login = MagicMock()
mock_werkzeug = MagicMock()
mock_werkzeug_utils = MagicMock()

# HELPER: Identity Decorators
def identity(f):
    return f

def identity_factory(*args, **kwargs):
    return identity

# Configure Flask Login
mock_flask_login.login_required = identity

# Configure Flask
mock_bp = MagicMock()
# route returns a decorator, which returns the function
mock_bp.route.side_effect = identity_factory
mock_flask.Blueprint.return_value = mock_bp
mock_flask.jsonify = lambda x: (x, 400 if 'error' in x else 200)

sys.modules['flask'] = mock_flask
sys.modules['flask_login'] = mock_flask_login
sys.modules['werkzeug'] = mock_werkzeug
sys.modules['werkzeug.utils'] = mock_werkzeug_utils

# Mock App Structure
sys.modules['backend'] = MagicMock()
sys.modules['backend.app'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()

# Configure Extensions (limiter)
mock_extensions = sys.modules['backend.app.extensions']
mock_extensions.limiter.limit.side_effect = identity_factory

# Configure Validator Mocks
mock_validators = sys.modules['backend.app.validators']
mock_validators.validate_file_upload.return_value = (True, None)
mock_validators.sanitize_html = lambda x: x

# Load Module
community_path = os.path.abspath('backend/app/routes/community.py')
spec = importlib.util.spec_from_file_location("backend.app.routes.community", community_path)
community = importlib.util.module_from_spec(spec)
sys.modules["backend.app.routes.community"] = community
spec.loader.exec_module(community)

# --- TEST FIXTURES ---

@pytest.fixture
def mock_app_context():
    community.current_app.config = {'UPLOAD_FOLDER': '/tmp/uploads'}
    community.current_app.logger = MagicMock()
    return community.current_app

@pytest.fixture
def mock_user():
    community.current_user.id = 'user123'
    return community.current_user

# --- TESTS ---

def test_share_voice_cleanup_on_success(mock_app_context, mock_user):
    """Test that original file is deleted after successful anonymization"""

    # Setup Request
    mock_file = MagicMock()
    mock_file.filename = 'test.wav'
    community.request.files = {'audio': mock_file}
    community.request.form = {'context': 'test', 'expiration_days': '7'}

    # Setup Validators
    community.validate_file_upload.return_value = (True, None)
    community.sanitize_html.return_value = 'sanitized'

    # Patch dependencies
    with patch.object(community, 'anonymize_audio', return_value='/tmp/uploads/test_anon.wav'):
        with patch.object(community.os.path, 'exists', return_value=True):
            with patch.object(community.os, 'remove') as mock_remove:
                with patch.object(community.os, 'makedirs'):

                    # Call
                    response = community.share_voice()

                    # Debug
                    if isinstance(response, MagicMock):
                         pytest.fail(f"share_voice returned a Mock: {response}. Decorators not bypassed?")

                    if response[1] != 200:
                        print(f"FAILED Response: {response[0]}")

                    # Assertions
                    assert mock_remove.called, "os.remove should be called"
                    assert mock_file.save.called, "file.save should be called"

def test_share_voice_cleanup_on_error(mock_app_context, mock_user):
    """Test that original file is deleted even if anonymization fails"""

    mock_file = MagicMock()
    mock_file.filename = 'test.wav'
    community.request.files = {'audio': mock_file}
    community.validate_file_upload.return_value = (True, None)

    # Force error
    with patch.object(community, 'anonymize_audio', side_effect=Exception("Fail")):
         with patch.object(community.os.path, 'exists', return_value=True):
            with patch.object(community.os, 'remove') as mock_remove:
                with patch.object(community.os, 'makedirs'):

                    response = community.share_voice()

                    assert response[1] == 500, "Should return 500 on error"
                    assert mock_remove.called, "os.remove should be called even on error"

def test_submit_success_story_sanitization(mock_user):
    """Test success story submission sanitizes input"""

    data = {
        'title': '<h1>Title</h1>',
        'story': '<script>alert(1)</script>Story',
        'techniques_used': ['<b>T</b>'],
        'consent_public': True
    }
    community.request.get_json.return_value = data

    MockStory = MagicMock()
    community.SuccessStory = MockStory
    community.check_moderation = MagicMock(return_value=(True, []))

    def fake_sanitize(x):
        if not isinstance(x, str): return str(x)
        return x.replace('<h1>', '').replace('</h1>', '').replace('<script>', '').replace('</script>', '')

    community.sanitize_html = MagicMock(side_effect=fake_sanitize)

    response = community.submit_success_story()

    if isinstance(response, MagicMock):
         pytest.fail(f"submit_success_story returned a Mock: {response}")

    assert MockStory.called, "SuccessStory constructor should be called"

    call_args = MockStory.call_args[1]

    assert call_args['title'] == 'Title'
    assert call_args['story'] == 'alert(1)Story'

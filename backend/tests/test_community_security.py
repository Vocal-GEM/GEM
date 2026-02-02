import pytest
from unittest.mock import MagicMock, patch
import sys
import os
from flask import Flask

# Ensure backend is in path
sys.path.append(os.path.abspath('backend'))

# Mock extensions and models before importing blueprint
from backend.app.validators import sanitize_html

def test_sanitize_html_xss():
    """Test that HTML sanitization removes XSS vectors"""

    # Test cases
    payloads = [
        # Input, Expected (Bleach strips tags but keeps text content by default)
        ("<script>alert('xss')</script>", "alert('xss')"),
        ("<img src=x onerror=alert(1)>", ""), # img is not allowed, no content, so it disappears
        ("<a href='javascript:alert(1)'>Click me</a>", "<a>Click me</a>"), # href sanitization removes unsafe scheme
        ("Hello <script>bad</script> World", "Hello bad World"),
        ("<b>Bold</b> and <i>Italic</i>", "<b>Bold</b> and <i>Italic</i>"), # Allowed tags
    ]

    for input_text, expected in payloads:
        sanitized = sanitize_html(input_text)

        # Security Assertions
        assert "<script>" not in sanitized
        assert "javascript:" not in sanitized
        assert "onerror" not in sanitized

        # Functional Assertions
        assert sanitized == expected

def test_community_module_integrity():
    """Verify backend.app.routes.community can be imported (syntax check)"""
    try:
        from backend.app.routes import community
        assert community.community_bp is not None
    except ImportError as e:
        pytest.fail(f"Failed to import community module: {e}")
    except SyntaxError as e:
        pytest.fail(f"Syntax error in community module: {e}")

def test_share_voice_fail_secure():
    """Test that original file is deleted even if anonymization fails"""
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = '/tmp/test_uploads'
    app.config['SECRET_KEY'] = 'test_key' # Required for sessions/login

    # Initialize LoginManager
    from flask_login import LoginManager, login_user
    login_manager = LoginManager()
    login_manager.init_app(app)

    class MockUser:
        def __init__(self, id):
            self.id = id
            self.is_active = True
            self.is_authenticated = True
            self.is_anonymous = False
        def get_id(self):
            return str(self.id)

    @login_manager.user_loader
    def load_user(user_id):
        return MockUser(user_id)

    # Mock limiter to do nothing
    with patch('backend.app.routes.community.limiter.limit', side_effect=lambda x: lambda f: f):
        from backend.app.routes.community import share_voice

        with app.test_request_context():
            # Login a user
            login_user(MockUser(1))

            # Setup mocks
            with patch('backend.app.routes.community.anonymize_audio') as mock_anonymize, \
                 patch('backend.app.routes.community.os.remove') as mock_remove, \
                 patch('backend.app.routes.community.os.path.exists') as mock_exists, \
                 patch('backend.app.routes.community.request') as mock_request, \
                 patch('backend.app.routes.community.validate_file_upload') as mock_validate, \
                 patch('backend.app.routes.community.secure_filename') as mock_secure:

                # Mock behaviors
                mock_exists.return_value = True
                mock_anonymize.side_effect = Exception("Anonymization failed") # Simulate failure
                mock_validate.return_value = (True, None)
                mock_secure.return_value = "safe.wav"

                # Mock file upload
                file_mock = MagicMock()
                file_mock.filename = 'test.wav'
                # When using request.files['audio'], it returns this mock
                mock_request.files = {'audio': file_mock}
                mock_request.form = {'context': 'test'}

                # Call the function
                response = share_voice()

                # Assertions
                # Check that we got a 500 error
                assert response[1] == 500

                # CRITICAL: Verify os.remove was called to delete the raw file
                # This confirms the fail-secure logic works
                assert mock_remove.called

                # Verify we tried to remove the expected file path
                args, _ = mock_remove.call_args
                assert 'safe.wav' in args[0]

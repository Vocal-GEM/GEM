import pytest
from unittest.mock import MagicMock, patch
import sys
import os
import io

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
    """Test that original file is deleted if anonymization fails"""
    from flask import Flask
    # Import inside test to avoid module-level side effects during collection if imports fail
    try:
        from backend.app.routes.community import share_voice
    except ImportError:
        pytest.fail("Could not import share_voice - module integrity check likely failed")

    # Create a minimal app context
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = '/tmp/test'
    app.config['SECRET_KEY'] = 'testing'
    app.config['LOGIN_DISABLED'] = True # Bypass @login_required decorator check

    # We need to mock the limiter extension on the app or it might fail if used
    # But share_voice uses @limiter.limit. The limiter object is imported from ..extensions
    # We might need to ensure that limiter is attached to app, or mock it out.
    # Usually if limiter is not initialized with app, it might raise error or do nothing.

    # Mock current_user
    with patch('backend.app.routes.community.current_user') as mock_user:
        mock_user.is_authenticated = True
        mock_user.id = 999

        # Mock request files
        # Note: In test_request_context, file data needs to be passed carefully
        data = {
            'audio': (io.BytesIO(b"fake wav content"), 'test.wav'),
            'context': 'security test'
        }

        # Mock other dependencies
        with patch('backend.app.routes.community.validate_file_upload', return_value=(True, None)), \
             patch('backend.app.routes.community.anonymize_audio', side_effect=Exception("Conversion failed")) as mock_anon, \
             patch('backend.app.routes.community.os.remove') as mock_remove, \
             patch('backend.app.routes.community.os.path.exists', return_value=True), \
             patch('backend.app.routes.community.db.session.add'), \
             patch('backend.app.routes.community.db.session.commit'), \
             patch('backend.app.routes.community.secure_filename', return_value='test.wav'), \
             patch('backend.app.routes.community.os.makedirs'), \
             patch('werkzeug.datastructures.FileStorage.save') as mock_save: # Mock actual save

             # Create a request context
             with app.test_request_context('/share-voice', method='POST', data=data, content_type='multipart/form-data'):

                 # Call the view function
                 try:
                     response = share_voice()
                 except Exception as e:
                     # If decorators fail (e.g. limiter), we might catch it here
                     # But we expect the function to return 500
                     pytest.fail(f"share_voice raised exception: {e}")

                 # Verify response is error (Tuple: (json, 500))
                 assert response[1] == 500
                 assert response[0].json['error'] == 'Failed to share voice sample'

                 # CRITICAL CHECK: Verify cleanup happened
                 # The fail-secure logic is: if anonymize fails, delete the raw file
                 mock_remove.assert_called_once()
                 # Ensure we tried to delete the file path that was "saved"
                 # We can check args if we want, but called is sufficient for "fail secure" intent

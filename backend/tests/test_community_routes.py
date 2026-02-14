import unittest
import sys
import os
from unittest.mock import MagicMock, patch, ANY

# Mock modules before importing community
mock_flask = MagicMock()

# Configure Blueprint.route to be a pass-through decorator
def route_side_effect(*args, **kwargs):
    def decorator(f):
        return f
    return decorator

mock_blueprint_instance = MagicMock()
mock_blueprint_instance.route.side_effect = route_side_effect
mock_flask.Blueprint.return_value = mock_blueprint_instance

sys.modules['flask'] = mock_flask

mock_login = MagicMock()
# Ensure login_required acts as a pass-through decorator
# We need to set side_effect to return the argument (function)
def login_required_side_effect(func):
    return func
mock_login.login_required.side_effect = login_required_side_effect
sys.modules['flask_login'] = mock_login

sys.modules['werkzeug.utils'] = MagicMock()

# Configure extensions with pass-through limiter decorator
mock_extensions = MagicMock()
mock_limiter = MagicMock()
# limit returns a decorator, which takes a function and returns it
mock_limiter.limit.return_value = lambda func: func
mock_extensions.limiter = mock_limiter
sys.modules['backend.app.extensions'] = mock_extensions

sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.models'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['flask_sqlalchemy'] = MagicMock()
sys.modules['flask_socketio'] = MagicMock()
sys.modules['flask_limiter'] = MagicMock()
sys.modules['flask_wtf'] = MagicMock()
sys.modules['eventlet'] = MagicMock()
sys.modules['dotenv'] = MagicMock()
sys.modules['bleach'] = MagicMock()
sys.modules['filetype'] = MagicMock()
sys.modules['numpy'] = MagicMock()
sys.modules['librosa'] = MagicMock()
sys.modules['soundfile'] = MagicMock()

# Configure specific mocks
# We need to ensure that 'request' used in community.py is the same as we configure here
# But since we mocked 'flask' module, import flask inside community.py will use that mock.

# Now import the module under test
if os.path.abspath('backend') not in sys.path:
    sys.path.append(os.path.abspath('backend'))

from backend.app.routes import community

# Helper to configure the request mock seen by community.py
def configure_request(files=None, form=None, json_data=None):
    # community.request is the object imported from flask
    # Since flask is mocked, community.request IS mock_flask.request
    req = community.request
    req.files = files or {}
    req.form = form or {}
    req.get_json.return_value = json_data or {}
    return req

class TestCommunitySecurity(unittest.TestCase):
    def setUp(self):
        # Mock current_user
        self.mock_user = MagicMock()
        self.mock_user.id = 123
        community.current_user = self.mock_user

        # Mock config
        community.current_app.config = {'UPLOAD_FOLDER': '/tmp/uploads'}

        # Mock db session
        community.db.session = MagicMock()

        # Mock validators - patch them directly in the module
        self.validate_patcher = patch('backend.app.routes.community.validate_file_upload', return_value=(True, None))
        self.sanitize_patcher = patch('backend.app.routes.community.sanitize_html', side_effect=lambda x: x.replace('<script>', '').replace('</script>', '') if x else x)
        self.secure_filename_patcher = patch('backend.app.routes.community.secure_filename', side_effect=lambda x: x)

        self.mock_validate = self.validate_patcher.start()
        self.mock_sanitize = self.sanitize_patcher.start()
        self.mock_secure = self.secure_filename_patcher.start()

    def tearDown(self):
        self.validate_patcher.stop()
        self.sanitize_patcher.stop()
        self.secure_filename_patcher.stop()

    @patch('backend.app.routes.community.os')
    @patch('backend.app.routes.community.anonymize_audio')
    def test_share_voice_cleanup_on_success(self, mock_anonymize, mock_os):
        """Test that original file is deleted after successful anonymization"""
        # Setup
        mock_file = MagicMock()
        mock_file.filename = 'test.wav'

        configure_request(
            files={'audio': mock_file},
            form={'context': 'test context'}
        )

        mock_anonymize.return_value = '/tmp/uploads/test_anon.wav'
        mock_os.path.join.return_value = '/tmp/uploads/test.wav'
        mock_os.path.exists.return_value = True

        # Execute
        response = community.share_voice()

        # Verify
        mock_file.save.assert_called_with('/tmp/uploads/test.wav')
        mock_anonymize.assert_called_with('/tmp/uploads/test.wav')

        # Verify cleanup
        mock_os.remove.assert_called_with('/tmp/uploads/test.wav')

        # Verify DB insertion
        community.db.session.add.assert_called()
        community.db.session.commit.assert_called()

    @patch('backend.app.routes.community.os')
    @patch('backend.app.routes.community.anonymize_audio')
    def test_share_voice_cleanup_on_failure(self, mock_anonymize, mock_os):
        """Test that original file is deleted even if anonymization fails"""
        # Setup
        mock_file = MagicMock()
        mock_file.filename = 'test.wav'

        configure_request(files={'audio': mock_file})

        mock_anonymize.side_effect = Exception("Anonymization failed")
        mock_os.path.join.return_value = '/tmp/uploads/test.wav'
        mock_os.path.exists.return_value = True

        # Execute
        response = community.share_voice()

        # Verify cleanup
        mock_os.remove.assert_called_with('/tmp/uploads/test.wav')

    def test_submit_story_sanitization(self):
        """Test that story submission sanitizes inputs"""
        # Setup
        payload = {
            'title': '<script>Bad Title</script>',
            'story': 'Good Content',
            'techniques_used': ['<script>bad tech</script>']
        }
        configure_request(json_data=payload)

        # Mock moderation
        with patch('backend.app.routes.community.check_moderation') as mock_mod:
            mock_mod.return_value = (True, [])

            # Execute
            community.submit_success_story()

            # Verify sanitization calls
            self.mock_sanitize.assert_any_call('<script>Bad Title</script>')
            self.mock_sanitize.assert_any_call('<script>bad tech</script>')

            # Verify DB add
            # Check what SuccessStory was initialized with
            # Since we didn't keep a reference to the class mock easily,
            # we can inspect the call args of the mocked class used in community module

            # But wait, we can just check if sanitize_html was called correctly, which we did.
            # And we can verify db.session.add was called.

            # Let's verify that SuccessStory constructor was called with sanitized values
            # We need to access the mock object for the class
            from backend.app.routes.community import SuccessStory

            # Verify the call arguments to the constructor
            # SuccessStory(...) call
            call_args = SuccessStory.call_args
            kwargs = call_args.kwargs
            self.assertEqual(kwargs['title'], 'Bad Title')
            self.assertEqual(kwargs['story'], 'Good Content') # sanitized (no change)

if __name__ == '__main__':
    unittest.main()

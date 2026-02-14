import unittest
from unittest.mock import MagicMock, patch, ANY
import sys
import os
import importlib.util

# --- MOCK SETUP START ---
mock_flask = MagicMock()
mock_flask_login = MagicMock()
mock_werkzeug_utils = MagicMock()
mock_extensions = MagicMock()
mock_validators = MagicMock()
mock_models = MagicMock()

# Setup decorators to be transparent
def transparent_decorator(*args, **kwargs):
    def decorator(f):
        return f
    return decorator

mock_bp = MagicMock()
mock_bp.route.side_effect = transparent_decorator
mock_flask.Blueprint.return_value = mock_bp

mock_flask_login.login_required = lambda x: x

mock_limiter = MagicMock()
mock_limiter.limit.side_effect = transparent_decorator
mock_extensions.limiter = mock_limiter

mock_werkzeug_utils.secure_filename = lambda x: x

# Mock validators
mock_validators.validate_file_upload = MagicMock(return_value=(True, None))
mock_validators.sanitize_html = MagicMock(side_effect=lambda x: f"sanitized_{x}" if x else "")

# Apply mocks to sys.modules
sys.modules['flask'] = mock_flask
sys.modules['flask_login'] = mock_flask_login
sys.modules['werkzeug.utils'] = mock_werkzeug_utils
sys.modules['backend.app.extensions'] = mock_extensions
sys.modules['backend.app.validators'] = mock_validators
sys.modules['backend.app.models'] = mock_models

# --- MOCK SETUP END ---

# Now import the module under test
sys.path.append(os.getcwd())

spec = importlib.util.spec_from_file_location("backend.app.routes.community", os.path.join(os.getcwd(), "backend/app/routes/community.py"))
community = importlib.util.module_from_spec(spec)
sys.modules["backend.app.routes.community"] = community
community.__package__ = "backend.app.routes"

try:
    spec.loader.exec_module(community)
except Exception as e:
    print(f"Import Error: {e}")

class TestCommunitySecurity(unittest.TestCase):

    def setUp(self):
        # Reset mocks
        mock_models.SharedVoiceSample.reset_mock()
        mock_models.SuccessStory.reset_mock()
        mock_validators.validate_file_upload.reset_mock()
        mock_validators.sanitize_html.reset_mock()
        mock_extensions.db.session.reset_mock()

    def test_share_voice_security_flow(self):
        mock_request = MagicMock()
        mock_user = MagicMock()
        mock_anonymize = MagicMock()
        mock_makedirs = MagicMock()
        mock_join = MagicMock()
        mock_exists = MagicMock()
        mock_remove = MagicMock()
        mock_app = MagicMock()

        mock_file = MagicMock()
        mock_file.filename = 'test.wav'
        mock_request.files = {'audio': mock_file}
        mock_request.form = {'context': 'test context', 'expiration_days': '7'}

        mock_user.id = 123
        mock_join.return_value = '/tmp/uploads/123_test.wav'
        mock_anonymize.return_value = '/tmp/uploads/123_test_anon.wav'
        mock_exists.return_value = True
        mock_app.config.get.return_value = '/tmp/uploads'

        # Ensure validate_file_upload returns True
        # community.validate_file_upload is the mock from sys.modules
        mock_validators.validate_file_upload.return_value = (True, None)

        with patch.object(community, 'request', mock_request), \
             patch.object(community, 'current_user', mock_user), \
             patch.object(community, 'anonymize_audio', mock_anonymize), \
             patch.object(community, 'current_app', mock_app), \
             patch('os.makedirs', mock_makedirs), \
             patch('os.path.join', mock_join), \
             patch('os.path.exists', mock_exists), \
             patch('os.remove', mock_remove):

            response = community.share_voice()

        # Verify
        mock_anonymize.assert_called_with('/tmp/uploads/123_test.wav')
        mock_remove.assert_called_with('/tmp/uploads/123_test.wav')

        mock_extensions.db.session.add.assert_called()
        mock_models.SharedVoiceSample.assert_called()
        kwargs = mock_models.SharedVoiceSample.call_args[1]
        self.assertEqual(kwargs['audio_path'], '/tmp/uploads/123_test_anon.wav')
        self.assertEqual(kwargs['context'], 'sanitized_test context')

    def test_submit_success_story_security_flow(self):
        mock_request = MagicMock()
        mock_user = MagicMock()
        mock_moderation = MagicMock()

        mock_request.get_json.return_value = {
            'title': 'My Story',
            'story': 'I improved my voice.',
            'techniques_used': ['humming'],
            'voice_goal': 'feminine'
        }

        mock_moderation.return_value = (True, [])
        mock_user.id = 123

        with patch.object(community, 'request', mock_request), \
             patch.object(community, 'current_user', mock_user), \
             patch.object(community, 'check_moderation', mock_moderation):

            community.submit_success_story()

        mock_validators.sanitize_html.assert_any_call('My Story')
        mock_validators.sanitize_html.assert_any_call('I improved my voice.')

        mock_moderation.assert_called_with('sanitized_My Story sanitized_I improved my voice.')

        mock_extensions.db.session.add.assert_called()
        mock_models.SuccessStory.assert_called()
        kwargs = mock_models.SuccessStory.call_args[1]
        self.assertEqual(kwargs['title'], 'sanitized_My Story')
        self.assertTrue(kwargs['approved'])

    def test_share_voice_cleanup_on_error(self):
        mock_request = MagicMock()
        mock_user = MagicMock()
        mock_anonymize = MagicMock()
        mock_makedirs = MagicMock()
        mock_join = MagicMock()
        mock_exists = MagicMock()
        mock_remove = MagicMock()
        mock_app = MagicMock()

        mock_file = MagicMock()
        mock_file.filename = 'test.wav'
        mock_request.files = {'audio': mock_file}
        mock_request.form = {'context': 'test context', 'expiration_days': '7'}

        mock_join.return_value = '/tmp/uploads/123_test.wav'
        # Anonymization FAILS
        mock_anonymize.side_effect = Exception("Anonymization failed")
        mock_exists.return_value = True

        with patch.object(community, 'request', mock_request), \
             patch.object(community, 'current_user', mock_user), \
             patch.object(community, 'anonymize_audio', mock_anonymize), \
             patch.object(community, 'current_app', mock_app), \
             patch('os.makedirs', mock_makedirs), \
             patch('os.path.join', mock_join), \
             patch('os.path.exists', mock_exists), \
             patch('os.remove', mock_remove):

            response = community.share_voice()

        # Verify
        mock_anonymize.assert_called()
        mock_remove.assert_called_with('/tmp/uploads/123_test.wav')

        # response is tuple (response, 500)
        self.assertEqual(response[1], 500)

if __name__ == '__main__':
    unittest.main()

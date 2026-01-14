import unittest
from unittest.mock import MagicMock, patch
import sys
import os
from flask import Flask

# 1. Mock dependencies BEFORE importing routes
# We need to mock 'app.extensions' because we import 'app' as a top-level package
sys.modules['app.extensions'] = MagicMock()
sys.modules['app.extensions'].limiter.limit = lambda x: lambda f: f

sys.modules['app.models'] = MagicMock()
# We use the REAL app.validators to verify sanitization logic works
# sys.modules['app.validators'] = MagicMock()

# Also mock backend.app.* just in case
sys.modules['backend.app.extensions'] = sys.modules['app.extensions']
sys.modules['backend.app.models'] = sys.modules['app.models']
# sys.modules['backend.app.validators'] = sys.modules['app.validators']


# 2. Import the blueprint/routes
# Add the backend directory to sys.path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.routes.community import community_bp, submit_success_story

class TestCommunityXSS(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(community_bp)
        self.app.config['TESTING'] = True

    def test_submit_success_story_sanitizes_html(self):
        """
        Test that submitting a story with XSS payload results in sanitized content.
        """
        xss_payload = "<script>alert(1)</script>"
        title_payload = "<b>Bold</b>"

        # Setup request context with JSON data
        with self.app.test_request_context(
            '/success-stories',
            method='POST',
            json={
                'title': title_payload,
                'story': xss_payload,
                'timeline_months': 1,
                'voice_goal': 'feminine',
                'consent_public': True
            }
        ):
            # Mock current_user to bypass login_required check and provide ID
            # We patch flask_login.utils._get_user which is what current_user uses
            with patch('flask_login.utils._get_user') as mock_get_user:
                user = MagicMock()
                user.is_authenticated = True
                user.id = 123
                mock_get_user.return_value = user

                # Mock check_moderation to allow the content
                with patch('app.routes.community.check_moderation', return_value=(True, [])):

                    # Capture the SuccessStory constructor call
                    mock_success_story_class = sys.modules['app.models'].SuccessStory

                    # Configure the instance returned by the constructor to have serializable attributes
                    mock_story_instance = mock_success_story_class.return_value
                    mock_story_instance.id = 1
                    mock_story_instance.approved = True

                    # Call the route function
                    response = submit_success_story()

                    # Check if response is a tuple (error) or Response object
                    if isinstance(response, tuple):
                        status_code = response[1]
                        self.fail(f"Route returned error status: {status_code}")
                    else:
                        self.assertEqual(response.status_code, 200)

                    # Check what was passed to SuccessStory constructor
                    call_args = mock_success_story_class.call_args[1] # kwargs

                    # Verify sanitization
                    # <script> should be removed (strip=True in sanitize_html)
                    # <b> is allowed, so it should remain
                    self.assertNotIn("<script>", call_args['story'])
                    self.assertEqual(call_args['title'], title_payload)

if __name__ == '__main__':
    unittest.main()

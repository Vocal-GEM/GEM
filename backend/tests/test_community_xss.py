
import unittest
from unittest.mock import MagicMock, patch
from flask import Flask, json
from backend.app.routes.community import community_bp
from backend.app.models import SuccessStory, User
from flask_login import LoginManager, UserMixin, login_user

class TestCommunitySecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test'
        self.app.config['WTF_CSRF_ENABLED'] = False

        # Initialize LoginManager
        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Define user loader
        @self.login_manager.user_loader
        def load_user(user_id):
            u = User()
            u.id = 1
            u.username = "testuser"
            return u

        self.app.register_blueprint(community_bp, url_prefix='/api/community')
        self.client = self.app.test_client()

        # Mock db session
        self.db_patcher = patch('backend.app.routes.community.db.session')
        self.mock_db_session = self.db_patcher.start()

        # Mock check_moderation to allow everything
        self.mod_patcher = patch('backend.app.routes.community.check_moderation')
        self.mock_check_moderation = self.mod_patcher.start()
        self.mock_check_moderation.return_value = (True, [])

        # Mock limiter
        self.limiter_patcher = patch('backend.app.routes.community.limiter')
        self.mock_limiter = self.limiter_patcher.start()
        self.mock_limiter.limit.side_effect = lambda x: lambda f: f

        # Context for login
        self.ctx = self.app.test_request_context()
        self.ctx.push()

        # Login a user
        u = User()
        u.id = 1
        u.username = "testuser"
        login_user(u)

    def tearDown(self):
        self.ctx.pop()
        self.db_patcher.stop()
        self.mod_patcher.stop()
        self.limiter_patcher.stop()

    def test_stored_xss_prevention(self):
        """
        Verify that HTML content IS sanitized in the fixed implementation.
        """
        payload = {
            "title": "My Story <script>alert('XSS')</script>",
            "story": "This is a story with <b>bold</b> and <img src=x onerror=alert(1)>",
            "timeline_months": 12,
            "voice_goal": "feminine",
            "consent_public": True,
            "techniques_used": ["pitch", "resonance"]
        }

        # Mock SuccessStory constructor to capture arguments
        with patch('backend.app.routes.community.SuccessStory') as MockSuccessStory:
            mock_story_instance = MockSuccessStory.return_value
            mock_story_instance.id = 123
            mock_story_instance.approved = True

            response = self.client.post('/api/community/success-stories',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            self.assertEqual(response.status_code, 200)

            call_args = MockSuccessStory.call_args[1]

            # Verify malicious tags are removed
            self.assertNotIn("<script>", call_args['title'])
            self.assertNotIn("<img", call_args['story'])

            # Verify allowed tags are kept
            self.assertIn("<b>bold</b>", call_args['story'])

if __name__ == '__main__':
    unittest.main()

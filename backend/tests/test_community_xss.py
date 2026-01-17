import unittest
from flask import Flask, json
from flask_login import LoginManager, UserMixin
import sys
from unittest.mock import MagicMock

# Mock dependencies before imports
# We need to mock models and extensions because they require DB connection
# We mock both 'backend.app' and 'app' paths to be safe
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['app.models'] = sys.modules['backend.app.models']
sys.modules['app.extensions'] = sys.modules['backend.app.extensions']

# Mock limiter to just pass through
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f

# Mock models specifically so we can inspect constructor
mock_models = sys.modules['backend.app.models']
mock_success_story = MagicMock()
mock_models.SuccessStory = mock_success_story

# Mock other models used in community.py
mock_models.SharedVoiceSample = MagicMock()
mock_models.UserConnection = MagicMock()
mock_models.GroupChallenge = MagicMock()
mock_models.GroupChallengeParticipant = MagicMock()
mock_models.ModerationFlag = MagicMock()
mock_models.CommunityBenchmark = MagicMock()

import os
# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.routes.community import community_bp

class TestXSS(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test'
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.app.register_blueprint(community_bp, url_prefix='/api/community')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)
        self.client = self.app.test_client()

    def test_submit_story_xss(self):
        # Setup login
        with self.client.session_transaction() as sess:
            sess['_user_id'] = '1'
            sess['_fresh'] = True

        @self.login_manager.user_loader
        def load_user(user_id):
            class User(UserMixin):
                id = int(user_id)
                username = 'testuser'
            return User()

        payload = {
            'title': 'My Story <script>alert("XSS")</script>',
            'story': 'This is a story with <b>bold</b> and <img src=x onerror=alert(1)>'
        }

        # Reset mock and configure return values
        mock_success_story.reset_mock()
        mock_instance = mock_success_story.return_value
        mock_instance.id = 123
        mock_instance.approved = True

        response = self.client.post('/api/community/success-stories',
                                   data=json.dumps(payload),
                                   content_type='application/json')

        self.assertEqual(response.status_code, 200)

        # Verify SuccessStory was called
        self.assertTrue(mock_success_story.called)

        # Get args
        call_args = mock_success_story.call_args[1] # kwargs
        title = call_args['title']
        story = call_args['story']

        # Expect sanitization
        # bleach with strip=True removes <script> entirely
        self.assertNotIn('<script>', title, "Title should verify XSS payload is removed")
        self.assertNotIn('<img', story, "Story should verify XSS payload is removed")
        self.assertIn('<b>bold</b>', story, "Allowed tags should be preserved")

if __name__ == '__main__':
    unittest.main()

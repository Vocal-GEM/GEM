import unittest
from flask import Flask, jsonify
from flask_login import LoginManager, UserMixin
from unittest.mock import MagicMock
import sys
import os
import json

# Mock dependencies
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f

# Ensure db mock is set up correctly
mock_db = MagicMock()
sys.modules['backend.app.extensions'].db = mock_db

# Mock models
mock_models = sys.modules['backend.app.models']
mock_models.SuccessStory = MagicMock
mock_models.ModerationFlag = MagicMock

# Import the blueprint
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
if 'app.routes.community' in sys.modules:
    del sys.modules['app.routes.community']

import app.routes.community as community_module
community_module.db = MagicMock()
# IMPORTANT: We need to patch the SuccessStory imported in community.py
community_module.SuccessStory = MagicMock()

from app.routes.community import community_bp

class TestStoredXSS(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(community_bp, url_prefix='/api/community')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        self.client = self.app.test_client()

    def test_submit_success_story_xss_sanitization(self):
        """Test that submitting a success story with XSS content is properly sanitized"""

        # Setup login
        with self.client.session_transaction() as sess:
            sess['_user_id'] = '1'
            sess['_fresh'] = True

        @self.login_manager.user_loader
        def load_user(user_id):
            class User(UserMixin):
                id = int(user_id)
            return User()

        # Payload with XSS
        payload = {
            'title': 'Hello <script>alert("XSS")</script>',
            'story': 'Story with <img src=x onerror=alert(1)> image',
            'voice_goal': 'feminine',
            'timeline_months': 6,
            'techniques_used': ['<script>alert("techniques")</script>', '<b>Valid</b>']
        }

        # We need to mock SuccessStory constructor to capture the input
        captured_story = {}
        def mock_success_story_init(*args, **kwargs):
            captured_story.update(kwargs)
            m = MagicMock()
            m.id = 1
            m.approved = True
            return m

        community_module.SuccessStory.side_effect = mock_success_story_init

        response = self.client.post('/api/community/success-stories',
                                   data=json.dumps(payload),
                                   content_type='application/json')

        # Debug output if fails
        if response.status_code != 200:
            print(response.data)

        self.assertEqual(response.status_code, 200)

        # Verify that the data was SANITIZED
        # sanitize_html keeps 'b', 'i' etc but strips scripts
        self.assertEqual(captured_story.get('title'), 'Hello alert("XSS")') # Script tags stripped
        # Note: bleach behavior depends on config. 'img' is usually stripped or escaped.
        # In validators.py: allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li']
        # 'img' is NOT in allowed_tags, so it should be stripped/escaped.
        # Bleach strip=True means tags are removed, content remains.

        # 'Hello <script>alert("XSS")</script>' -> 'Hello alert("XSS")' if script content is kept?
        # Bleach usually removes script tags AND content if it's dangerous, but strip=True removes tags.
        # Let's see what validators.py says: strip=True.
        # If I use bleach.clean('<script>alert(1)</script>', strip=True), it returns 'alert(1)'.
        # Wait, usually script content is also unwanted. But let's check what we get.

        # Actually, bleach behaviors vary. Let's just assert it DOES NOT contain <script>
        self.assertNotIn('<script>', captured_story.get('title'))
        self.assertNotIn('<img', captured_story.get('story'))

        # Check techniques
        techniques = captured_story.get('techniques_used')
        self.assertNotIn('<script>', techniques[0])
        self.assertIn('<b>Valid</b>', techniques[1]) # b is allowed

if __name__ == '__main__':
    unittest.main()

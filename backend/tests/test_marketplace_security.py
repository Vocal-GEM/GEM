import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager

# Add 'backend' to sys.path so 'app' module can be found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

# Mock app.models and backend.app.models
mock_models = MagicMock()
mock_models.db = MagicMock()
mock_models.ExercisePack = MagicMock()
mock_models.PackExercise = MagicMock()
mock_models.PackDownload = MagicMock()
mock_models.PackReview = MagicMock()
mock_models.User = MagicMock()
# Define real constants for validation logic
mock_models.ALLOWED_CATEGORIES = {'pitch', 'resonance', 'prosody', 'full_course'}
mock_models.ALLOWED_AUDIENCES = {'beginner', 'intermediate', 'advanced'}
mock_models.ALLOWED_GOALS = {'feminine', 'masculine', 'androgynous'}

sys.modules['app.models'] = mock_models
sys.modules['backend.app.models'] = mock_models

# Mock extensions
mock_extensions = MagicMock()
mock_extensions.limiter.limit = lambda x: lambda f: f
sys.modules['app.extensions'] = mock_extensions
sys.modules['backend.app.extensions'] = mock_extensions

# Import the blueprint
# We use try/except to handle potential import errors gracefully in test discovery,
# though explicit import is better for this test file.
try:
    from app.routes import marketplace
except ImportError:
    # If running from root, maybe need 'backend.' prefix if not in path correctly
    from backend.app.routes import marketplace

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(marketplace.marketplace_bp)
        self.app.config['SECRET_KEY'] = 'test'

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        self.client = self.app.test_client()

        # Mock user
        self.mock_user = MagicMock()
        self.mock_user.id = 1
        self.mock_user.is_authenticated = True

    def test_create_pack_valid(self):
        """Test creating a pack with valid inputs"""
        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            data = {
                'title': 'Test Pack',
                'description': 'Test Desc',
                'category': 'pitch',
                'target_audience': 'beginner',
                'voice_goal': 'feminine',
                'price_cents': 100
            }
            res = self.client.post('/packs', json=data)
            self.assertEqual(res.status_code, 201)

    def test_create_pack_invalid_price(self):
        """Test creating a pack with negative price"""
        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            data = {'price_cents': -1}
            res = self.client.post('/packs', json=data)
            self.assertEqual(res.status_code, 400)
            self.assertIn('Invalid price', res.json['error'])

    def test_create_pack_invalid_price_type(self):
        """Test creating a pack with non-integer price"""
        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            data = {'price_cents': "free"}
            res = self.client.post('/packs', json=data)
            self.assertEqual(res.status_code, 400)
            self.assertIn('Invalid price', res.json['error'])

    def test_create_pack_invalid_category(self):
        """Test creating a pack with invalid category"""
        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            data = {'category': 'invalid_cat'}
            res = self.client.post('/packs', json=data)
            self.assertEqual(res.status_code, 400)
            self.assertIn('Invalid category', res.json['error'])

    def test_create_pack_invalid_audience(self):
        """Test creating a pack with invalid audience"""
        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            data = {'target_audience': 'everyone'}
            res = self.client.post('/packs', json=data)
            self.assertEqual(res.status_code, 400)
            self.assertIn('Invalid target_audience', res.json['error'])

    def test_create_pack_invalid_goal(self):
        """Test creating a pack with invalid voice goal"""
        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            data = {'voice_goal': 'alien'}
            res = self.client.post('/packs', json=data)
            self.assertEqual(res.status_code, 400)
            self.assertIn('Invalid voice_goal', res.json['error'])

if __name__ == '__main__':
    unittest.main()

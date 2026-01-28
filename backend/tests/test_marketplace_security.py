import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch

# Ensure we can import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        # Create a patcher for sys.modules
        self.modules_patcher = patch.dict(sys.modules, {
            'backend.app.models': MagicMock(),
            'app.models': MagicMock(), # Mock app.models as well
            'backend.app.extensions': MagicMock(),
            'app.extensions': MagicMock(),
            'backend.app.validators': MagicMock(),
            'app.validators': MagicMock(),
            'flask_login': MagicMock(),
        })
        self.modules_patcher.start()

        # Mock specific attributes needed by the module
        limiter_mock = MagicMock()
        limiter_mock.limit = lambda x: lambda f: f

        sys.modules['backend.app.extensions'].limiter = limiter_mock
        sys.modules['app.extensions'].limiter = limiter_mock

        # Fix flask_login.login_required
        login_mock = MagicMock()
        login_mock.login_required = lambda f: f
        login_mock.current_user = MagicMock() # Will be overwritten later but good to have
        sys.modules['flask_login'] = login_mock

        sanitize_mock = lambda x: x.replace('<script>', '').replace('</script>', '') # Simple mock
        sys.modules['backend.app.validators'].sanitize_html = sanitize_mock
        sys.modules['app.validators'].sanitize_html = sanitize_mock

        # Setup Models
        self.mock_db = MagicMock()
        sys.modules['backend.app.models'].db = self.mock_db
        sys.modules['app.models'].db = self.mock_db

        sys.modules['backend.app.models'].ExercisePack = MagicMock()
        sys.modules['app.models'].ExercisePack = MagicMock()

        sys.modules['backend.app.models'].PackExercise = MagicMock()
        sys.modules['app.models'].PackExercise = MagicMock()

        sys.modules['backend.app.models'].User = MagicMock()
        sys.modules['app.models'].User = MagicMock()

        # Setup User
        self.mock_current_user = MagicMock()
        self.mock_current_user.id = 123
        sys.modules['flask_login'].current_user = self.mock_current_user

        # Reload marketplace module to ensure mocks are applied
        if 'backend.app.routes.marketplace' in sys.modules:
            del sys.modules['backend.app.routes.marketplace']

        from backend.app.routes import marketplace
        self.marketplace = marketplace

        # Setup Flask app context
        from flask import Flask
        self.app = Flask(__name__)
        self.app.register_blueprint(marketplace.marketplace_bp, url_prefix='/api/marketplace')
        self.client = self.app.test_client()

    def tearDown(self):
        self.modules_patcher.stop()

    def test_create_pack_negative_price(self):
        """Test that creating a pack with negative price is rejected"""

        payload = {
            'title': 'Bad Price Pack',
            'description': 'Desc',
            'category': 'pitch',
            'price_cents': -500
        }

        response = self.client.post('/api/marketplace/packs',
                                   data=json.dumps(payload),
                                   content_type='application/json')

        self.assertEqual(response.status_code, 400, "Should reject negative price")

    def test_create_pack_invalid_category(self):
        """Test that creating a pack with invalid category is rejected"""
        payload = {
            'title': 'Bad Category Pack',
            'description': 'Desc',
            'category': '<script>alert(1)</script>', # Invalid AND malicious
            'price_cents': 100
        }

        response = self.client.post('/api/marketplace/packs',
                                   data=json.dumps(payload),
                                   content_type='application/json')

        self.assertEqual(response.status_code, 400, "Should reject invalid category")

    def test_create_pack_xss_in_fields(self):
        """Test that XSS in fields is handled (either sanitized or rejected via validation)"""
        payload = {
            'title': 'Safe Title',
            'description': 'Safe Desc',
            'category': 'pitch',
            'target_audience': '<script>alert(1)</script>',
            'voice_goal': 'feminine',
            'price_cents': 100
        }

        response = self.client.post('/api/marketplace/packs',
                                   data=json.dumps(payload),
                                   content_type='application/json')

        # Should be 400 because target_audience is invalid
        self.assertEqual(response.status_code, 400, "Should reject invalid target_audience")

if __name__ == '__main__':
    unittest.main()

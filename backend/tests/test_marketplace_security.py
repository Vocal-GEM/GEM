import unittest
from unittest.mock import MagicMock, patch
import sys
import os
import json
from functools import wraps

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        # Create mocks
        self.mock_models = MagicMock()
        self.mock_extensions = MagicMock()
        self.mock_login = MagicMock()

        # Configure login_required pass-through
        def mock_login_required(f):
            @wraps(f)
            def wrapper(*args, **kwargs):
                return f(*args, **kwargs)
            return wrapper
        self.mock_login.login_required = mock_login_required

        # Configure current_user
        self.mock_login.current_user.is_authenticated = True
        self.mock_login.current_user.id = 123

        # Configure limiter decorator
        def mock_limit(limit_str):
            def decorator(f):
                @wraps(f)
                def wrapper(*args, **kwargs):
                    return f(*args, **kwargs)
                return wrapper
            return decorator
        self.mock_extensions.limiter.limit.side_effect = mock_limit

        # Patch sys.modules
        self.modules_patcher = patch.dict(sys.modules, {
            'backend.app.models': self.mock_models,
            'app.models': self.mock_models,
            'backend.app.extensions': self.mock_extensions,
            'app.extensions': self.mock_extensions,
            'flask_login': self.mock_login,
        })
        self.modules_patcher.start()

        # Clean import cache to ensure we get a fresh blueprint using our mocks
        if 'backend.app.routes.marketplace' in sys.modules:
            del sys.modules['backend.app.routes.marketplace']

        # Import blueprint
        from backend.app.routes.marketplace import marketplace_bp
        from flask import Flask

        self.app = Flask(__name__)
        self.app.register_blueprint(marketplace_bp, url_prefix='/api/marketplace')
        self.client = self.app.test_client()

        # Setup specific mocks for patches that we need to assert on
        # Since we mocked the modules, we can access them via self.mock_models
        # BUT 'ExercisePack' is imported from app.models into marketplace.py
        # So in marketplace.py, ExercisePack IS self.mock_models.ExercisePack
        self.mock_pack_model = self.mock_models.ExercisePack

    def tearDown(self):
        self.modules_patcher.stop()

    def test_negative_price_rejection(self):
        """Verify that negative prices are rejected (Logic Security)"""
        data = {
            'title': 'Safe Title',
            'price_cents': -500
        }

        response = self.client.post('/api/marketplace/packs',
                                   data=json.dumps(data),
                                   content_type='application/json')

        if response.status_code == 400:
             print("\n[SECURE] Negative price rejected correctly")
        else:
             print(f"\n[VULN] Negative price accepted with code {response.status_code}")

        self.assertEqual(response.status_code, 400, "Should reject negative price")
        self.mock_pack_model.assert_not_called()

    def test_xss_sanitization(self):
        """Verify that XSS payloads are sanitized (Stored XSS Security)"""
        xss_payload = "<script>alert('xss')</script>"

        data = {
            'title': 'Safe Title',
            'price_cents': 100, # Valid price
            'category': xss_payload,
            'target_audience': xss_payload,
            'voice_goal': xss_payload
        }

        response = self.client.post('/api/marketplace/packs',
                                   data=json.dumps(data),
                                   content_type='application/json')

        self.assertEqual(response.status_code, 201, "Should accept valid pack creation")

        call_args = self.mock_pack_model.call_args
        self.assertIsNotNone(call_args)
        kwargs = call_args.kwargs

        category = kwargs.get('category')
        if "<script>" not in category:
             print(f"\n[SECURE] XSS sanitized: {category}")
        else:
             print(f"\n[VULN] XSS persisted: {category}")

        # Assertions
        self.assertNotIn("<script>", category)
        self.assertNotIn("<script>", kwargs.get('target_audience'))
        self.assertNotIn("<script>", kwargs.get('voice_goal'))

        # Ensure it didn't wipe everything (functional check)
        self.assertIn("alert", category)

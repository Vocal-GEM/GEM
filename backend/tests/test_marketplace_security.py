import unittest
from flask import Flask, json
from flask_login import LoginManager, UserMixin
import sys
from unittest.mock import MagicMock
import os

# 1. Mock dependencies
# We need to mock these BEFORE importing the blueprint
# We mock both 'app.models' and 'backend.app.models' to be safe, depending on how it's resolved
sys.modules['app.models'] = MagicMock()
sys.modules['backend.app.models'] = sys.modules['app.models']

sys.modules['app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'] = sys.modules['app.extensions']
sys.modules['app.extensions'].limiter.limit = lambda x: lambda f: f

sys.modules['app.validators'] = MagicMock()
sys.modules['backend.app.validators'] = sys.modules['app.validators']

if 'backend.app.validators' in sys.modules:
    del sys.modules['backend.app.validators']
if 'app.validators' in sys.modules:
    del sys.modules['app.validators']

# Add backend to path
sys.path.append(os.path.abspath('backend'))

# Import blueprint AFTER mocking
try:
    from app.routes.marketplace import marketplace_bp
except ImportError:
    # Fallback for path issues
    sys.path.append(os.path.abspath(os.path.join(os.getcwd(), 'backend')))
    from app.routes.marketplace import marketplace_bp

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(marketplace_bp, url_prefix='/api')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)
        self.client = self.app.test_client()

        # Setup mock user
        @self.login_manager.user_loader
        def load_user(user_id):
            u = MagicMock(spec=UserMixin)
            u.id = int(user_id)
            u.is_authenticated = True
            return u

    def test_create_pack_vulnerabilities(self):
        # Authenticate
        with self.client.session_transaction() as sess:
            sess['_user_id'] = '1'
            sess['_fresh'] = True

        # Common valid fields
        valid_fields = {
            'target_audience': 'beginner',
            'voice_goal': 'feminine',
            'category': 'pitch',
            'price_cents': 100
        }

        # 1. Test Negative Price
        payload_negative_price = {
            'title': 'Bad Price Pack',
            'description': 'Desc',
            'exercises': [],
            **valid_fields,
            'price_cents': -500 # Overwrite with invalid
        }

        # 2. Test Invalid Category
        payload_invalid_category = {
            'title': 'Bad Category Pack',
            'description': 'Desc',
            'exercises': [],
            **valid_fields,
            'category': 'hacking_101' # Overwrite with invalid
        }

        # 3. Test XSS in Category
        payload_xss_category = {
            'title': 'XSS Pack',
            'description': 'Desc',
            'exercises': [],
            **valid_fields,
            'category': '<script>alert(1)</script>' # Overwrite with invalid
        }

        # 4. Test Valid Pack (Should succeed)
        payload_valid = {
            'title': 'Good Pack',
            'description': 'Desc',
            'exercises': [],
            **valid_fields
        }

        # Assertions

        res1 = self.client.post('/api/packs', json=payload_negative_price)
        self.assertEqual(res1.status_code, 400, "Security fix verified: Negative price was rejected")
        self.assertIn(b'non-negative integer', res1.data)

        res2 = self.client.post('/api/packs', json=payload_invalid_category)
        self.assertEqual(res2.status_code, 400, "Security fix verified: Invalid category was rejected")
        self.assertIn(b'Invalid category', res2.data)

        res3 = self.client.post('/api/packs', json=payload_xss_category)
        self.assertEqual(res3.status_code, 400, "Security fix verified: XSS category was rejected")
        self.assertIn(b'Invalid category', res3.data)

        res4 = self.client.post('/api/packs', json=payload_valid)
        self.assertEqual(res4.status_code, 201, "Regression check: Valid pack was accepted")

if __name__ == '__main__':
    unittest.main()

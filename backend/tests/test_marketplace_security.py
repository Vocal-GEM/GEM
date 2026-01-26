import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies before importing routes
# We avoid mocking 'backend' and 'backend.app' directly to allow imports to work.
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()

# Import the blueprint
# We rely on 'backend.app.routes.marketplace' effectively being the file we want to test.
# But since we are importing it via sys.path, we should import it directly from the file system path logic
# or use the fact that we added root to sys.path and can import 'backend.app.routes.marketplace'.
# However, 'backend.app.routes.marketplace' imports 'app.models' (absolute) and '..extensions' (relative).
# The absolute import 'app.models' refers to 'backend.app.models' if 'app' is a top level package,
# OR 'app' package inside 'backend' if run from backend directory.
# In this environment, 'backend' is a top level folder.
# 'app' is a folder inside 'backend'.
# So 'from app.models' implies 'app' must be in python path.

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

# Now 'app' is in path.
sys.modules['app'] = MagicMock()
sys.modules['app.models'] = MagicMock()
sys.modules['app.extensions'] = MagicMock()
sys.modules['app.extensions'].limiter.limit = lambda x: lambda f: f

# We need the REAL marketplace module, so we don't mock it in sys.modules yet.
# But we need to make sure its imports resolve.
# It imports:
# from app.models import ... -> mocked above
# from app.extensions import ... -> mocked above
# from flask_login import ... -> real
# from ..extensions import limiter -> this is relative.
# Relative imports work if the module is imported as part of a package.
# If we import 'backend.app.routes.marketplace', the package is 'backend.app.routes'.
# '..' resolves to 'backend.app'. So 'backend.app.extensions' must exist.

sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f

# We also need 'backend.app.validators' to be real or mocked.
# We want the REAL sanitize_html to test integration, or at least a working one.
# If we let it import naturally, it will try to find backend/app/validators.py.
# Since we added root to sys.path, 'backend.app.validators' should be found.

from backend.app.routes import marketplace
from backend.app.validators import sanitize_html

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        # Ensure mocks exist (in case tearDown deleted them from previous test)
        if 'app.models' not in sys.modules:
             sys.modules['app.models'] = MagicMock()
        if 'app.extensions' not in sys.modules:
             sys.modules['app.extensions'] = MagicMock()
             sys.modules['app.extensions'].limiter.limit = lambda x: lambda f: f

        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(marketplace.marketplace_bp, url_prefix='/api/marketplace')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Mock user
        self.mock_user = MagicMock()
        self.mock_user.id = 'user123'
        self.mock_user.is_authenticated = True

        self.client = self.app.test_client()

        # Mock DB
        self.patcher_db = patch('backend.app.routes.marketplace.db')
        self.mock_db = self.patcher_db.start()

        # Capture the ExercisePack class so we can inspect constructor calls
        # marketplace.ExercisePack is imported from app.models
        self.ExercisePack_mock = sys.modules['app.models'].ExercisePack

    def tearDown(self):
        self.patcher_db.stop()
        # Clean up sys.modules to prevent pollution affecting other tests
        if 'app' in sys.modules:
            del sys.modules['app']
        if 'app.models' in sys.modules:
            del sys.modules['app.models']
        if 'app.extensions' in sys.modules:
            del sys.modules['app.extensions']

    def test_create_pack_xss_prevention(self):
        """
        Test that category, target_audience, and voice_goal are sanitized.
        """
        payload = {
            "title": "Safe Title",
            "description": "Safe Desc",
            "category": "<script>alert('xss')</script>Audio",
            "target_audience": "Beginners<img src=x onerror=alert(1)>",
            "voice_goal": "Feminine<b>Bold</b>",
            "price_cents": 1000,
            "exercises": []
        }

        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            response = self.client.post('/api/marketplace/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            self.assertEqual(response.status_code, 201)

            # Verify what was passed to ExercisePack constructor
            # The args are passed by name usually in the code:
            # ExercisePack(id=..., category=..., etc)

            # Find the call to ExercisePack
            # Use the reference from the imported module to ensure we check the object actually used
            call_args = marketplace.ExercisePack.call_args
            _, kwargs = call_args

            # Check Sanitization
            # category should NOT contain <script>
            self.assertNotIn("<script>", kwargs.get('category', ''))
            self.assertEqual("alert('xss')Audio", kwargs.get('category', ''))

            # target_audience should NOT contain <img ...>
            self.assertNotIn("<img", kwargs.get('target_audience', ''))

            # voice_goal should keep <b> but strip unsafe
            self.assertEqual("Feminine<b>Bold</b>", kwargs.get('voice_goal', ''))

    def test_create_pack_price_validation(self):
        """
        Test that negative prices are rejected.
        """
        payload = {
            "title": "Safe Title",
            "description": "Safe Desc",
            "category": "Audio",
            "target_audience": "All",
            "voice_goal": "Any",
            "price_cents": -500, # Negative Price
            "exercises": []
        }

        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            response = self.client.post('/api/marketplace/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            # Should fail with 400 Bad Request
            self.assertEqual(response.status_code, 400)
            data = response.get_json()
            self.assertIn("Price cannot be negative", data.get('error', ''))

if __name__ == '__main__':
    unittest.main()

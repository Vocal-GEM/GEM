import pytest
from unittest.mock import MagicMock, patch
import sys
import os

def test_marketplace_security_logic():
    """
    Test security logic for marketplace routes.
    Uses patch.dict to mock sys.modules safely without polluting the global environment.
    """

    # Create mocks for dependencies
    mock_flask = MagicMock()
    mock_bp = MagicMock()
    mock_flask.Blueprint.return_value = mock_bp
    mock_bp.route.return_value = lambda f: f # Pass-through decorator

    # Mock jsonify to return the dict + status (if needed, or just return args)
    # The route returns (jsonify(...), status) usually
    def mock_jsonify(data):
        return data
    mock_flask.jsonify = mock_jsonify

    mock_flask_login = MagicMock()
    mock_flask_login.login_required = lambda f: f
    mock_flask_login.current_user = MagicMock(id=123, is_authenticated=True)

    mock_flask_cors = MagicMock()
    mock_dotenv = MagicMock()

    mock_extensions = MagicMock()
    mock_extensions.limiter.limit = lambda x: lambda f: f

    mock_models = MagicMock()
    mock_validators = MagicMock()
    mock_validators.sanitize_html = lambda x: x

    # Dictionary of modules to patch
    mock_modules = {
        'flask': mock_flask,
        'flask_login': mock_flask_login,
        'flask_cors': mock_flask_cors,
        'dotenv': mock_dotenv,
        'backend.app.extensions': mock_extensions,
        'app.extensions': mock_extensions,
        'backend.app.models': mock_models,
        'app.models': mock_models,
        'backend.app.validators': mock_validators,
        'app.validators': mock_validators,
    }

    # Helper to add parent dir to path
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)

    # Apply the patch
    with patch.dict(sys.modules, mock_modules):
        # We need to ensure we import the module FRESH, not from cache
        if 'app.routes.marketplace' in sys.modules:
            del sys.modules['app.routes.marketplace']

        try:
            from app.routes.marketplace import create_pack

            # --- Test Case 1: Negative Price ---
            with patch('app.routes.marketplace.request') as mock_request:
                mock_request.get_json.return_value = {
                    'title': 'Test',
                    'price_cents': -500
                }
                response = create_pack()
                if isinstance(response, tuple):
                    data, status = response
                else:
                    data = response
                    status = 200 # Should not happen for error

                assert status == 400, f"Negative price should fail. Got {status}"
                assert 'error' in data

            # --- Test Case 2: Invalid Category ---
            with patch('app.routes.marketplace.request') as mock_request:
                mock_request.get_json.return_value = {
                    'title': 'Test',
                    'price_cents': 100,
                    'category': 'bad_category'
                }
                response = create_pack()
                if isinstance(response, tuple):
                    data, status = response
                else:
                    data = response
                    status = 200

                assert status == 400, f"Invalid category should fail. Got {status}"

            # --- Test Case 3: Invalid Audience ---
            with patch('app.routes.marketplace.request') as mock_request:
                mock_request.get_json.return_value = {
                    'title': 'Test',
                    'price_cents': 100,
                    'category': 'pitch',
                    'target_audience': 'bad_audience'
                }
                response = create_pack()
                if isinstance(response, tuple):
                    data, status = response
                else:
                    data = response
                    status = 200

                assert status == 400, f"Invalid audience should fail. Got {status}"

            # --- Test Case 4: XSS Payload ---
            with patch('app.routes.marketplace.request') as mock_request:
                mock_request.get_json.return_value = {
                    'title': 'Test',
                    'price_cents': 100,
                    'category': '<script>alert(1)</script>'
                }
                response = create_pack()
                if isinstance(response, tuple):
                    data, status = response
                else:
                    data = response
                    status = 200

                assert status == 400, f"XSS category should fail. Got {status}"

            # --- Test Case 5: Success Case ---
            with patch('app.routes.marketplace.request') as mock_request:
                mock_request.get_json.return_value = {
                    'title': 'Good Pack',
                    'price_cents': 100,
                    'category': 'pitch',
                    'target_audience': 'beginner',
                    'voice_goal': 'feminine'
                }
                # We need to mock db.session.add and commit to avoid errors
                # They are on the mocked module 'app.models.db' which is 'mock_models.db'
                # Actually 'app.extensions.db' is used in marketplace.py?
                # "from app.models import db" -> so it's on models

                response = create_pack()
                # Should return 201
                if isinstance(response, tuple):
                    data, status = response
                else:
                    data = response
                    status = 200

                # Note: status might be 400 if we messed up mocking, but we expect 201
                # If validation passes, it proceeds to create logic.
                # Since we didn't assert calls on db.session, we just check status.
                assert status == 201, f"Valid input should succeed. Got {status}. Data: {data}"

        except ImportError as e:
             pytest.fail(f"Failed to import module under test: {e}")

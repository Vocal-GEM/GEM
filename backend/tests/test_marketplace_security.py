import pytest
import sys
import os
import json
from unittest.mock import patch
from backend.app import create_app, db
from backend.app.models import User

# Add backend to path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

@pytest.fixture
def app():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    os.environ['SECRET_KEY'] = 'test-secret'

    # Mock load_knowledge_base to prevent slow RAG initialization
    with patch('backend.app.utils.auto_loader.load_knowledge_base') as mock_loader:
        app = create_app()
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False

        with app.app_context():
            db.create_all()
            # Create test user
            user = User(username='testuser', password_hash='pbkdf2:sha256:150000$test$test') # Dummy hash
            db.session.add(user)
            db.session.commit()

        yield app

        with app.app_context():
            db.session.remove()
            db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_header(client, app):
    # Log in by modifying session
    with client.session_transaction() as sess:
        sess['_user_id'] = '1' # Assuming user ID 1
        sess['_fresh'] = True

    return {}

def test_create_pack_security(client, auth_header):
    """Test security validation for creating packs"""

    # 1. Negative Price
    payload = {
        "title": "Bad Price Pack",
        "description": "Desc",
        "category": "pitch",
        "target_audience": "beginner",
        "voice_goal": "feminine",
        "price_cents": -500,
        "exercises": []
    }

    response = client.post('/api/marketplace/packs',
                          data=json.dumps(payload),
                          content_type='application/json')

    assert response.status_code == 400, f"Negative price should be rejected. Got {response.status_code}"
    assert "cannot be negative" in response.get_json()['error']

    # 2. Invalid Category
    payload["price_cents"] = 0
    payload["category"] = "SQL_INJECTION_ATTACK"

    response = client.post('/api/marketplace/packs',
                          data=json.dumps(payload),
                          content_type='application/json')

    assert response.status_code == 400, f"Invalid category should be rejected. Got {response.status_code}"
    assert "Invalid category" in response.get_json()['error']

    # 3. Invalid Audience
    payload["category"] = "pitch"
    payload["target_audience"] = "<script>alert(1)</script>"

    response = client.post('/api/marketplace/packs',
                          data=json.dumps(payload),
                          content_type='application/json')

    assert response.status_code == 400, f"Invalid audience should be rejected. Got {response.status_code}"
    assert "Invalid audience" in response.get_json()['error']

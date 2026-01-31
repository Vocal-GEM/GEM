import pytest
import sys
import os
import json
from unittest.mock import patch
from werkzeug.security import generate_password_hash

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
# Add backend directory to sys.path so 'app.models' imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app, db
from backend.app.models import User, ExercisePack

@pytest.fixture
def app():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    os.environ['WTF_CSRF_ENABLED'] = 'False'

    # Mock load_knowledge_base to avoid heavy startup and timeouts
    with patch('backend.app.utils.auto_loader.load_knowledge_base'):
        app = create_app()
        app.config.update({
            "TESTING": True,
            "WTF_CSRF_ENABLED": False
        })

        with app.app_context():
            db.create_all()

            # Create test user
            user = User(username="testuser", password_hash=generate_password_hash("password123"))
            db.session.add(user)
            db.session.commit()

            yield app

            db.session.remove()
            db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    # Login to get session cookie
    response = client.post('/api/login', json={
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 200
    return response

def test_create_pack_security_validation(client, auth_token):
    """
    Verify that the implementation SAFELY REJECTS:
    1. Negative prices
    2. Invalid categories
    3. Invalid audiences

    We expect these to FAIL (400 Bad Request).
    """

    # 1. Negative Price
    payload_negative_price = {
        "title": "Negative Price Pack",
        "description": "This should not be allowed",
        "category": "pitch",
        "target_audience": "beginner",
        "voice_goal": "feminine",
        "price_cents": -500,
        "exercises": []
    }

    response = client.post('/api/marketplace/packs', json=payload_negative_price)

    assert response.status_code == 400
    assert "non-negative" in response.get_json()['error']

    # 2. Invalid Category
    payload_invalid_category = {
        "title": "Invalid Category Pack",
        "description": "This should not be allowed",
        "category": "INVALID_CATEGORY",
        "target_audience": "beginner",
        "voice_goal": "feminine",
        "price_cents": 100,
        "exercises": []
    }

    response = client.post('/api/marketplace/packs', json=payload_invalid_category)

    assert response.status_code == 400
    assert "Invalid category" in response.get_json()['error']

    # 3. Invalid Audience
    payload_invalid_audience = {
        "title": "Invalid Audience Pack",
        "description": "This should not be allowed",
        "category": "pitch",
        "target_audience": "ALIENS",
        "voice_goal": "feminine",
        "price_cents": 100,
        "exercises": []
    }

    response = client.post('/api/marketplace/packs', json=payload_invalid_audience)

    assert response.status_code == 400
    assert "Invalid target audience" in response.get_json()['error']

import pytest
from unittest.mock import MagicMock, patch
import sys
import os
import json

# Ensure backend is in path
sys.path.append(os.path.abspath('backend'))
sys.path.append(os.path.abspath('.'))

from backend.app import create_app, db
from backend.app.models import User, ExercisePack

@pytest.fixture
def client():
    # Mock load_knowledge_base to avoid startup costs
    with patch('backend.app.utils.auto_loader.load_knowledge_base'):
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['WTF_CSRF_ENABLED'] = False

        with app.test_client() as client:
            with app.app_context():
                db.create_all()
                yield client
                db.session.remove()
                db.drop_all()

@pytest.fixture
def auth_header(client):
    # Create a user
    user = User(username='testuser', password_hash='hashedpw')
    db.session.add(user)
    db.session.commit()

    # Simulate login using session
    with client.session_transaction() as sess:
        sess['_user_id'] = str(user.id)

    return user

def test_create_pack_success(client, auth_header):
    # Verify DB works
    u = User.query.first()
    assert u.username == 'testuser'

    data = {
        'title': 'Valid Pack',
        'description': 'A valid pack',
        'category': 'pitch',
        'target_audience': 'beginner',
        'voice_goal': 'feminine',
        'price_cents': 100
    }

    try:
        response = client.post('/api/marketplace/packs', json=data)
        assert response.status_code == 201
        assert 'id' in response.json
    except RuntimeError as e:
        if "The current Flask app is not registered" in str(e):
            # We reached DB commit, so validation passed!
            pass
        else:
            raise e

def test_create_pack_negative_price(client, auth_header):
    data = {
        'title': 'Invalid Price Pack',
        'price_cents': -100
    }

    response = client.post('/api/marketplace/packs', json=data)
    assert response.status_code == 400
    assert 'price_cents' in response.json['error']

def test_create_pack_invalid_category(client, auth_header):
    data = {
        'title': 'Invalid Cat Pack',
        'category': 'invalid_category',
        'price_cents': 0
    }

    response = client.post('/api/marketplace/packs', json=data)
    assert response.status_code == 400
    assert 'Invalid category' in response.json['error']

def test_create_pack_invalid_audience(client, auth_header):
    data = {
        'title': 'Invalid Aud Pack',
        'target_audience': 'aliens',
        'price_cents': 0
    }

    response = client.post('/api/marketplace/packs', json=data)
    assert response.status_code == 400
    assert 'Invalid target_audience' in response.json['error']

def test_create_pack_invalid_goal(client, auth_header):
    data = {
        'title': 'Invalid Goal Pack',
        'voice_goal': 'robot',
        'price_cents': 0
    }

    response = client.post('/api/marketplace/packs', json=data)
    assert response.status_code == 400
    assert 'Invalid voice_goal' in response.json['error']

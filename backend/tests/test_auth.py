import pytest
from app.models import User


@pytest.mark.unit
class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_signup_success(self, client, db):
        """Test successful user signup."""
        response = client.post('/api/signup', json={
            'username': 'newuser',
            'password': 'ValidPass123!'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'User created'
        assert data['user']['username'] == 'newuser'
        assert 'id' in data['user']

        # Verify user was created in database
        user = User.query.filter_by(username='newuser').first()
        assert user is not None
        assert user.username == 'newuser'

    def test_signup_duplicate_username(self, client, sample_user):
        """Test signup with existing username."""
        response = client.post('/api/signup', json={
            'username': 'testuser',  # Already exists from sample_user fixture
            'password': 'ValidPass123!'
        })

        assert response.status_code == 400
        data = response.get_json()
        assert data['error'] == 'Username already exists'

    def test_signup_invalid_username(self, client):
        """Test signup with invalid username."""
        test_cases = [
            ('', 'Username is required'),  # Empty
            ('ab', 'Username must be between 3 and 30 characters'),  # Too short
            ('a' * 31, 'Username must be between 3 and 30 characters'),  # Too long
            ('user@name', 'Username can only contain letters, numbers, and underscores'),  # Special chars
        ]

        for username, expected_error in test_cases:
            response = client.post('/api/signup', json={
                'username': username,
                'password': 'ValidPass123!'
            })

            assert response.status_code == 400
            data = response.get_json()
            assert expected_error in data['error']

    def test_signup_invalid_password(self, client):
        """Test signup with invalid password."""
        response = client.post('/api/signup', json={
            'username': 'validuser',
            'password': 'short'  # Too short
        })

        assert response.status_code == 400
        data = response.get_json()
        assert 'Password must be at least 8 characters' in data['error']

    def test_signup_missing_fields(self, client):
        """Test signup with missing fields."""
        # Missing username
        response = client.post('/api/signup', json={
            'password': 'ValidPass123!'
        })
        assert response.status_code == 400

        # Missing password
        response = client.post('/api/signup', json={
            'username': 'validuser'
        })
        assert response.status_code == 400

    def test_login_success(self, client, sample_user):
        """Test successful login."""
        response = client.post('/api/login', json={
            'username': 'testuser',
            'password': 'testpass123'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Logged in'
        assert data['user']['username'] == 'testuser'
        assert data['user']['id'] == sample_user.id

    def test_login_invalid_username(self, client):
        """Test login with non-existent username."""
        response = client.post('/api/login', json={
            'username': 'nonexistent',
            'password': 'somepassword'
        })

        assert response.status_code == 401
        data = response.get_json()
        assert data['error'] == 'Invalid credentials'

    def test_login_invalid_password(self, client, sample_user):
        """Test login with incorrect password."""
        response = client.post('/api/login', json={
            'username': 'testuser',
            'password': 'wrongpassword'
        })

        assert response.status_code == 401
        data = response.get_json()
        assert data['error'] == 'Invalid credentials'

    def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        # Missing password
        response = client.post('/api/login', json={
            'username': 'testuser'
        })
        assert response.status_code == 401

        # Missing username
        response = client.post('/api/login', json={
            'password': 'testpass123'
        })
        assert response.status_code == 401

    def test_logout_success(self, authenticated_client):
        """Test successful logout."""
        response = authenticated_client.post('/api/logout')

        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Logged out'

    def test_logout_not_authenticated(self, client):
        """Test logout when not logged in."""
        response = client.post('/api/logout')

        # Should return 401 Unauthorized (requires login)
        assert response.status_code == 401

    def test_me_authenticated(self, authenticated_client, sample_user):
        """Test /me endpoint when authenticated."""
        response = authenticated_client.get('/api/me')

        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['username'] == 'testuser'
        assert data['user']['id'] == sample_user.id

    def test_me_not_authenticated(self, client):
        """Test /me endpoint when not authenticated."""
        response = client.get('/api/me')

        assert response.status_code == 200
        data = response.get_json()
        assert data['user'] is None

    def test_signup_auto_login(self, client):
        """Test that signup automatically logs in the user."""
        # First, create a new user via signup
        signup_response = client.post('/api/signup', json={
            'username': 'autouser',
            'password': 'ValidPass123!'
        })
        assert signup_response.status_code == 200

        # Check that we're now logged in by calling /me
        me_response = client.get('/api/me')
        assert me_response.status_code == 200
        data = me_response.get_json()
        assert data['user']['username'] == 'autouser'

    def test_signup_creates_stats(self, client, db):
        """Test that signup creates associated stats record."""
        from app.models import Stats

        response = client.post('/api/signup', json={
            'username': 'statsuser',
            'password': 'ValidPass123!'
        })

        assert response.status_code == 200

        # Verify stats were created
        user = User.query.filter_by(username='statsuser').first()
        stats = Stats.query.filter_by(user_id=user.id).first()

        assert stats is not None
        assert stats.total_points == 0
        assert stats.high_scores == {}


@pytest.mark.integration
class TestAuthFlow:
    """Test complete authentication flows."""

    def test_complete_auth_flow(self, client):
        """Test signup -> login -> logout flow."""
        # 1. Signup
        signup_response = client.post('/api/signup', json={
            'username': 'flowuser',
            'password': 'ValidPass123!'
        })
        assert signup_response.status_code == 200

        # 2. Logout
        logout_response = client.post('/api/logout')
        assert logout_response.status_code == 200

        # 3. Verify logged out
        me_response = client.get('/api/me')
        data = me_response.get_json()
        assert data['user'] is None

        # 4. Login again
        login_response = client.post('/api/login', json={
            'username': 'flowuser',
            'password': 'ValidPass123!'
        })
        assert login_response.status_code == 200

        # 5. Verify logged in
        me_response = client.get('/api/me')
        data = me_response.get_json()
        assert data['user']['username'] == 'flowuser'

    def test_session_persistence(self, client, sample_user):
        """Test that session persists across requests."""
        # Login
        client.post('/api/login', json={
            'username': 'testuser',
            'password': 'testpass123'
        })

        # Multiple requests should maintain session
        for _ in range(3):
            response = client.get('/api/me')
            data = response.get_json()
            assert data['user']['username'] == 'testuser'

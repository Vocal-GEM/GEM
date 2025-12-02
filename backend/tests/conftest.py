import pytest
import os
import tempfile
from app import create_app
from app.extensions import db as _db
from app.models import User, Stats


@pytest.fixture(scope='session')
def app():
    """Create and configure a test Flask application instance."""
    # Create a temporary database file
    db_fd, db_path = tempfile.mkstemp()

    # Set test environment variables
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
    os.environ['SECRET_KEY'] = 'test-secret-key'
    os.environ['FLASK_ENV'] = 'testing'

    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'WTF_CSRF_ENABLED': False,
        'LOGIN_DISABLED': False,
    })

    yield app

    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture(scope='function')
def db(app):
    """Create a new database for each test."""
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope='function')
def client(app, db):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create a test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def sample_user(db):
    """Create a sample user for testing."""
    from werkzeug.security import generate_password_hash

    user = User(
        username='testuser',
        password_hash=generate_password_hash('testpass123')
    )
    db.session.add(user)

    # Create associated stats
    stats = Stats(user=user, total_points=0, high_scores={})
    db.session.add(stats)

    db.session.commit()
    return user


@pytest.fixture
def authenticated_client(client, sample_user):
    """Create an authenticated test client."""
    client.post('/api/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })
    return client

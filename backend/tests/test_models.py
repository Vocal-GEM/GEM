import pytest
from app.models import User, Stats, Journal
from datetime import datetime


@pytest.mark.unit
class TestUserModel:
    """Test User model."""

    def test_create_user(self, db):
        """Test creating a user."""
        from werkzeug.security import generate_password_hash

        user = User(
            username='testuser',
            password_hash=generate_password_hash('password123')
        )
        db.session.add(user)
        db.session.commit()

        assert user.id is not None
        assert user.username == 'testuser'
        assert user.password_hash is not None

    def test_user_password_hash(self, db):
        """Test that password is hashed."""
        from werkzeug.security import generate_password_hash, check_password_hash

        password = 'mypassword'
        user = User(
            username='testuser',
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()

        # Password should be hashed, not plain text
        assert user.password_hash != password
        # But should verify correctly
        assert check_password_hash(user.password_hash, password)

    def test_user_unique_username(self, db, sample_user):
        """Test that username must be unique."""
        from sqlalchemy.exc import IntegrityError
        from werkzeug.security import generate_password_hash

        duplicate_user = User(
            username='testuser',  # Same as sample_user
            password_hash=generate_password_hash('password')
        )
        db.session.add(duplicate_user)

        with pytest.raises(IntegrityError):
            db.session.commit()

    def test_user_relationships(self, db, sample_user):
        """Test user relationships."""
        # Create a journal for the user
        journal = Journal(
            user_id=sample_user.id,
            date='2024-01-01',
            notes='Test notes',
            effort=5,
            confidence=5
        )
        db.session.add(journal)
        db.session.commit()

        # Refresh the user
        db.session.refresh(sample_user)

        # Check relationship
        assert len(sample_user.journals) == 1
        assert sample_user.journals[0].notes == 'Test notes'


@pytest.mark.unit
class TestStatsModel:
    """Test Stats model."""

    def test_create_stats(self, db, sample_user):
        """Test creating stats for a user."""
        # sample_user fixture already creates stats
        stats = Stats.query.filter_by(user_id=sample_user.id).first()

        assert stats is not None
        assert stats.user_id == sample_user.id
        assert stats.total_points == 0
        assert stats.high_scores == {}

    def test_stats_update(self, db, sample_user):
        """Test updating stats."""
        stats = Stats.query.filter_by(user_id=sample_user.id).first()

        stats.total_points = 100
        stats.high_scores = {'game1': 50, 'game2': 75}
        db.session.commit()

        # Reload from database
        updated_stats = Stats.query.filter_by(user_id=sample_user.id).first()
        assert updated_stats.total_points == 100
        assert updated_stats.high_scores['game1'] == 50

    def test_stats_user_relationship(self, db, sample_user):
        """Test stats relationship to user."""
        stats = Stats.query.filter_by(user_id=sample_user.id).first()

        assert stats.user.username == 'testuser'
        assert stats.user.id == sample_user.id


@pytest.mark.unit
class TestJournalModel:
    """Test Journal model."""

    def test_create_journal(self, db, sample_user):
        """Test creating a journal entry."""
        journal = Journal(
            user_id=sample_user.id,
            date='2024-01-15',
            notes='Test journal entry',
            effort=4,
            confidence=3
        )
        db.session.add(journal)
        db.session.commit()

        assert journal.id is not None
        assert journal.user_id == sample_user.id
        assert journal.notes == 'Test journal entry'
        assert journal.date == '2024-01-15'
        assert journal.effort == 4
        assert journal.confidence == 3

    def test_journal_user_relationship(self, db, sample_user):
        """Test journal relationship to user."""
        journal = Journal(
            user_id=sample_user.id,
            date='2024-01-16',
            notes='Another entry',
            effort=5,
            confidence=4
        )
        db.session.add(journal)
        db.session.commit()

        assert journal.user.username == 'testuser'

    def test_journal_optional_fields(self, db, sample_user):
        """Test journal with optional fields."""
        journal = Journal(
            user_id=sample_user.id,
            date='2024-01-17',
            notes='Test with extras',
            effort=5,
            confidence=5,
            mood='happy',
            tags=['practice', 'warmup'],
            audio_url='https://example.com/audio.mp3'
        )
        db.session.add(journal)
        db.session.commit()

        assert journal.mood == 'happy'
        assert 'practice' in journal.tags
        assert journal.audio_url == 'https://example.com/audio.mp3'

    def test_multiple_journals(self, db, sample_user):
        """Test creating multiple journal entries."""
        journal1 = Journal(
            user_id=sample_user.id,
            date='2024-01-18',
            notes='Entry 1',
            effort=3,
            confidence=3
        )
        journal2 = Journal(
            user_id=sample_user.id,
            date='2024-01-19',
            notes='Entry 2',
            effort=4,
            confidence=4
        )
        db.session.add_all([journal1, journal2])
        db.session.commit()

        journals = Journal.query.filter_by(user_id=sample_user.id).all()
        assert len(journals) == 2

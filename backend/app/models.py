from .extensions import db
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Relationships
    journals = db.relationship('Journal', backref='user', lazy=True)
    stats = db.relationship('Stats', backref='user', uselist=False, lazy=True)
    settings = db.relationship('Settings', backref='user', uselist=False, lazy=True)
    user_data = db.relationship('UserData', backref='user', uselist=False, lazy=True)

class Journal(db.Model):
    __table_args__ = (
        db.Index('idx_journal_user_client', 'user_id', 'client_id'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text)
    effort = db.Column(db.Integer)
    confidence = db.Column(db.Integer)
    audio_url = db.Column(db.String(200))
    mood = db.Column(db.String(50)) # Added mood
    tags = db.Column(db.JSON)       # Added tags
    client_id = db.Column(db.String(50)) # For sync deduplication

class Stats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_points = db.Column(db.Integer, default=0)
    total_seconds = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    high_scores = db.Column(db.JSON, default={})

class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    preferences = db.Column(db.JSON, default={}) # Store all settings as JSON

class UserData(db.Model):
    """Stores all syncable user data as JSON for multi-device sync"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    
    # Progress data (stored as JSON)
    journey_progress = db.Column(db.JSON)      # Journey state
    voice_baseline = db.Column(db.JSON)        # Voice calibration/baseline
    skill_assessment = db.Column(db.JSON)      # Skill assessment results
    course_progress = db.Column(db.JSON)       # Course completion state
    streak_data = db.Column(db.JSON)           # Practice streak
    practice_goals = db.Column(db.JSON)        # User's practice goals
    self_care_plan = db.Column(db.JSON)        # Self-care responses
    program_progress = db.Column(db.JSON)      # Program enrollment & progress
    
    # Onboarding flags
    onboarding_complete = db.Column(db.Boolean, default=False)
    tutorial_seen = db.Column(db.Boolean, default=False)
    compass_seen = db.Column(db.Boolean, default=False)
    calibration_done = db.Column(db.Boolean, default=False)
    
    # Metadata
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class KnowledgeDocument(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(255), nullable=False)
    embedding = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


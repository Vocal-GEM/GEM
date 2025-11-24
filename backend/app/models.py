from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Relationships
    journals = db.relationship('Journal', backref='user', lazy=True)
    stats = db.relationship('Stats', backref='user', uselist=False, lazy=True)
    settings = db.relationship('Settings', backref='user', uselist=False, lazy=True)

class Journal(db.Model):
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

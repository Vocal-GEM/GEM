from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    
    # Relationships
    journals = db.relationship('Journal', backref='user', lazy=True)
    stats = db.relationship('Stats', backref='user', uselist=False, lazy=True)

class Journal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text)
    effort = db.Column(db.Integer)
    confidence = db.Column(db.Integer)
    audio_url = db.Column(db.String(200))

class Stats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_points = db.Column(db.Integer, default=0)
    total_seconds = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    high_scores = db.Column(db.JSON, default={})

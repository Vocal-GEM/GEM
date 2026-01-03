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

# Community Models (Tier 6)

class SharedVoiceSample(db.Model):
    """Anonymized voice samples shared with the community"""
    id = db.Column(db.Integer, primary_key=True)
    share_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    audio_path = db.Column(db.String(255), nullable=False)
    context = db.Column(db.String(255))  # e.g., "3 months progress"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    view_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

class SuccessStory(db.Model):
    """User success stories with before/after samples"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    story = db.Column(db.Text, nullable=False)
    timeline_months = db.Column(db.Integer)
    voice_goal = db.Column(db.String(50))  # 'feminine', 'masculine', 'androgynous'
    before_audio = db.Column(db.String(255))
    after_audio = db.Column(db.String(255))
    consent_public = db.Column(db.Boolean, default=False)
    approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    upvotes = db.Column(db.Integer, default=0)
    techniques_used = db.Column(db.JSON)  # List of techniques

class UserConnection(db.Model):
    """Mentor and pen pal connections between users"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    connection_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    connection_type = db.Column(db.String(50), nullable=False)  # 'mentor', 'pen_pal'
    status = db.Column(db.String(50), default='pending')  # 'pending', 'accepted', 'declined', 'blocked'
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    accepted_at = db.Column(db.DateTime)
    
    # Ensure unique connections
    __table_args__ = (
        db.UniqueConstraint('user_id', 'connection_id', 'connection_type', name='unique_connection'),
    )

class GroupChallenge(db.Model):
    """Weekly group challenges with aggregate progress"""
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.String(50), nullable=False)
    week_number = db.Column(db.Integer, nullable=False)
    participant_count = db.Column(db.Integer, default=0)
    total_progress = db.Column(db.Integer, default=0)
    goal = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('challenge_id', 'week_number', name='unique_weekly_challenge'),
    )

class GroupChallengeParticipant(db.Model):
    """Track individual participation in group challenges"""
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('group_challenge.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed = db.Column(db.Boolean, default=False)
    
    __table_args__ = (
        db.UniqueConstraint('challenge_id', 'user_id', name='unique_participant'),
    )

class ModerationFlag(db.Model):
    """Track flagged content for moderation"""
    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(50), nullable=False)  # 'story', 'post', 'comment'
    content_id = db.Column(db.Integer, nullable=False)
    flagged_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='pending')  # 'pending', 'reviewed', 'removed', 'approved'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    notes = db.Column(db.Text)

class CommunityBenchmark(db.Model):
    """Aggregate statistics for community benchmarks"""
    id = db.Column(db.Integer, primary_key=True)
    voice_goal = db.Column(db.String(50), nullable=False)  # 'feminine', 'masculine', 'androgynous'
    experience_level = db.Column(db.String(50), nullable=False)  # 'beginner', 'intermediate', 'advanced'
    metric_name = db.Column(db.String(100), nullable=False)  # 'avg_pitch', 'avg_resonance', etc.
    metric_value = db.Column(db.Float, nullable=False)
    sample_size = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('voice_goal', 'experience_level', 'metric_name', name='unique_benchmark'),
    )

# Voice Training Marketplace Models (Tier 10)

class ExercisePack(db.Model):
    id = db.Column(db.String(36), primary_key=True) # UUID string
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50)) # 'pitch', 'resonance', 'prosody', 'full_course'
    target_audience = db.Column(db.String(50)) # 'beginner', 'intermediate', 'advanced'
    voice_goal = db.Column(db.String(50)) # 'feminine', 'masculine', 'androgynous'
    price_cents = db.Column(db.Integer, default=0) # 0 = free
    rating = db.Column(db.Float)
    download_count = db.Column(db.Integer, default=0)
    verified = db.Column(db.Boolean, default=False) # Staff reviewed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    exercises = db.relationship('PackExercise', backref='pack', cascade='all, delete-orphan')
    downloads = db.relationship('PackDownload', backref='pack', lazy=True)
    reviews = db.relationship('PackReview', backref='pack', lazy=True)

class PackExercise(db.Model):
    id = db.Column(db.String(36), primary_key=True) # UUID string
    pack_id = db.Column(db.String(36), db.ForeignKey('exercise_pack.id'), nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    instructions = db.Column(db.Text)
    audio_demo_url = db.Column(db.String(500))
    duration_minutes = db.Column(db.Integer)
    tool_id = db.Column(db.String(100)) # Which app tool to use
    target_metrics = db.Column(db.JSON) # JSONB in Postgres, JSON here

class PackDownload(db.Model):
    id = db.Column(db.String(36), primary_key=True) # UUID string
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    pack_id = db.Column(db.String(36), db.ForeignKey('exercise_pack.id'), nullable=False)
    purchased_at = db.Column(db.DateTime, default=datetime.utcnow)

class PackReview(db.Model):
    id = db.Column(db.String(36), primary_key=True) # UUID string
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    pack_id = db.Column(db.String(36), db.ForeignKey('exercise_pack.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1-5
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Research Models (Tier 9)

class ResearchStudy(db.Model):
    """Configuration for clinical trials and research studies"""
    id = db.Column(db.String(36), primary_key=True)  # UUID
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    protocol = db.Column(db.JSON)  # Arm configuration, randomization rules
    consent_version = db.Column(db.String(50))
    irb_approval_number = db.Column(db.String(100))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    status = db.Column(db.String(50), default='draft')  # draft, active, paused, completed
    randomized = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    participants = db.relationship('StudyParticipant', backref='study', lazy=True)
    data_points = db.relationship('ResearchDataPoint', backref='study', lazy=True)

class StudyParticipant(db.Model):
    """Enrolled participant in a research study"""
    id = db.Column(db.String(36), primary_key=True)  # UUID
    study_id = db.Column(db.String(36), db.ForeignKey('research_study.id'), nullable=False)
    participant_id = db.Column(db.String(50), nullable=False)  # De-identified ID (P-XXXX)
    original_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # Optional link, null if fully anon
    study_arm = db.Column(db.String(50))
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    consent_signed_at = db.Column(db.DateTime)
    consent_version = db.Column(db.String(50))
    withdrawn = db.Column(db.Boolean, default=False)
    withdrawal_reason = db.Column(db.String(200))
    demographics = db.Column(db.JSON)  # Anonymized age range, gender identity, etc.

    __table_args__ = (
        db.UniqueConstraint('study_id', 'participant_id', name='unique_study_participant'),
    )

class ResearchDataPoint(db.Model):
    """Individual data point collected for research"""
    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.String(36), db.ForeignKey('study_participant.id'), nullable=False)
    study_id = db.Column(db.String(36), db.ForeignKey('research_study.id'), nullable=False)
    collected_at = db.Column(db.DateTime, default=datetime.utcnow)
    data_type = db.Column(db.String(50), nullable=False)
    acoustic_features = db.Column(db.JSON)  # Anonymized features only
    session_metadata = db.Column(db.JSON)  # Session context (non-identifying)

class NormativeVoiceData(db.Model):
    """Aggregated normative data from diverse populations"""
    id = db.Column(db.Integer, primary_key=True)
    language = db.Column(db.String(10), nullable=False)
    age_range = db.Column(db.String(20))
    gender_identity = db.Column(db.String(50))
    metric_name = db.Column(db.String(50), nullable=False)
    
    # Statistical aggregates
    mean_value = db.Column(db.Float)
    std_dev = db.Column(db.Float)
    percentile_10 = db.Column(db.Float)
    percentile_25 = db.Column(db.Float)
    percentile_50 = db.Column(db.Float)
    percentile_75 = db.Column(db.Float)
    percentile_90 = db.Column(db.Float)
    
    sample_size = db.Column(db.Integer, default=0)
    source_study = db.Column(db.String(100))  # Reference to source
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


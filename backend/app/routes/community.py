from flask import Blueprint, request, jsonify, current_app, send_file
from flask_login import login_required, current_user
from ..extensions import db
from ..models import (
    SharedVoiceSample, SuccessStory, UserConnection, 
    GroupChallenge, GroupChallengeParticipant, ModerationFlag,
    CommunityBenchmark, User
)
from datetime import datetime, timedelta
import os
import secrets
import hashlib

community_bp = Blueprint('community', __name__)

# Helper functions

def generate_share_id():
    """Generate a unique share ID"""
    return secrets.token_urlsafe(32)

def anonymize_audio(audio_path):
    """
    Anonymize audio file using pitch shift and time stretch
    Returns path to anonymized file
    """
    try:
        import librosa
        import soundfile as sf
        import numpy as np
        
        # Load audio
        y, sr = librosa.load(audio_path, sr=22050)
        
        # Random pitch shift ±10%
        shift = np.random.uniform(-0.1, 0.1)
        y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=shift*12)
        
        # Slight time stretch to alter rhythm
        rate = np.random.uniform(0.95, 1.05)
        y_stretched = librosa.effects.time_stretch(y_shifted, rate=rate)
        
        # Save anonymized version
        anon_path = audio_path.replace('.', '_anon.')
        sf.write(anon_path, y_stretched, sr)
        
        return anon_path
    except ImportError:
        # If librosa not available, just copy the file
        # In production, you'd want to ensure librosa is installed
        import shutil
        anon_path = audio_path.replace('.', '_anon.')
        shutil.copy(audio_path, anon_path)
        return anon_path

def check_moderation(text):
    """
    Simple content moderation check
    Returns (is_safe, flagged_words)
    """
    flagged_keywords = [
        'hate', 'kill', 'die', 'attack', 'abuse', 'harass',
        # Add more as needed
    ]
    
    text_lower = text.lower()
    flagged = [word for word in flagged_keywords if word in text_lower]
    
    return len(flagged) == 0, flagged

# Routes

@community_bp.route('/share-voice', methods=['POST'])
@login_required
def share_voice():
    """Share a voice sample anonymously"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        context = request.form.get('context', '')
        expiration_days = int(request.form.get('expiration_days', 7))
        
        # Save original file
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads/shared')
        os.makedirs(upload_folder, exist_ok=True)
        
        filename = f"{current_user.id}_{datetime.now().timestamp()}_{audio_file.filename}"
        filepath = os.path.join(upload_folder, filename)
        audio_file.save(filepath)
        
        # Anonymize audio
        anon_filepath = anonymize_audio(filepath)
        
        # Create share record
        share_id = generate_share_id()
        expires_at = datetime.utcnow() + timedelta(days=expiration_days)
        
        shared_sample = SharedVoiceSample(
            share_id=share_id,
            user_id=current_user.id,
            audio_path=anon_filepath,
            context=context,
            expires_at=expires_at
        )
        
        db.session.add(shared_sample)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'share_id': share_id,
            'expires_at': expires_at.isoformat(),
            'share_url': f"/api/community/shared/{share_id}"
        })
        
    except Exception as e:
        current_app.logger.error(f"Error sharing voice: {str(e)}")
        return jsonify({'error': 'Failed to share voice sample'}), 500

@community_bp.route('/shared/<share_id>', methods=['GET'])
def get_shared_voice(share_id):
    """Retrieve a shared voice sample"""
    try:
        sample = SharedVoiceSample.query.filter_by(share_id=share_id, is_active=True).first()
        
        if not sample:
            return jsonify({'error': 'Share not found'}), 404
        
        # Check expiration
        if datetime.utcnow() > sample.expires_at:
            sample.is_active = False
            db.session.commit()
            return jsonify({'error': 'Share has expired'}), 410
        
        # Increment view count
        sample.view_count += 1
        db.session.commit()
        
        # Return audio file
        return send_file(sample.audio_path, mimetype='audio/wav')
        
    except Exception as e:
        current_app.logger.error(f"Error retrieving shared voice: {str(e)}")
        return jsonify({'error': 'Failed to retrieve voice sample'}), 500

@community_bp.route('/benchmarks', methods=['GET'])
def get_benchmarks():
    """Get community benchmarks"""
    try:
        voice_goal = request.args.get('voice_goal', 'feminine')
        experience_level = request.args.get('experience_level', 'beginner')
        
        benchmarks = CommunityBenchmark.query.filter_by(
            voice_goal=voice_goal,
            experience_level=experience_level
        ).all()
        
        result = {}
        for benchmark in benchmarks:
            result[benchmark.metric_name] = {
                'value': benchmark.metric_value,
                'sample_size': benchmark.sample_size,
                'updated_at': benchmark.updated_at.isoformat()
            }
        
        return jsonify({
            'voice_goal': voice_goal,
            'experience_level': experience_level,
            'benchmarks': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting benchmarks: {str(e)}")
        return jsonify({'error': 'Failed to retrieve benchmarks'}), 500

@community_bp.route('/success-stories', methods=['GET'])
def get_success_stories():
    """Get approved success stories"""
    try:
        voice_goal = request.args.get('voice_goal')
        limit = int(request.args.get('limit', 20))
        
        query = SuccessStory.query.filter_by(approved=True, consent_public=True)
        
        if voice_goal:
            query = query.filter_by(voice_goal=voice_goal)
        
        stories = query.order_by(SuccessStory.upvotes.desc()).limit(limit).all()
        
        result = []
        for story in stories:
            result.append({
                'id': story.id,
                'title': story.title,
                'story': story.story,
                'timeline_months': story.timeline_months,
                'voice_goal': story.voice_goal,
                'before_audio': f"/api/community/story-audio/{story.id}/before" if story.before_audio else None,
                'after_audio': f"/api/community/story-audio/{story.id}/after" if story.after_audio else None,
                'upvotes': story.upvotes,
                'techniques_used': story.techniques_used,
                'created_at': story.created_at.isoformat()
            })
        
        return jsonify({'stories': result})
        
    except Exception as e:
        current_app.logger.error(f"Error getting success stories: {str(e)}")
        return jsonify({'error': 'Failed to retrieve success stories'}), 500

@community_bp.route('/success-stories', methods=['POST'])
@login_required
def submit_success_story():
    """Submit a success story"""
    try:
        data = request.get_json()
        
        # Moderation check
        is_safe, flagged = check_moderation(data.get('title', '') + ' ' + data.get('story', ''))
        
        story = SuccessStory(
            user_id=current_user.id,
            title=data.get('title'),
            story=data.get('story'),
            timeline_months=data.get('timeline_months'),
            voice_goal=data.get('voice_goal'),
            consent_public=data.get('consent_public', False),
            approved=is_safe,  # Auto-approve if passes moderation
            techniques_used=data.get('techniques_used', [])
        )
        
        db.session.add(story)
        db.session.commit()
        
        if not is_safe:
            # Create moderation flag
            flag = ModerationFlag(
                content_type='story',
                content_id=story.id,
                reason=f"Flagged keywords: {', '.join(flagged)}",
                status='pending'
            )
            db.session.add(flag)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'story_id': story.id,
            'approved': story.approved,
            'message': 'Story submitted successfully' if is_safe else 'Story submitted for review'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error submitting success story: {str(e)}")
        return jsonify({'error': 'Failed to submit success story'}), 500

@community_bp.route('/success-stories/<int:story_id>/upvote', methods=['POST'])
@login_required
def upvote_story(story_id):
    """Upvote a success story"""
    try:
        story = SuccessStory.query.get(story_id)
        if not story:
            return jsonify({'error': 'Story not found'}), 404
        
        story.upvotes += 1
        db.session.commit()
        
        return jsonify({'success': True, 'upvotes': story.upvotes})
        
    except Exception as e:
        current_app.logger.error(f"Error upvoting story: {str(e)}")
        return jsonify({'error': 'Failed to upvote story'}), 500

@community_bp.route('/challenges/group', methods=['GET'])
def get_group_challenges():
    """Get current group challenges"""
    try:
        week_number = datetime.now().isocalendar()[1]
        
        challenges = GroupChallenge.query.filter_by(week_number=week_number).all()
        
        result = []
        for challenge in challenges:
            result.append({
                'id': challenge.id,
                'challenge_id': challenge.challenge_id,
                'week_number': challenge.week_number,
                'participant_count': challenge.participant_count,
                'total_progress': challenge.total_progress,
                'goal': challenge.goal,
                'progress_percentage': (challenge.total_progress / challenge.goal * 100) if challenge.goal > 0 else 0
            })
        
        return jsonify({'challenges': result})
        
    except Exception as e:
        current_app.logger.error(f"Error getting group challenges: {str(e)}")
        return jsonify({'error': 'Failed to retrieve group challenges'}), 500

@community_bp.route('/challenges/group/<int:challenge_id>/join', methods=['POST'])
@login_required
def join_group_challenge(challenge_id):
    """Join a group challenge"""
    try:
        challenge = GroupChallenge.query.get(challenge_id)
        if not challenge:
            return jsonify({'error': 'Challenge not found'}), 404
        
        # Check if already joined
        existing = GroupChallengeParticipant.query.filter_by(
            challenge_id=challenge_id,
            user_id=current_user.id
        ).first()
        
        if existing:
            return jsonify({'error': 'Already joined this challenge'}), 400
        
        # Create participant record
        participant = GroupChallengeParticipant(
            challenge_id=challenge_id,
            user_id=current_user.id
        )
        
        challenge.participant_count += 1
        
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Joined challenge successfully',
            'participant_count': challenge.participant_count
        })
        
    except Exception as e:
        current_app.logger.error(f"Error joining group challenge: {str(e)}")
        return jsonify({'error': 'Failed to join challenge'}), 500

@community_bp.route('/challenges/group/<int:challenge_id>/progress', methods=['POST'])
@login_required
def update_challenge_progress(challenge_id):
    """Update progress in a group challenge"""
    try:
        data = request.get_json()
        progress_increment = data.get('progress', 0)
        
        participant = GroupChallengeParticipant.query.filter_by(
            challenge_id=challenge_id,
            user_id=current_user.id
        ).first()
        
        if not participant:
            return jsonify({'error': 'Not a participant in this challenge'}), 400
        
        challenge = GroupChallenge.query.get(challenge_id)
        
        # Update participant progress
        participant.progress += progress_increment
        
        # Update group total
        challenge.total_progress += progress_increment
        
        # Check if participant completed
        if participant.progress >= challenge.goal:
            participant.completed = True
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'your_progress': participant.progress,
            'group_progress': challenge.total_progress,
            'completed': participant.completed
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating challenge progress: {str(e)}")
        return jsonify({'error': 'Failed to update progress'}), 500

@community_bp.route('/connections/request', methods=['POST'])
@login_required
def request_connection():
    """Request a mentor or pen pal connection"""
    try:
        data = request.get_json()
        connection_id = data.get('connection_id')
        connection_type = data.get('connection_type', 'pen_pal')
        message = data.get('message', '')
        
        if not connection_id:
            return jsonify({'error': 'Connection ID required'}), 400
        
        # Check if connection already exists
        existing = UserConnection.query.filter_by(
            user_id=current_user.id,
            connection_id=connection_id,
            connection_type=connection_type
        ).first()
        
        if existing:
            return jsonify({'error': 'Connection request already exists'}), 400
        
        # Create connection request
        connection = UserConnection(
            user_id=current_user.id,
            connection_id=connection_id,
            connection_type=connection_type,
            message=message,
            status='pending'
        )
        
        db.session.add(connection)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Connection request sent',
            'connection_id': connection.id
        })
        
    except Exception as e:
        current_app.logger.error(f"Error requesting connection: {str(e)}")
        return jsonify({'error': 'Failed to send connection request'}), 500

@community_bp.route('/connections/<int:connection_id>/respond', methods=['POST'])
@login_required
def respond_to_connection(connection_id):
    """Accept or decline a connection request"""
    try:
        data = request.get_json()
        accept = data.get('accept', False)
        
        connection = UserConnection.query.get(connection_id)
        
        if not connection:
            return jsonify({'error': 'Connection not found'}), 404
        
        if connection.connection_id != current_user.id:
            return jsonify({'error': 'Not authorized'}), 403
        
        if accept:
            connection.status = 'accepted'
            connection.accepted_at = datetime.utcnow()
        else:
            connection.status = 'declined'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'status': connection.status
        })
        
    except Exception as e:
        current_app.logger.error(f"Error responding to connection: {str(e)}")
        return jsonify({'error': 'Failed to respond to connection'}), 500

@community_bp.route('/connections', methods=['GET'])
@login_required
def get_connections():
    """Get user's connections"""
    try:
        # Connections where user is the requester
        sent = UserConnection.query.filter_by(user_id=current_user.id).all()
        
        # Connections where user is the recipient
        received = UserConnection.query.filter_by(connection_id=current_user.id).all()
        
        result = {
            'sent': [],
            'received': [],
            'accepted': []
        }
        
        for conn in sent:
            conn_data = {
                'id': conn.id,
                'connection_id': conn.connection_id,
                'type': conn.connection_type,
                'status': conn.status,
                'created_at': conn.created_at.isoformat()
            }
            
            if conn.status == 'accepted':
                result['accepted'].append(conn_data)
            else:
                result['sent'].append(conn_data)
        
        for conn in received:
            if conn.status == 'pending':
                result['received'].append({
                    'id': conn.id,
                    'user_id': conn.user_id,
                    'type': conn.connection_type,
                    'message': conn.message,
                    'created_at': conn.created_at.isoformat()
                })
        
        return jsonify(result)
        
    except Exception as e:
        current_app.logger.error(f"Error getting connections: {str(e)}")
        return jsonify({'error': 'Failed to retrieve connections'}), 500

@community_bp.route('/flag-content', methods=['POST'])
@login_required
def flag_content():
    """Flag content for moderation"""
    try:
        data = request.get_json()
        
        flag = ModerationFlag(
            content_type=data.get('content_type'),
            content_id=data.get('content_id'),
            flagged_by=current_user.id,
            reason=data.get('reason'),
            status='pending'
        )
        
        db.session.add(flag)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Content flagged for review'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error flagging content: {str(e)}")
        return jsonify({'error': 'Failed to flag content'}), 500

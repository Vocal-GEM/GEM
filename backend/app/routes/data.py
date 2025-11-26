from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import datetime
from ..models import db, Stats, Journal, Settings
from ..validators import sanitize_html
from ..extensions import limiter

data_bp = Blueprint('data', __name__, url_prefix='/api')

@data_bp.route('/sync', methods=['POST'])
@login_required
@limiter.limit("100 per minute")
def sync_data():
    # Expecting a list of queue items from SyncManager
    # Payload: { queue: [ { type, payload, id, timestamp }, ... ] }
    # Or legacy payload: { stats: ..., journals: ... }
    
    data = request.json
    queue = data.get('queue', [])
    
    # Legacy support / Direct sync
    if not queue:
        if 'stats' in data:
            queue.append({'type': 'STATS_UPDATE', 'payload': data['stats']})
        if 'journals' in data:
            for j in data['journals']:
                queue.append({'type': 'JOURNAL_ADD', 'payload': j})

    processed_count = 0
    
    for item in queue:
        action_type = item.get('type')
        payload = item.get('payload')
        
        if not payload: continue

        if action_type == 'STATS_UPDATE':
            if not current_user.stats:
                current_user.stats = Stats(user=current_user)
            
            # Merge logic: take max of totals to avoid regression
            current_user.stats.total_points = max(current_user.stats.total_points, payload.get('totalPoints', 0))
            current_user.stats.total_seconds = max(current_user.stats.total_seconds, payload.get('totalSeconds', 0))
            current_user.stats.level = max(current_user.stats.level, payload.get('level', 1))
            
            # Merge high scores
            current_scores = current_user.stats.high_scores or {}
            new_scores = payload.get('highScores', {})
            for game, score in new_scores.items():
                current_scores[game] = max(current_scores.get(game, 0), score)
            current_user.stats.high_scores = current_scores
            
        elif action_type == 'JOURNAL_ADD':
            # Check for duplicates via client_id if available, or simple date check
            client_id = payload.get('id') or payload.get('date') # Fallback
            
            exists = False
            if client_id:
                exists = Journal.query.filter_by(user_id=current_user.id, client_id=str(client_id)).first() is not None
            
            if not exists:
                notes = payload.get('content') or payload.get('notes')
                if notes:
                    notes = sanitize_html(notes)
                
                new_journal = Journal(
                    user=current_user,
                    date=payload.get('date'),
                    notes=notes,
                    effort=payload.get('effort', 0),
                    confidence=payload.get('confidence', 0),
                    audio_url=payload.get('audioUrl'),
                    mood=payload.get('mood'),
                    tags=payload.get('tags'),
                    client_id=str(client_id)
                )
                db.session.add(new_journal)
                
        elif action_type == 'SETTINGS_UPDATE':
            if not current_user.settings:
                current_user.settings = Settings(user=current_user)
            current_user.settings.preferences = payload

        processed_count += 1

    try:
        db.session.commit()
        return jsonify({"status": "synced", "processed": processed_count})
    except Exception as e:
        db.session.rollback()
        print(f"Sync Error: {e}")
        return jsonify({"error": "Sync failed"}), 500

@data_bp.route('/data', methods=['GET'])
@login_required
def get_data():
    stats = current_user.stats
    settings = current_user.settings
    
    return jsonify({
        "stats": {
            "totalPoints": stats.total_points if stats else 0,
            "totalSeconds": stats.total_seconds if stats else 0,
            "level": stats.level if stats else 1,
            "highScores": stats.high_scores if stats else {}
        },
        "settings": settings.preferences if settings else {},
        "journals": [{
            "id": j.client_id, # Return client_id as id for frontend consistency
            "date": j.date,
            "content": j.notes,
            "effort": j.effort,
            "confidence": j.confidence,
            "audioUrl": j.audio_url,
            "mood": j.mood,
            "tags": j.tags
        } for j in current_user.journals]
    })

@data_bp.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        # Add timestamp to make unique
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{filename}"
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        return jsonify({"url": f"/uploads/{filename}"})

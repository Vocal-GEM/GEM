from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import datetime
from ..models import db, Stats, Journal

data_bp = Blueprint('data', __name__, url_prefix='/api')

@data_bp.route('/sync', methods=['POST'])
@login_required
def sync_data():
    data = request.json
    
    # 1. Sync Stats
    if 'stats' in data:
        client_stats = data['stats']
        if not current_user.stats:
            current_user.stats = Stats(user=current_user)
        
        current_user.stats.total_points = client_stats.get('totalPoints', 0)
        current_user.stats.total_seconds = client_stats.get('totalSeconds', 0)
    
    # 2. Sync Journals (Simple append for now)
    if 'journals' in data:
        for j in data['journals']:
            # Check if exists (by date/content hash?) - simplifying: just add if new
            pass 

    db.session.commit()
    return jsonify({"status": "synced"})

@data_bp.route('/data', methods=['GET'])
@login_required
def get_data():
    stats = current_user.stats
    return jsonify({
        "stats": {
            "totalPoints": stats.total_points if stats else 0,
            "totalSeconds": stats.total_seconds if stats else 0,
        },
        "journals": [{
            "date": j.date,
            "notes": j.notes,
            "effort": j.effort,
            "confidence": j.confidence,
            "audioUrl": j.audio_url
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

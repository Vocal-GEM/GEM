from flask import Blueprint, jsonify, request
from app.models import db, ExercisePack, PackExercise, PackDownload, PackReview, User
from flask_login import login_required, current_user
import uuid
from datetime import datetime

marketplace_bp = Blueprint('marketplace', __name__)

@marketplace_bp.route('/packs', methods=['GET'])
def get_packs():
    category = request.args.get('category')
    voice_goal = request.args.get('voice_goal')
    sort_by = request.args.get('sort', 'rating')
    
    query = ExercisePack.query
    
    if category:
        query = query.filter_by(category=category)
    if voice_goal:
        query = query.filter_by(voice_goal=voice_goal)
        
    if sort_by == 'rating':
        query = query.order_by(ExercisePack.rating.desc())
    elif sort_by == 'newest':
        query = query.order_by(ExercisePack.created_at.desc())
    elif sort_by == 'downloads':
        query = query.order_by(ExercisePack.download_count.desc())
        
    packs = query.limit(50).all()
    
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'creator': User.query.get(p.creator_id).username if User.query.get(p.creator_id) else 'Unknown',
        'description': p.description,
        'category': p.category,
        'rating': p.rating,
        'download_count': p.download_count,
        'price_cents': p.price_cents
    } for p in packs])

@marketplace_bp.route('/packs/<pack_id>', methods=['GET'])
def get_pack_details(pack_id):
    pack = ExercisePack.query.get_or_404(pack_id)
    exercises = PackExercise.query.filter_by(pack_id=pack_id).order_by(PackExercise.order_index).all()
    
    is_owned = False
    if current_user.is_authenticated:
        download = PackDownload.query.filter_by(user_id=current_user.id, pack_id=pack_id).first()
        is_owned = download is not None
        
    return jsonify({
        'id': pack.id,
        'title': pack.title,
        'description': pack.description,
        'creator_id': pack.creator_id,
        'exercises': [{
            'id': e.id,
            'title': e.title,
            'duration': e.duration_minutes,
            'tool_id': e.tool_id
        } for e in exercises],
        'is_owned': is_owned
    })

@marketplace_bp.route('/packs', methods=['POST'])
@login_required
def create_pack():
    data = request.get_json()
    
    pack_id = str(uuid.uuid4())
    pack = ExercisePack(
        id=pack_id,
        creator_id=current_user.id,
        title=data.get('title'),
        description=data.get('description'),
        category=data.get('category'),
        target_audience=data.get('target_audience'),
        voice_goal=data.get('voice_goal'),
        price_cents=data.get('price_cents', 0)
    )
    
    db.session.add(pack)
    
    exercises = data.get('exercises', [])
    for idx, ex in enumerate(exercises):
        exercise = PackExercise(
            id=str(uuid.uuid4()),
            pack_id=pack_id,
            order_index=idx,
            title=ex.get('title'),
            instructions=ex.get('instructions'),
            tool_id=ex.get('tool_id'),
            target_metrics=ex.get('target_metrics')
        )
        db.session.add(exercise)
        
    db.session.commit()
    
    return jsonify({'id': pack_id, 'message': 'Pack created successfully'}), 201

@marketplace_bp.route('/packs/<pack_id>/download', methods=['POST'])
@login_required
def download_pack(pack_id):
    pack = ExercisePack.query.get_or_404(pack_id)
    
    # Check if already downloaded
    existing = PackDownload.query.filter_by(user_id=current_user.id, pack_id=pack_id).first()
    if existing:
        return jsonify({'message': 'Already in library'}), 200
        
    # Process payment if needed (skipped for now)
    
    download = PackDownload(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        pack_id=pack_id
    )
    
    pack.download_count += 1
    db.session.add(download)
    db.session.commit()
    
    return jsonify({'message': 'Pack added to library'}), 201

@marketplace_bp.route('/my-packs', methods=['GET'])
@login_required
def get_my_packs():
    downloads = PackDownload.query.filter_by(user_id=current_user.id).all()
    packs = [d.pack for d in downloads]
    
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'category': p.category,
        'downloaded_at': next(d.purchased_at for d in downloads if d.pack_id == p.id).isoformat()
    } for p in packs])

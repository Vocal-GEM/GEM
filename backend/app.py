from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
def health():
    return jsonify({"status": "ok", "message": "Vocal GEM Backend Running"})

# Auth Routes
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    
    # Init stats
    new_stats = Stats(user=new_user, total_points=0, high_scores={})
    db.session.add(new_stats)
    
    db.session.commit()
    
    login_user(new_user)
    return jsonify({"message": "User created", "user": {"id": new_user.id, "username": new_user.username}})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        login_user(user)
        return jsonify({"message": "Logged in", "user": {"id": user.id, "username": user.username}})
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

@app.route('/api/me')
def me():
    if current_user.is_authenticated:
        return jsonify({"user": {"id": current_user.id, "username": current_user.username}})
    return jsonify({"user": None})

# Data Routes
@app.route('/api/sync', methods=['POST'])
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

@app.route('/api/data', methods=['GET'])
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

@app.route('/api/upload', methods=['POST'])
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
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({"url": f"/uploads/{filename}"})

@app.route('/api/chat', methods=['POST'])
@login_required
def chat():
    data = request.json
    user_message = data.get('message', '')
    history = data.get('history', []) 
    
    system_prompt = """You are Coach GEM, an empathetic and knowledgeable voice training assistant for gender-affirming voice therapy. 
    Your goal is to help users achieve their voice goals (feminization, masculinization, or androgyny) through positive reinforcement and technical advice.
    - Be encouraging and supportive.
    - Use simple, accessible language for vocal concepts (pitch, resonance, weight).
    - Suggest specific exercises from the app (Resonance Orb, Pitch Visualizer, Games).
    - Keep responses concise (under 3 sentences) unless asked for a detailed explanation.
    """

    if not model:
        # Fallback Mock Logic
        response = "I'm listening! (Gemini API Key missing, using mock response)"
        if "pitch" in user_message.lower():
            response = "To raise your pitch, try reducing your vocal weight and increasing resonance. Have you tried the 'Resonance Orb' exercise?"
        elif "resonance" in user_message.lower():
            response = "Bright resonance is key for a feminine voice. Try to smile while speaking and keep your tongue high."
        return jsonify({"role": "assistant", "content": response})

    try:
        # Construct chat history for Gemini
        chat_session = model.start_chat(history=[])
        full_prompt = f"{system_prompt}\n\nUser: {user_message}"
        response = chat_session.send_message(full_prompt)
        return jsonify({"role": "assistant", "content": response.text})
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return jsonify({"role": "assistant", "content": "Sorry, I'm having trouble connecting to my brain right now. Try again later!"})

# Initialize DB
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
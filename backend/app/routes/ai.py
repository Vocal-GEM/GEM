from flask import Blueprint, request, jsonify
from flask_login import login_required
import google.generativeai as genai
import os

ai_bp = Blueprint('ai', __name__, url_prefix='/api')

# --- Gemini Setup ---
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None
    print("WARNING: GEMINI_API_KEY not found. AI features will use mock responses.")

@ai_bp.route('/chat', methods=['POST'])
@login_required
def chat():
    if not model:
        return jsonify({
            "role": "assistant", 
            "content": "I'm currently in offline mode (API Key missing). I can still help with basic questions about pitch, resonance, and weight!",
            "isMock": True
        }), 503

    data = request.json
    user_message = data.get('message', '')
    history = data.get('history', []) 
    context = data.get('context', {}) # { stats: {...}, goals: [...], journals: [...] }

    # Construct Context String
    context_str = ""
    if context:
        stats = context.get('stats', {})
        goals = context.get('goals', [])
        journals = context.get('journals', [])
        
        # Format recent journals
        recent_journals = "\n".join([f"- {j.get('date', 'Unknown')}: {j.get('content', '')} (Mood: {j.get('mood', 'N/A')})" for j in journals[:3]])
        
        context_str = f"""
        CURRENT USER CONTEXT:
        - Total Practice Time: {int(stats.get('totalSeconds', 0) / 60)} minutes
        - Total Points: {stats.get('totalPoints', 0)}
        - Current Level: {stats.get('level', 1)}
        - Active Goals: {', '.join([g['label'] for g in goals if g.get('target', 0) > g.get('current', 0)])}
        
        RECENT JOURNALS:
        {recent_journals if recent_journals else "No recent entries."}
        """

    system_prompt = f"""You are Coach GEM, an empathetic and knowledgeable voice training assistant for gender-affirming voice therapy. 
    Your goal is to help users achieve their voice goals (feminization, masculinization, or androgyny) through positive reinforcement and technical advice.
    
    {context_str}

    GUIDELINES:
    - Be encouraging and supportive. Acknowledge their progress based on the context above.
    - If the user mentions feeling down or frustrated in their journals, offer specific validation and encouragement.
    - Use simple, accessible language for vocal concepts (pitch, resonance, weight).
    - Suggest specific exercises from the app (Resonance Orb, Pitch Visualizer, Games).
    - Keep responses concise (under 3 sentences) unless asked for a detailed explanation.
    - If the user has low practice time, encourage small steps. If they have high points, celebrate their dedication.
    """

    try:
        # Construct chat history for Gemini
        gemini_history = []
        # We need to ensure alternating user/model roles. 
        # We'll filter the history to ensure validity or just use the last few turns.
        for msg in history[-10:]: # Limit context window
            role = "user" if msg['role'] == 'user' else "model"
            # Gemini doesn't like empty content
            if msg.get('content'):
                gemini_history.append({"role": role, "parts": [msg['content']]})

        # Ensure the first message is from the user (Gemini requirement if starting with history)
        if gemini_history and gemini_history[0]['role'] == 'model':
            gemini_history.pop(0)

        chat_session = model.start_chat(history=gemini_history)
        
        # Prepend system prompt to the current message for immediate context
        full_prompt = f"{system_prompt}\n\nUser: {user_message}"
        
        response = chat_session.send_message(full_prompt)
        return jsonify({"role": "assistant", "content": response.text})
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return jsonify({"role": "assistant", "content": "Sorry, I'm having trouble connecting to my brain right now. Try again later!"}), 500

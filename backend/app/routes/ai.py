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
    data = request.json
    user_message = data.get('message', '')
    history = data.get('history', []) 
    context = data.get('context', {}) # { stats: {...}, goals: [...] }

    # Construct Context String
    context_str = ""
    if context:
        stats = context.get('stats', {})
        goals = context.get('goals', [])
        context_str = f"""
        CURRENT USER CONTEXT:
        - Total Practice Time: {int(stats.get('totalSeconds', 0) / 60)} minutes
        - Total Points: {stats.get('totalPoints', 0)}
        - Current Level: {stats.get('level', 1)}
        - Active Goals: {', '.join([g['label'] for g in goals if g.get('target', 0) > g.get('current', 0)])}
        """

    system_prompt = f"""You are Coach GEM, an empathetic and knowledgeable voice training assistant for gender-affirming voice therapy. 
    Your goal is to help users achieve their voice goals (feminization, masculinization, or androgyny) through positive reinforcement and technical advice.
    
    {context_str}

    GUIDELINES:
    - Be encouraging and supportive. Acknowledge their progress based on the context above.
    - Use simple, accessible language for vocal concepts (pitch, resonance, weight).
    - Suggest specific exercises from the app (Resonance Orb, Pitch Visualizer, Games).
    - Keep responses concise (under 3 sentences) unless asked for a detailed explanation.
    - If the user has low practice time, encourage small steps. If they have high points, celebrate their dedication.
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
        # We use a fresh chat session but inject history manually into the prompt for statelessness if needed, 
        # or use history properly. For now, simple prompt injection is robust.
        
        # Convert history to Gemini format if needed, but for now we just append the last message with context.
        # A better approach for multi-turn is to actually use history.
        
        gemini_history = []
        for msg in history:
            role = "user" if msg['role'] == 'user' else "model"
            gemini_history.append({"role": role, "parts": [msg['content']]})

        chat_session = model.start_chat(history=gemini_history)
        
        # We send the system prompt as a "User" message first to set context if history is empty, 
        # or prepend it to the current message. Prepending is safer for context retention.
        full_prompt = f"{system_prompt}\n\nUser: {user_message}"
        
        response = chat_session.send_message(full_prompt)
        return jsonify({"role": "assistant", "content": response.text})
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return jsonify({"role": "assistant", "content": "Sorry, I'm having trouble connecting to my brain right now. Try again later!"})

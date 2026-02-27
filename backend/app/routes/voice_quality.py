from flask import Blueprint, request, jsonify, send_file, after_this_request
from flask import Blueprint, request, jsonify, send_file, after_this_request, current_app
import os
import tempfile
import soundfile as sf
from ..voice_quality_analysis import analyze_file, analyze_file_with_transcript, GOAL_PRESETS, clean_audio_signal, load_audio
from ..asr_transcriber import transcribe_audio_with_words
from ..validators import validate_file_upload
from ..extensions import limiter
from ..utils.cleanup import cleanup_file_after_request

voice_quality_bp = Blueprint('voice_quality', __name__)

@voice_quality_bp.route('/api/voice-quality/analyze', methods=['POST'])
@limiter.limit("10 per minute")
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded (field name 'audio' required)."}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    # Security: Validate file type (only audio allowed)
    is_valid, error = validate_file_upload(file.filename, allowed_types=['audio'], file_stream=file)
    if not is_valid:
        return jsonify({"error": error}), 400

    goal_name = request.form.get("goal", "transfem_soft_slightly_breathy")
    if goal_name not in GOAL_PRESETS:
        goal_name = "transfem_soft_slightly_breathy"

    include_transcript = request.form.get("include_transcript", "false").lower() == "true"

    # Save to temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
        file.save(tmp_path)

    try:
        if include_transcript:
            result = analyze_file_with_transcript(
                tmp_path,
                goal_name=goal_name,
                transcriber=transcribe_audio_with_words,
                language="en"
            )
        else:
            result = analyze_file(tmp_path, goal_name=goal_name)
    except Exception as e:
        # Security: Do not expose internal error details to client
        print(f"Voice quality analysis error: {e}")
        return jsonify({"error": "An internal error occurred during voice quality analysis."}), 500
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return jsonify(result)

@voice_quality_bp.route('/api/voice-quality/clean', methods=['POST'])
@limiter.limit("5 per minute")
def clean_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Security: Validate file type (only audio allowed)
    is_valid, error = validate_file_upload(file.filename, allowed_types=['audio'], file_stream=file)
    if not is_valid:
        return jsonify({"error": error}), 400

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)
            
        # Load, Clean, Save
        y, sr = load_audio(tmp_path)
        y_clean = clean_audio_signal(y, sr)
        
        # Save back to temp
        sf.write(tmp_path, y_clean, sr)
        
        @after_this_request
        def remove_file(response):
            try:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception as e:
                print(f"Error removing temp file: {e}")
            return response
        # Schedule cleanup after response
        cleanup_file_after_request(tmp_path)

        return send_file(
            tmp_path, 
            mimetype="audio/wav", 
            as_attachment=True, 
            download_name="cleaned_audio.wav"
        )

    except Exception as e:
        current_app.logger.error(f"Voice cleaning error: {e}")
        # Cleanup on error since after_request might not run or file might exist
        if 'tmp_path' in locals() and tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass
        # Security: Do not expose internal error details to client
        return jsonify({'error': 'An internal error occurred during audio cleaning.'}), 500

# ----------------------
# Voice Manipulation (Voice Lab / PSOLA)
# ----------------------

@voice_quality_bp.route('/api/voice-quality/manipulate', methods=['POST'])
@limiter.limit("5 per minute")
def manipulate_file():
    """
    Endpoint to shift pitch and formants of an uploaded file.
    Proposed usage: "Goal Preview" - letting users hear themselves higher/brighter.
    """
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Security check
    is_valid, error_msg = validate_file_upload(file.filename, allowed_types=['audio'], file_stream=file)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
        
    # Parameters
    try:
        pitch_shift = float(request.form.get("pitch_shift", 0.0))  # semitones
        formant_shift = float(request.form.get("formant_shift", 1.0)) # ratio (e.g. 1.1)
    except ValueError:
        return jsonify({"error": "Invalid numerical parameters"}), 400
        
    tmp_path = None
    processed_path = None
    
    try:
        # Save temp
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)
            
        # Load via Parselmouth
        import parselmouth
        from ..services.voicelab_service import manipulate_voice
        
        sound = parselmouth.Sound(tmp_path)
        manipulated = manipulate_voice(sound, pitch_shift, formant_shift)
        
        if manipulated is None:
             return jsonify({"error": "Manipulation failed"}), 500
             
        # Save output
        processed_path = tmp_path.replace(".wav", "_manipulated.wav")
        manipulated.save(processed_path, "WAV")
        
        @after_this_request
        def remove_processed_file(response):
            try:
                if processed_path and os.path.exists(processed_path):
                    os.remove(processed_path)
            except Exception as e:
                print(f"Error removing processed file: {e}")
            return response
        # Schedule cleanup for both files
        cleanup_file_after_request(tmp_path)
        cleanup_file_after_request(processed_path)

        return send_file(
            processed_path,
            mimetype="audio/wav",
            as_attachment=True,
            download_name="manipulated_voice.wav"
        )

    except Exception as e:
        current_app.logger.error(f"Voice manipulation error: {e}")
        # If error occurred, clean up processed file too since we won't send it
        if processed_path and os.path.exists(processed_path):
             try:
                os.remove(processed_path)
             except:
                pass
        if tmp_path and os.path.exists(tmp_path):
             try:
                os.remove(tmp_path)
             except:
                pass
        # Security: Do not expose internal error details to client
        return jsonify({'error': 'An internal error occurred during voice manipulation.'}), 500

@voice_quality_bp.route('/api/voice-quality/goals', methods=['GET'])
def get_goals():
    return jsonify(GOAL_PRESETS)

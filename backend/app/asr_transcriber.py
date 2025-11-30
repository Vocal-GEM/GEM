from typing import Dict, Any, List

try:
    from faster_whisper import WhisperModel
    _model_available = True
except ImportError:
    print("Warning: faster-whisper not installed. ASR disabled.")
    _model_available = False
    WhisperModel = None

# Lazy loading variable
_model = None

def get_model():
    global _model
    if _model is None and _model_available:
        try:
            print("Loading Whisper model...")
            # Use tiny model to save memory on Render free tier
            _model = WhisperModel("tiny", device="cpu", compute_type="int8")
        except Exception as e:
            print(f"Warning: Failed to load Whisper model: {e}")
            _model = None
    return _model

def transcribe_audio_with_words(path: str, language: str = "en") -> Dict[str, Any]:
    """
    Run ASR on the audio file and return word-level timestamps.
    """
    model = get_model()
    if model is None:
        return {
            "full_text": "ASR model not loaded.",
            "language": language,
            "words": []
        }

    segments, info = model.transcribe(
        path,
        language=language,
        beam_size=5,
        word_timestamps=True
    )

    words: List[Dict[str, Any]] = []
    full_text_parts: List[str] = []

    for seg in segments:
        if seg.text:
            full_text_parts.append(seg.text.strip())
        for w in seg.words:
            words.append({
                "text": w.word.strip(),
                "start_s": float(w.start),
                "end_s": float(w.end)
            })

    full_text = " ".join(full_text_parts).strip()

    return {
        "full_text": full_text,
        "language": language or info.language,
        "words": words
    }

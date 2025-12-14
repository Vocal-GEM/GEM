
import sys
import os

print("Checking dependencies...")

try:
    import numpy
    print(f"numpy: {numpy.__version__}")
except ImportError as e:
    print(f"FAIL: numpy not found. {e}")

try:
    import scipy
    print(f"scipy: {scipy.__version__}")
except ImportError as e:
    print(f"FAIL: scipy not found. {e}")

try:
    import librosa
    print(f"librosa: {librosa.__version__}")
except ImportError as e:
    print(f"FAIL: librosa not found. {e}")

try:
    import faster_whisper
    print(f"faster_whisper: {faster_whisper.__version__}")
except ImportError as e:
    print(f"FAIL: faster_whisper not found. {e}")

# Check FFmpeg (librosa usually needs it for non-wav, faster-whisper needs it)
import shutil
ffmpeg_path = shutil.which("ffmpeg")
if ffmpeg_path:
    print(f"ffmpeg found at: {ffmpeg_path}")
else:
    print("WARNING: ffmpeg not found in PATH. Audio loading/transcription might fail.")

# Try to load model
try:
    from faster_whisper import WhisperModel
    print("Attempting to load WhisperModel('tiny')...")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    print("WhisperModel loaded successfully.")
except Exception as e:
    print(f"FAIL: WhisperModel load failed. {e}")

print("Check complete.")

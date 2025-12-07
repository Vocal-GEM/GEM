import os
import sys

print("Testing standalone whisper...")
try:
    from faster_whisper import WhisperModel
    print("faster_whisper imported successfully.")
except ImportError as e:
    print(f"Failed to import faster_whisper: {e}")
    sys.exit(1)

# Create dummy audio
import wave
import struct

dummy_wav = "debug_audio.wav"
with wave.open(dummy_wav, "w") as f:
    f.setnchannels(1)
    f.setsampwidth(2)
    f.setframerate(16000)
    # 1 second of silence
    data = struct.pack("<" + ("h"*16000), *([0]*16000))
    f.writeframes(data)

try:
    print("Loading model (tiny, cpu, int8)...")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    print("Model loaded.")
    
    print("Transcribing...")
    segments, info = model.transcribe(
        dummy_wav,
        language="en",
        beam_size=5,
        word_timestamps=True
    )
    
    print("Iterating segments...")
    count = 0
    for seg in segments:
        print(f"Segment: {seg.text}")
        for w in seg.words:
            print(f"Word: {w.word}")
        count += 1
    print(f"Done. Segments: {count}")

except Exception as e:
    print(f"CRASH/ERROR: {e}")
    import traceback
    traceback.print_exc()

finally:
    if os.path.exists(dummy_wav):
        os.remove(dummy_wav)

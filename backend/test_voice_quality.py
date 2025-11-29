import requests
import os

BASE_URL = "http://localhost:5000"

def test_goals():
    print("Testing /api/voice-quality/goals...")
    try:
        resp = requests.get(f"{BASE_URL}/api/voice-quality/goals")
        if resp.status_code == 200:
            print("SUCCESS: Goals endpoint returned 200")
            print(resp.json().keys())
        else:
            print(f"FAILURE: Goals endpoint returned {resp.status_code}")
    except Exception as e:
        print(f"FAILURE: Could not connect to backend: {e}")

def test_analyze():
    print("\nTesting /api/voice-quality/analyze...")
    # Create a dummy wav file
    import wave
    import struct
    
    dummy_wav = "test_audio.wav"
    with wave.open(dummy_wav, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(16000)
        # 1 second of silence
        data = struct.pack("<" + ("h"*16000), *([0]*16000))
        f.writeframes(data)
        
    try:
        with open(dummy_wav, "rb") as f:
            files = {"audio": f}
            data = {"goal": "transfem_soft_slightly_breathy", "include_transcript": "false"}
            resp = requests.post(f"{BASE_URL}/api/voice-quality/analyze", files=files, data=data)
            
        if resp.status_code == 200:
            print("SUCCESS: Analyze endpoint returned 200")
            res = resp.json()
            print("Summary:", res.get("summary"))
        else:
            print(f"FAILURE: Analyze endpoint returned {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"FAILURE: Could not connect to backend: {e}")
    finally:
        if os.path.exists(dummy_wav):
            os.remove(dummy_wav)

if __name__ == "__main__":
    test_goals()
    test_analyze()

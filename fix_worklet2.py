import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("timestamp: currentTime,", "timestamp: globalThis.currentTime,")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/audio/PitchWorklet.js")

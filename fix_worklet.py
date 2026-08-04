import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("const startTime = currentTime;", "const startTime = globalThis.currentTime;")
    content = content.replace("const processingTime = (currentTime - startTime) * 1000;", "const processingTime = (globalThis.currentTime - startTime) * 1000;")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/audio/PitchWorklet.js")

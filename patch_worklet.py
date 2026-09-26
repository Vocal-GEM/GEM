with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()

content = content.replace("currentTime", "globalThis.currentTime")

with open('src/audio/PitchWorklet.js', 'w') as f:
    f.write(content)

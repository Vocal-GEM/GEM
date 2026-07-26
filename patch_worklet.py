import os

filepath = 'src/audio/PitchWorklet.js'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('currentTime', 'globalThis.currentTime')

with open(filepath, 'w') as f:
    f.write(content)

with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()

# Add global directive at the top
if '/* global currentTime, currentFrame, sampleRate */' not in content:
    content = '/* global currentTime, currentFrame, sampleRate */\n' + content

with open('src/audio/PitchWorklet.js', 'w') as f:
    f.write(content)

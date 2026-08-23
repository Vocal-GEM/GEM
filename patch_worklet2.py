with open("src/audio/PitchWorklet.js", "r") as f:
    content = f.read()

content = content.replace('const startTime = currentFrame / sampleRate;', 'const startTime = globalThis.currentTime;')
content = content.replace('const processingTime = ((currentFrame / sampleRate) - startTime) * 1000;', 'const processingTime = (globalThis.currentTime - startTime) * 1000;')
content = content.replace('timestamp: currentFrame / sampleRate,', 'timestamp: globalThis.currentTime,')

with open("src/audio/PitchWorklet.js", "w") as f:
    f.write(content)

with open("src/audio/PitchWorklet.js", "r") as f:
    content = f.read()

content = content.replace('const startTime = currentTime;', 'const startTime = currentFrame / sampleRate;')
content = content.replace('const processingTime = (currentTime - startTime) * 1000;', 'const processingTime = ((currentFrame / sampleRate) - startTime) * 1000;')
content = content.replace('timestamp: currentTime,', 'timestamp: currentFrame / sampleRate,')

with open("src/audio/PitchWorklet.js", "w") as f:
    f.write(content)

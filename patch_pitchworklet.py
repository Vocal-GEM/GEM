import re

with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()

content = content.replace("const startTime = currentTime;", "const startTime = performance.now();")
content = content.replace("const processingTime = (currentTime - startTime) * 1000;", "const processingTime = performance.now() - startTime;")
content = content.replace("timestamp: currentTime,", "timestamp: performance.now(),")

# fix warning parameters unused
content = content.replace("process(inputs, outputs, parameters)", "process(inputs, _outputs, _parameters)")
with open('src/audio/PitchWorklet.js', 'w') as f:
    f.write(content)

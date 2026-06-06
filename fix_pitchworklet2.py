with open("src/audio/PitchWorklet.js", "r") as f:
    content = f.read()

new_content = content.replace("const startTime = currentTime;", "const startTime = typeof currentTime !== 'undefined' ? currentTime : performance.now();")
new_content = new_content.replace("const processingTime = (currentTime - startTime) * 1000; // Convert to ms", "const processingTime = ((typeof currentTime !== 'undefined' ? currentTime : performance.now()) - startTime) * 1000; // Convert to ms")
new_content = new_content.replace("timestamp: currentTime,", "timestamp: typeof currentTime !== 'undefined' ? currentTime : performance.now(),")

with open("src/audio/PitchWorklet.js", "w") as f:
    f.write(new_content)

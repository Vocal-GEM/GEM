with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()

search = """            if (this.bufferIndex >= this.bufferSize) {
                const startTime = currentTime;"""

replace = """            if (this.bufferIndex >= this.bufferSize) {
                // In AudioWorklets, currentTime represents the context's time.
                const startTime = currentTime;"""

if search in content:
    content = content.replace(search, replace)
    with open('src/audio/PitchWorklet.js', 'w') as f:
        f.write(content)
    print("Success replacing currentTime")
else:
    print("Search string not found")

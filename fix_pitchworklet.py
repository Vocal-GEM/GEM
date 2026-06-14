with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()
# CurrentTime inside AudioWorkletProcessor is accessible via `currentTime` but usually standard env doesn't complain. But it's available via globalThis.currentTime.
# Let's see what it was: `globalThis.currentTime || 0 - startTime` is wrong, it should be `(globalThis.currentTime || 0) - startTime`
content = content.replace('globalThis.currentTime || 0 - startTime', '(globalThis.currentTime || 0) - startTime')
with open('src/audio/PitchWorklet.js', 'w') as f:
    f.write(content)

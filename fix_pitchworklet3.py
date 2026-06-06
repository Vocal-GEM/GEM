with open("src/audio/PitchWorklet.js", "r") as f:
    content = f.read()

new_content = content.replace("globalThis.currentTime", "currentTime")

with open("src/audio/PitchWorklet.js", "w") as f:
    f.write(new_content)

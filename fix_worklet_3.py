with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()

content = "/* global currentTime */\n" + content
with open('src/audio/PitchWorklet.js', 'w') as f:
    f.write(content)
print("Success adding global currentTime")

with open('src/audio/PitchWorklet.js', 'r') as f:
    lines = f.readlines()
# insert /* global currentTime */ right before class
for i, line in enumerate(lines):
    if line.startswith('class PitchProcessor'):
        lines.insert(i, '/* global currentTime */\n')
        break
with open('src/audio/PitchWorklet.js', 'w') as f:
    f.writelines(lines)

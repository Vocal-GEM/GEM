with open('src/audio/PitchWorklet.js', 'r') as f:
    lines = f.readlines()
# Remove all lines that contain "global currentTime"
lines = [l for l in lines if 'global currentTime' not in l]
with open('src/audio/PitchWorklet.js', 'w') as f:
    f.writelines(lines)

with open('src/components/viz/Spectrogram3D.test.jsx', 'r') as f:
    content = f.read()
content = content.replace('global.', 'globalThis.')
with open('src/components/viz/Spectrogram3D.test.jsx', 'w') as f:
    f.write(content)

with open('src/components/viz/PitchOrb.test.jsx', 'r') as f:
    content = f.read()
content = content.replace('global.', 'globalThis.')
with open('src/components/viz/PitchOrb.test.jsx', 'w') as f:
    f.write(content)

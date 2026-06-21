# Fix Spectrogram3D.test.jsx
with open('src/components/viz/Spectrogram3D.test.jsx', 'r') as f:
    content = f.read()

content = content.replace('global.ResizeObserver', 'globalThis.ResizeObserver')

with open('src/components/viz/Spectrogram3D.test.jsx', 'w') as f:
    f.write(content)

# Fix PitchOrb.test.jsx
with open('src/components/viz/PitchOrb.test.jsx', 'r') as f:
    content = f.read()

content = content.replace('global.ResizeObserver', 'globalThis.ResizeObserver')

with open('src/components/viz/PitchOrb.test.jsx', 'w') as f:
    f.write(content)

with open('src/components/viz/Spectrogram3D.test.jsx', 'r') as f:
    c = f.read()
c = c.replace('globalThis.mockUseFrameCallback = cb;', 'global.mockUseFrameCallback = cb;')
c = c.replace('globalThis.requestAnimationFrame', 'global.requestAnimationFrame')
c = c.replace('globalThis.mockUseFrameCallback', 'global.mockUseFrameCallback')
with open('src/components/viz/Spectrogram3D.test.jsx', 'w') as f:
    f.write(c)

with open('src/components/viz/PitchOrb.test.jsx', 'r') as f:
    c = f.read()
c = c.replace('globalThis.requestAnimationFrame', 'global.requestAnimationFrame')
with open('src/components/viz/PitchOrb.test.jsx', 'w') as f:
    f.write(c)

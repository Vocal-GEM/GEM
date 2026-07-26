import os

filepath = 'src/components/viz/Spectrogram3D.test.jsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('global.mockUseFrameCallback', 'globalThis.mockUseFrameCallback')
content = content.replace('global.requestAnimationFrame', 'globalThis.requestAnimationFrame')

with open(filepath, 'w') as f:
    f.write(content)

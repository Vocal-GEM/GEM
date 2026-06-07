with open("src/components/viz/Spectrogram3D.test.jsx", "r") as f:
    c = f.read()

# Replace global.mockUseFrameCallback with globalThis.mockUseFrameCallback
# Replace global.requestAnimationFrame with globalThis.requestAnimationFrame
# Replace delete global.mockUseFrameCallback with delete globalThis.mockUseFrameCallback
c = c.replace('global.mockUseFrameCallback', 'globalThis.mockUseFrameCallback')
c = c.replace('global.requestAnimationFrame', 'globalThis.requestAnimationFrame')

with open("src/components/viz/Spectrogram3D.test.jsx", "w") as f:
    f.write(c)

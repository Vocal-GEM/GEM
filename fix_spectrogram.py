with open("src/components/viz/Spectrogram3D.test.jsx", "r") as f:
    content = f.read()

new_content = content.replace("global.mockUseFrameCallback", "globalThis.mockUseFrameCallback")
new_content = new_content.replace("global.requestAnimationFrame", "globalThis.requestAnimationFrame")

with open("src/components/viz/Spectrogram3D.test.jsx", "w") as f:
    f.write(new_content)

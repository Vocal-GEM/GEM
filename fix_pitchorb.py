with open("src/components/viz/PitchOrb.test.jsx", "r") as f:
    content = f.read()

new_content = content.replace("global.requestAnimationFrame", "globalThis.requestAnimationFrame")

with open("src/components/viz/PitchOrb.test.jsx", "w") as f:
    f.write(new_content)

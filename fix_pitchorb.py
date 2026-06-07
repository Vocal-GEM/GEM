with open("src/components/viz/PitchOrb.test.jsx", "r") as f:
    c = f.read()

c = c.replace('global.ResizeObserver', 'globalThis.ResizeObserver')

with open("src/components/viz/PitchOrb.test.jsx", "w") as f:
    f.write(c)

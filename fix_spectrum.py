with open("src/components/viz/SpectrumAnalyzer.test.jsx", "r") as f:
    content = f.read()

new_content = content.replace("global.ResizeObserver", "globalThis.ResizeObserver")

with open("src/components/viz/SpectrumAnalyzer.test.jsx", "w") as f:
    f.write(new_content)

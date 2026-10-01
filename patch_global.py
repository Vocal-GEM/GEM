with open("src/components/viz/SpectrumAnalyzer.test.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'global.ResizeObserver = vi.fn(function() {' in line:
        line = line.replace('global', 'globalThis')
    new_lines.append(line)

with open("src/components/viz/SpectrumAnalyzer.test.jsx", "w") as f:
    f.writelines(new_lines)

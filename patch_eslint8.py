import re

def rep(f, o, n):
    with open(f, 'r') as file:
        c = file.read()
    with open(f, 'w') as file:
        file.write(c.replace(o, n))

rep("src/components/ui/RecommendedToolsWidget.jsx",
    "Find \"Your\" Voice", "Find &quot;Your&quot; Voice")

rep("src/components/viz/Spectrogram3D.test.jsx",
    "global.requestAnimationFrame", "globalThis.requestAnimationFrame")
rep("src/components/viz/Spectrogram3D.test.jsx",
    "global.cancelAnimationFrame", "globalThis.cancelAnimationFrame")
rep("src/components/viz/Spectrogram3D.test.jsx",
    "global.ResizeObserver", "globalThis.ResizeObserver")

rep("src/components/viz/PitchOrb.test.jsx",
    "global.requestAnimationFrame", "globalThis.requestAnimationFrame")


with open("src/components/viz/BrightnessMeter.test.jsx", "r") as file:
    content = file.read()
# Just remove the require and set display name
content = content.replace("const React = require('react');", "")
content = re.sub(r'const MockBrightnessMeter = \(\) => <div data-testid="brightness-meter" />;', 'const MockBrightnessMeter = () => <div data-testid="brightness-meter" />;\n    MockBrightnessMeter.displayName = "BrightnessMeter";', content)
with open("src/components/viz/BrightnessMeter.test.jsx", "w") as file:
    file.write(content)

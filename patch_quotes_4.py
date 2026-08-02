with open("src/components/ui/RecommendedToolsWidget.jsx", "r") as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if '"' in line and "recommendations.rationale" in line:
        lines[i] = line.replace('"', '&quot;')

content = '\n'.join(lines)

with open("src/components/ui/RecommendedToolsWidget.jsx", "w") as f:
    f.write(content)

with open("src/components/viz/PitchOrb.test.jsx", "r") as f:
    content = f.read()

content = content.replace("global.requestAnimationFrame", "globalThis.requestAnimationFrame")

with open("src/components/viz/PitchOrb.test.jsx", "w") as f:
    f.write(content)

with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    content = f.read()

content = content.replace(
    "const React = require('react');",
    "// async require for react removed, relying on standard imports instead"
).replace(
    "const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });",
    "const createIcon = (name) => { const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name }); Icon.displayName = name; return Icon; };"
).replace(
    "vi.mock('lucide-react', () => {",
    "vi.mock('lucide-react', async () => {\nconst React = await import('react');"
)

with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.write(content)

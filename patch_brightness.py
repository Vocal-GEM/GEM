with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "vi.mock('lucide-react', () => {" in line:
        line = "vi.mock('lucide-react', async () => {\n"
    elif "const React = require('react');" in line:
        line = "    const React = await import('react');\n"
    elif "const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });" in line:
        line = "    const createIcon = (name) => { const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name }); Icon.displayName = name; return Icon; };\n"
    new_lines.append(line)

with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.writelines(new_lines)

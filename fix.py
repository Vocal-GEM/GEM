import re

with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    content = f.read()

content = content.replace("vi.mock('lucide-react', () => {", "vi.mock('lucide-react', async () => {\n    const React = await import('react');")
content = content.replace("import React from 'react';", "")
content = content.replace("const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });", "const createIcon = (name) => {\n        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });\n        Icon.displayName = name;\n        return Icon;\n    };")
with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.write(content)

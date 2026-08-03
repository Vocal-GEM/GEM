with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    content = f.read()

content = content.replace("const ResizeObserver = require('resize-observer-polyfill')", "import ResizeObserver from 'resize-observer-polyfill'")

import re
content = re.sub(r"vi\.mock\('lucide-react', \(\) => \{\n\s*const React = require\('react'\);\n\s*const createIcon = \(name\) => \(props\) => React\.createElement\('div', \{ \.\.\.props, 'data-testid': name \}\);\n\n\s*return \{\n\s*Sun: createIcon\('Sun'\),\n\s*Moon: createIcon\('Moon'\),\n\s*Info: createIcon\('Info'\),\n\s*Smile: createIcon\('Smile'\)\n\s*\};\n\}\);", "vi.mock('lucide-react', () => {\n    const createIcon = (name) => { \n       const Icon = (props) => <div {...props} data-testid={name} />;\n       Icon.displayName = name;\n       return Icon;\n    };\n    return {\n        Sun: createIcon('Sun'),\n        Moon: createIcon('Moon'),\n        Info: createIcon('Info'),\n        Smile: createIcon('Smile')\n    };\n});", content)

with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.write(content)

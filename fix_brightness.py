import re
with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    content = f.read()

content = content.replace("const React = require('react');", "/* eslint-disable-next-line no-undef */\n    const React = require('react');")
content = re.sub(
    r"const createIcon = \(name\) => \(props\) => React\.createElement\('div', \{ \.\.\.props, 'data-testid': name \}\);",
    r"const createIcon = (name) => function MockIcon(props) { return React.createElement('div', { ...props, 'data-testid': name }); };",
    content
)

with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(content)

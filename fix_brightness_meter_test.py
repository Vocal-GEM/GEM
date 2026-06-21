import re

with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    content = f.read()

# Fix require
content = content.replace('require("lucide-react")', 'vi.importActual("lucide-react")')
# Fix missing display name
content = re.sub(
    r'Icon: \(\) => <div data-testid="mock-icon" />',
    r"Icon: function MockIcon() { return <div data-testid='mock-icon' />; }",
    content
)

with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(content)

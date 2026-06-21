with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    content = f.read()

content = content.replace("import React from 'react';\nvi.mock", "vi.mock")

with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(content)

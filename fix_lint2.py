import os
import re

# 1. src/services/ResearchMode.js
f = "src/services/ResearchMode.js"
if os.path.exists(f):
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace("process.env", "import.meta.env")
    with open(f, 'w') as file:
        file.write(content)

# 2. src/services/PrivacyManager.js
f = "src/services/PrivacyManager.js"
if os.path.exists(f):
    with open(f, 'r') as file:
        lines = file.readlines()

    with open(f, 'w') as file:
        for i, line in enumerate(lines):
            if i == 8 and "shareProgress: false," in line: # duplicate key
                continue
            file.write(line)

# 3. src/components/viz/SpectrumAnalyzer.test.jsx
f = "src/components/viz/SpectrumAnalyzer.test.jsx"
if os.path.exists(f):
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace("global.", "globalThis.")
    with open(f, 'w') as file:
        file.write(content)

# 4. src/components/ui/button.test.jsx
f = "src/components/ui/button.test.jsx"
if os.path.exists(f):
    with open(f, 'r') as file:
        content = file.read()
    print("button.test.jsx content:")
    print(content)

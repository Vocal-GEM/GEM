# Fix tests and some files missing React import
import re

files_to_fix = [
    ('src/components/viz/BrightnessMeter.test.jsx', "import BrightnessMeter from './BrightnessMeter';", "import React from 'react';\nimport BrightnessMeter from './BrightnessMeter';"),
]
for filepath, old, new in files_to_fix:
    try:
        with open(filepath, 'r') as file:
            content = file.read()
        content = content.replace(old, new)
        with open(filepath, 'w') as file:
            file.write(content)
    except:
        pass

import re
import os

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed {filepath}")

# 1. MicrophoneCalibration.jsx
with open("src/components/ui/MicrophoneCalibration.jsx", "r") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if '"' in line and not line.strip().startswith('<') and "className=" not in line and "id=" not in line:
        pass # need a better way. Let's just sed or replace specific lines.

# Fix global not defined in tests
import glob
import re

for filepath in glob.glob('src/**/*.test.jsx', recursive=True) + glob.glob('src/**/*.test.js', recursive=True):
    try:
        with open(filepath, 'r') as file:
            content = file.read()
        content = content.replace("global.", "globalThis.")
        with open(filepath, 'w') as file:
            file.write(content)
    except:
        pass

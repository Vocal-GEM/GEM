import os

filepath = 'src/services/ResearchMode.js'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('process.env.REACT_APP_RESEARCH_SALT', '(import.meta.env.VITE_RESEARCH_SALT || "default-salt")')

with open(filepath, 'w') as f:
    f.write(content)

import re
with open('src/services/ResearchMode.js', 'r') as f:
    data = f.read()
data = data.replace('import.meta.env.VITE_RESEARCH_SALT || ""', 'import.meta.env.VITE_RESEARCH_SALT || ""')

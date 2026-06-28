import re
with open('src/services/PrivacyManager.js', 'r') as f:
    data = f.read()
data = re.sub(r'shareProgress: false,\n\s*shareProgress: false,', r'shareProgress: false,', data)
with open('src/services/PrivacyManager.js', 'w') as f:
    f.write(data)

with open('src/services/ResearchMode.js', 'r') as f:
    data = f.read()
data = data.replace('process.env.REACT_APP_RESEARCH_SALT', 'import.meta.env.VITE_RESEARCH_SALT || ""')
with open('src/services/ResearchMode.js', 'w') as f:
    f.write(data)

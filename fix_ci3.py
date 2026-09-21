import re

# Fix ResearchMode.js
with open('src/services/ResearchMode.js', 'r') as f:
    content = f.read()
content = content.replace('process.env.REACT_APP_RESEARCH_SALT', 'import.meta.env.VITE_RESEARCH_SALT')
with open('src/services/ResearchMode.js', 'w') as f:
    f.write(content)

# Fix PrivacyManager.js
with open('src/services/PrivacyManager.js', 'r') as f:
    content = f.read()
content = content.replace('shareProgress: false,\n    shareProgress: false,', 'shareProgress: false,')
with open('src/services/PrivacyManager.js', 'w') as f:
    f.write(content)

# Fix SpectrumAnalyzer.test.jsx
with open('src/components/viz/SpectrumAnalyzer.test.jsx', 'r') as f:
    content = f.read()
content = content.replace('global.ResizeObserver', 'globalThis.ResizeObserver')
with open('src/components/viz/SpectrumAnalyzer.test.jsx', 'w') as f:
    f.write(content)

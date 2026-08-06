import os

def fix_file(path, replacements):
    with open(path, 'r') as f:
        c = f.read()
    for old, new in replacements:
        c = c.replace(old, new)
    with open(path, 'w') as f:
        f.write(c)

fix_file('src/services/PrivacyManager.js', [
    ('shareProgress: true, // Allow sharing progress with community', '')
])

fix_file('src/services/ResearchMode.js', [
    ('const isResearchModeEnabled = process.env.VITE_ENABLE_RESEARCH_MODE === \'true\';', 'const isResearchModeEnabled = import.meta.env.VITE_ENABLE_RESEARCH_MODE === \'true\';')
])

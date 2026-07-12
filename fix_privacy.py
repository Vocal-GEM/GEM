with open('src/services/PrivacyManager.js', 'r') as f:
    content = f.read()

content = content.replace("    shareProgress: false,\n    shareProgress: false,", "    shareProgress: false,")

with open('src/services/PrivacyManager.js', 'w') as f:
    f.write(content)

with open('src/services/PrivacyManager.js', 'r') as f:
    lines = f.readlines()

with open('src/services/PrivacyManager.js', 'w') as f:
    for i, line in enumerate(lines):
        if line.strip() == "shareProgress: false," and i == 8:
            continue
        f.write(line)

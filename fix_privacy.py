import sys
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("    shareProgress: false,\n    shareProgress: false,", "    shareProgress: false,\n    shareMilestones: false,")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/services/PrivacyManager.js")

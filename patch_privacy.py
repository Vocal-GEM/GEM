import os

filepath = 'src/services/PrivacyManager.js'
with open(filepath, 'r') as f:
    content = f.read()

old_block = """const DEFAULT_SETTINGS = {
    shareProgress: false,
    shareProgress: false,
    showInLeaderboards: false,
    dataRetentionDays: 90
};"""

new_block = """const DEFAULT_SETTINGS = {
    shareProgress: false,
    showInLeaderboards: false,
    dataRetentionDays: 90
};"""

content = content.replace(old_block, new_block)

with open(filepath, 'w') as f:
    f.write(content)

import re

files = [
    ("src/components/professional/ClientDashboard.jsx", [
        (130, r'<!-- Activity placeholder -->', r'')
    ]),
    ("src/components/ui/MicrophoneCalibration.jsx", [
        (300, r'&quot;Let.s start practicing&quot;', r'Let&apos;s start practicing')
    ]),
    ("src/components/ui/IntakeQuestionnaire.jsx", [
        (166, r"I.m ready to start", r'I&apos;m ready to start')
    ])
]

for file_path, replacements in files:
    with open(file_path, "r") as f:
        lines = f.readlines()

    for line_num, old_pattern, new_pattern in replacements:
        idx = line_num - 1
        lines[idx] = re.sub(old_pattern, new_pattern, lines[idx])

    with open(file_path, "w") as f:
        f.writelines(lines)

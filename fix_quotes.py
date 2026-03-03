import re

files = [
    ("src/components/ui/MicrophoneCalibration.jsx", [
        (300, r'"(.*?)"', r'&quot;\1&quot;')
    ]),
    ("src/components/ui/IntakeQuestionnaire.jsx", [
        (401, r'"(.*?)"', r'&quot;\1&quot;'),
        (166, r"'(.*?)'", r'&apos;\1&apos;')
    ]),
    ("src/components/professional/TaskRecorder.jsx", [
        (116, r'"(.*?)"', r'&quot;\1&quot;')
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

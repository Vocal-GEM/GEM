import re

files = [
    ("src/components/professional/ClientDashboard.jsx", [
        (130, r'<Activity />', r'<!-- Activity placeholder -->')
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

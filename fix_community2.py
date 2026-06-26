import sys

with open('backend/app/routes/community.py', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if line.strip() == "is_valid, error = validate_file_upload(audio_file.filename, allowed_types=['audio'])":
        skip = True
        continue

    if skip and line.strip() == "if not is_valid:":
        skip = False
        new_lines.append(line)
        continue

    if skip:
        continue

    new_lines.append(line)

with open('backend/app/routes/community.py', 'w') as f:
    f.writelines(new_lines)

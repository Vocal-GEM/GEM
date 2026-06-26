import sys

with open('backend/app/routes/community.py', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if line.strip() == "try:":
        # check if it's the messed up try block around line 122
        if i < len(lines) - 20 and "anon_filepath = anonymize_audio(filepath)" in lines[i+2]:
            new_lines.append("        audio_file.save(filepath)\n")
            new_lines.append("        try:\n")
            new_lines.append("            # Anonymize audio\n")
            new_lines.append("            anon_filepath = anonymize_audio(filepath)\n")
            new_lines.append("        finally:\n")
            new_lines.append("            # Security: Always remove the original raw audio file\n")
            new_lines.append("            if os.path.exists(filepath):\n")
            new_lines.append("                try:\n")
            new_lines.append("                    os.remove(filepath)\n")
            new_lines.append("                except Exception as e:\n")
            new_lines.append("                    current_app.logger.error(f\"Failed to delete original file: {e}\")\n")
            skip = True
            continue

    if skip:
        # find the end of the messed up try block
        if "        # Create share record" in line:
            skip = False
            new_lines.append(line)
        continue

    new_lines.append(line)

with open('backend/app/routes/community.py', 'w') as f:
    f.writelines(new_lines)

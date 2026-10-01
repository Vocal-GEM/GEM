with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'Click "Complete Profile" to generate your personalized roadmap.' in line:
        line = line.replace('Click "Complete Profile" to generate your personalized roadmap.', 'Click &quot;Complete Profile&quot; to generate your personalized roadmap.')
    elif 'My voice doesn\'t sound like "me"' in line:
        line = line.replace('My voice doesn\'t sound like "me"', 'My voice doesn&apos;t sound like &quot;me&quot;')
    new_lines.append(line)

with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f:
    f.writelines(new_lines)

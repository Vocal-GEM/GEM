with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "We only capture what's needed" in line:
        line = line.replace("We only capture what's needed", "We only capture what&apos;s needed")
    new_lines.append(line)

with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f:
    f.writelines(new_lines)

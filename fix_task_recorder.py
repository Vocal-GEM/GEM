with open("src/components/professional/TaskRecorder.jsx", "r") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if '"{task.prompt' in line:
        lines[i] = '                            &quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;\n'

with open("src/components/professional/TaskRecorder.jsx", "w") as f:
    f.writelines(lines)

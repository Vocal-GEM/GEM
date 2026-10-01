with open("src/components/professional/TaskRecorder.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if '"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"' in line:
        line = line.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')
    new_lines.append(line)

with open("src/components/professional/TaskRecorder.jsx", "w") as f:
    f.writelines(new_lines)

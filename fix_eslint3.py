with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '"{task.prompt.replace(' in line:
        lines[i] = line.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')

with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.writelines(lines)

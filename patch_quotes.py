import os

filepath = 'src/components/professional/TaskRecorder.jsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')

with open(filepath, 'w') as f:
    f.write(content)

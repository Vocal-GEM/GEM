import re

with open("src/components/professional/TaskRecorder.jsx", "r") as f:
    content = f.read()

content = content.replace(
    '"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"',
    '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;'
)

with open("src/components/professional/TaskRecorder.jsx", "w") as f:
    f.write(content)

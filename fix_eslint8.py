with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    text = f.read()

# Fix unnecessary escape
text = text.replace('&quot;{task.prompt.replace(\'Read: \\"\', \'\').replace(\'\\"\', \'\')}&quot;', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')

with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(text)

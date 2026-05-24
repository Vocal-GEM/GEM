with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    text = f.read()

# Replace the specific line causing the issue
text = text.replace('"{task.prompt.replace(\'Read: &quot;\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: \\"\', \'\').replace(\'\\"\', \'\')}&quot;')

with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(text)

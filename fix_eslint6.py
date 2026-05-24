import re

with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    text = f.read()

# Fix the quotes problem in TaskRecorder.jsx line 116
# It's currently: <p className="mt-2 text-slate-300">"{task.prompt}"</p>
# We need: <p className="mt-2 text-slate-300">&quot;{task.prompt}&quot;</p>
text = text.replace('"{task.prompt}"', '&quot;{task.prompt}&quot;')

with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(text)

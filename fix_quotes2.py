import re

file = 'src/components/professional/TaskRecorder.jsx'
with open(file, 'r') as f: content = f.read()
content = content.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')
with open(file, 'w') as f: f.write(content)

file = 'src/components/ui/MicrophoneCalibration.jsx'
with open(file, 'r') as f: content = f.read()
content = content.replace('placeholder="Say \\"Hello\\""', 'placeholder="Say &quot;Hello&quot;"')
content = content.replace('placeholder=\'Say "Hello"\'', 'placeholder="Say &quot;Hello&quot;"')
with open(file, 'w') as f: f.write(content)

file = 'src/components/ui/IntakeQuestionnaire.jsx'
with open(file, 'r') as f: content = f.read()
content = content.replace('placeholder="e.g., \\"My voice sounds too...\\""', 'placeholder="e.g., &quot;My voice sounds too...&quot;"')
content = content.replace('placeholder=\'e.g., "My voice sounds too..."\'', 'placeholder="e.g., &quot;My voice sounds too...&quot;"')
with open(file, 'w') as f: f.write(content)

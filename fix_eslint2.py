import os
import re

files_with_quotes = [
    'src/components/ui/MicrophoneCalibration.jsx',
    'src/components/ui/IntakeQuestionnaire.jsx',
    'src/components/professional/TaskRecorder.jsx',
]

for file_path in files_with_quotes:
    with open(file_path, 'r') as f:
        content = f.read()
    content = content.replace("'", "&apos;").replace('"', '&quot;')
    with open(file_path, 'w') as f:
        f.write(content)

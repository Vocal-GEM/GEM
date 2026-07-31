import re

files_with_quotes = [
    'src/components/ui/MicrophoneCalibration.jsx',
    'src/components/ui/IntakeQuestionnaire.jsx',
    'src/components/professional/TaskRecorder.jsx',
]

for file_path in files_with_quotes:
    with open(file_path, 'r') as f:
        content = f.read()

    content = content.replace("what's", "what&apos;s")
    content = content.replace('Say "Ahhhh"', 'Say &quot;Ahhhh&quot;')
    content = content.replace('e.g., "Hi, how are you?"', 'e.g., &quot;Hi, how are you?&quot;')
    content = content.replace('A quick "hello"', 'A quick &quot;hello&quot;')

    with open(file_path, 'w') as f:
        f.write(content)

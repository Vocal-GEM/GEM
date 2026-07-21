import re

files_to_fix = [
    'src/components/ui/IntakeQuestionnaire.jsx',
    'src/components/professional/TaskRecorder.jsx',
    'src/components/ui/MicrophoneCalibration.jsx',
    'src/components/ui/VoiceQualityMeter.jsx'
]

for file in files_to_fix:
    try:
        with open(file, 'r') as f:
            content = f.read()

        content = content.replace('placeholder="e.g., \\"My voice sounds too...\\""', 'placeholder="e.g., &quot;My voice sounds too...&quot;"')
        content = content.replace('placeholder=\'e.g., "My voice sounds too..."\'', 'placeholder="e.g., &quot;My voice sounds too...&quot;"')
        content = content.replace('Say "Ah"', 'Say &quot;Ah&quot;')
        content = content.replace('Say \\"Ah\\"', 'Say &quot;Ah&quot;')
        content = content.replace('Say "Hello"', 'Say &quot;Hello&quot;')
        content = content.replace('Say \\"Hello\\"', 'Say &quot;Hello&quot;')

        with open(file, 'w') as f:
            f.write(content)
    except FileNotFoundError:
        pass

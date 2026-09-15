import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Generic replace for quotes inside JSX text
    # This might match too much, so we target specific files

    if 'TaskRecorder.jsx' in filepath:
        content = re.sub(r'"{task.prompt.replace\(\'Read: "\', \'\'\).replace\(\'"\', \'\'\)}"', r'&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;', content)
        content = content.replace("Example: \"Call to schedule a doctor's appointment\"", "Example: &quot;Call to schedule a doctor&apos;s appointment&quot;")

    if 'IntakeQuestionnaire.jsx' in filepath:
        content = content.replace("voice's", "voice&apos;s")
        content = content.replace('"Me"', "&quot;Me&quot;")
        content = content.replace('"Complete Profile"', "&quot;Complete Profile&quot;")

    if 'MicrophoneCalibration.jsx' in filepath:
        content = content.replace('"normal"', "&quot;normal&quot;")
        content = content.replace('"Ahhhh"', "&quot;Ahhhh&quot;")

    if 'RecommendedToolsWidget.jsx' in filepath:
        content = content.replace('"Pitch Perfect"', "&quot;Pitch Perfect&quot;")
        content = content.replace('"Resonance"', "&quot;Resonance&quot;")
        content = re.sub(r'"{recommendations.rationale.split\(\'\.\'\)\[0\]}\."', r'&quot;{recommendations.rationale.split(\'.\')[0]}.&quot;', content)

    with open(filepath, 'w') as f:
        f.write(content)


files = [
    'src/components/professional/TaskRecorder.jsx',
    'src/components/ui/IntakeQuestionnaire.jsx',
    'src/components/ui/MicrophoneCalibration.jsx',
    'src/components/ui/RecommendedToolsWidget.jsx'
]

for file in files:
    fix_file(file)

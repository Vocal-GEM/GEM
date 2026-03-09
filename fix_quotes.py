import re
import os

files = [
    "src/components/ui/MicrophoneCalibration.jsx",
    "src/components/ui/IntakeQuestionnaire.jsx",
    "src/components/professional/TaskRecorder.jsx"
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Manual fixes for the known issues
    if file == "src/components/ui/MicrophoneCalibration.jsx":
        content = content.replace('Speak clearly saying "Aah" for 3 seconds.', 'Speak clearly saying &quot;Aah&quot; for 3 seconds.')
    elif file == "src/components/ui/IntakeQuestionnaire.jsx":
        content = content.replace("I'm comfortable", "I&apos;m comfortable")
        content = content.replace("I'm somewhat comfortable", "I&apos;m somewhat comfortable")
        content = content.replace("I'm not comfortable", "I&apos;m not comfortable")
        content = content.replace('Rate your "everyday" voice', 'Rate your &quot;everyday&quot; voice')
    elif file == "src/components/professional/TaskRecorder.jsx":
        content = content.replace('Please read "The Rainbow Passage"', 'Please read &quot;The Rainbow Passage&quot;')
        content = content.replace('Hold the vowel "Ah" for as long as possible', 'Hold the vowel &quot;Ah&quot; for as long as possible')

    with open(file, 'w') as f:
        f.write(content)

import sys

def fix_intake(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("what's needed to help", "what&apos;s needed to help")
    content = content.replace('Click "Complete Profile" to', 'Click &quot;Complete Profile&quot; to')

    with open(filepath, 'w') as f:
        f.write(content)

def fix_mic(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace('Say "Ahhhh" or count', 'Say &quot;Ahhhh&quot; or count')

    with open(filepath, 'w') as f:
        f.write(content)

def fix_task(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace('"{task.prompt.replace(', '&quot;{task.prompt.replace(')
    content = content.replace(')"}"', ')&quot;}')
    content = content.replace(')"}\n                        </div>', ')&quot;}\n                        </div>')

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_intake("src/components/ui/IntakeQuestionnaire.jsx")
    fix_mic("src/components/ui/MicrophoneCalibration.jsx")
    fix_task("src/components/professional/TaskRecorder.jsx")

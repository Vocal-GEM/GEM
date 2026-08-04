import sys

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

def fix_dashboard():
    filepath = "src/components/professional/ClientDashboard.jsx"
    with open(filepath, 'r') as f:
        content = f.read()

    # Add Activity import
    if "Activity" not in content[:content.find("const ClientDashboard")]:
        content = content.replace("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")

    with open(filepath, 'w') as f:
        f.write(content)

def fix_worklet():
    filepath = "src/audio/PitchWorklet.js"
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("const startTime = currentTime;", "const startTime = globalThis.currentTime;")
    content = content.replace("const processingTime = (currentTime - startTime) * 1000;", "const processingTime = (globalThis.currentTime - startTime) * 1000;")
    content = content.replace("timestamp: currentTime,", "timestamp: globalThis.currentTime,")

    with open(filepath, 'w') as f:
        f.write(content)

def fix_intake(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("what's needed to help", "what&apos;s needed to help")
    content = content.replace('Click "Complete Profile" to', 'Click &quot;Complete Profile&quot; to')

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_mic("src/components/ui/MicrophoneCalibration.jsx")
    fix_task("src/components/professional/TaskRecorder.jsx")
    fix_dashboard()
    fix_worklet()
    fix_intake("src/components/ui/IntakeQuestionnaire.jsx")

import re

def modify_file(filepath, callback):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        new_content = callback(content)
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Failed to fix {filepath}: {e}")

# 1. src/components/ui/MicrophoneCalibration.jsx
modify_file("src/components/ui/MicrophoneCalibration.jsx", lambda c: c.replace(
    'Say "Ahhhh" or count to 5... ({countdown}s)',
    'Say &quot;Ahhhh&quot; or count to 5... ({countdown}s)'
))

# 2. src/components/ui/IntakeQuestionnaire.jsx
modify_file("src/components/ui/IntakeQuestionnaire.jsx", lambda c: c.replace(
    '🔒 Your data is stored locally and private to you. We only capture what\'s needed to help you find your voice.',
    '🔒 Your data is stored locally and private to you. We only capture what&apos;s needed to help you find your voice.'
).replace(
    'Click "Complete Profile" to generate your personalized roadmap.',
    'Click &quot;Complete Profile&quot; to generate your personalized roadmap.'
))

# 3. src/components/professional/TaskRecorder.jsx
modify_file("src/components/professional/TaskRecorder.jsx", lambda c: c.replace(
    '"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"',
    '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;'
))

# 4. src/components/professional/ClientDashboard.jsx
# Adding import Activity from 'lucide-react'
def fix_client_dashboard(content):
    if "import { Activity" not in content and "Activity," not in content and "Activity }" not in content:
        content = content.replace("import { Users, TrendingUp", "import { Users, TrendingUp, Activity")
    return content
modify_file("src/components/professional/ClientDashboard.jsx", fix_client_dashboard)

# 5. src/audio/PitchWorklet.js
def fix_pitch_worklet(content):
    if "/* global currentTime */" not in content:
        content = "/* global currentTime */\n" + content
    return content
modify_file("src/audio/PitchWorklet.js", fix_pitch_worklet)

# 6. src/components/viz/BreathinessMeter.jsx
def fix_breathiness(content):
    lines = content.split('\n')
    new_lines = []
    seen = False
    for line in lines:
        if "import { renderCoordinator } from '../../services/RenderCoordinator';" in line:
            if not seen:
                seen = True
                new_lines.append(line)
        else:
            new_lines.append(line)
    return '\n'.join(new_lines)
modify_file("src/components/viz/BreathinessMeter.jsx", fix_breathiness)

# 7. src/components/viz/HighResSpectrogram.jsx
# Need to see context of componentId

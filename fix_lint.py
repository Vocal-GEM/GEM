import re
import os

# Fix PitchWorklet.js
f = 'src/audio/PitchWorklet.js'
with open(f, 'r') as file:
    content = file.read()
content = content.replace('const startTime = currentTime;', 'const startTime = globalThis.currentTime || 0;')
content = content.replace('const processingTime = (currentTime - startTime) * 1000;', 'const processingTime = ((globalThis.currentTime || 0) - startTime) * 1000;')
content = content.replace('timestamp: currentTime,', 'timestamp: globalThis.currentTime || 0,')
content = content.replace('process(inputs, outputs, parameters)', 'process(inputs, _outputs, _parameters)')
with open(f, 'w') as file:
    file.write(content)

# Fix ClientDashboard.jsx
f = 'src/components/professional/ClientDashboard.jsx'
with open(f, 'r') as file:
    content = file.read()
content = content.replace("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")
with open(f, 'w') as file:
    file.write(content)

# Fix MicrophoneCalibration.jsx
f = 'src/components/ui/MicrophoneCalibration.jsx'
with open(f, 'r') as file:
    content = file.read()
content = content.replace('Say "Ahhhh" or count to 5...', 'Say &quot;Ahhhh&quot; or count to 5...')
with open(f, 'w') as file:
    file.write(content)

# Fix IntakeQuestionnaire.jsx
f = 'src/components/ui/IntakeQuestionnaire.jsx'
with open(f, 'r') as file:
    content = file.read()
content = content.replace('Click "Complete Profile"', 'Click &quot;Complete Profile&quot;')
content = content.replace("We only capture what's needed", "We only capture what&apos;s needed")
with open(f, 'w') as file:
    file.write(content)

# Fix TaskRecorder.jsx
f = 'src/components/professional/TaskRecorder.jsx'
with open(f, 'r') as file:
    content = file.read()
content = content.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: &quot;\', \'\').replace(\'&quot;\', \'\')}&quot;')
with open(f, 'w') as file:
    file.write(content)

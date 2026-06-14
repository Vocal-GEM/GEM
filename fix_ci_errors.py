import re
import os

# 1. src/components/ui/MicrophoneCalibration.jsx
with open('src/components/ui/MicrophoneCalibration.jsx', 'r') as f:
    content = f.read()
content = content.replace('className="text-slate-300">Click "Start Calibration" and follow the prompts.</span>', 'className="text-slate-300">Click &quot;Start Calibration&quot; and follow the prompts.</span>')
with open('src/components/ui/MicrophoneCalibration.jsx', 'w') as f:
    f.write(content)

# 2. src/components/ui/IntakeQuestionnaire.jsx
with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    content = f.read()
content = content.replace('I can\'t project my voice', 'I can&apos;t project my voice')
content = content.replace('className="text-center">"Ah" (comfortable pitch)</div>', 'className="text-center">&quot;Ah&quot; (comfortable pitch)</div>')
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(content)

# 3. src/components/professional/TaskRecorder.jsx
with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    content = f.read()
content = content.replace('Record yourself saying "Ah" at a comfortable pitch for as long as possible.', 'Record yourself saying &quot;Ah&quot; at a comfortable pitch for as long as possible.')
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(content)

# 4. src/components/professional/ClientDashboard.jsx
with open('src/components/professional/ClientDashboard.jsx', 'r') as f:
    content = f.read()
if 'import { Activity' not in content:
    content = content.replace('import { Users, UserPlus, Settings, FileText, ChevronRight, MessageSquare, TrendingUp, Mic, Calendar, Target, Award } from \'lucide-react\';', 'import { Users, UserPlus, Settings, FileText, ChevronRight, MessageSquare, TrendingUp, Mic, Calendar, Target, Award, Activity } from \'lucide-react\';')
with open('src/components/professional/ClientDashboard.jsx', 'w') as f:
    f.write(content)

# 5. src/audio/PitchWorklet.js
with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()
content = content.replace('currentTime', 'globalThis.currentTime || 0')
with open('src/audio/PitchWorklet.js', 'w') as f:
    f.write(content)

print("Files patched.")

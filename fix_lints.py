import re

def patch(file_path, replacements):
    with open(file_path, 'r') as f:
        content = f.read()

    for target, replacement in replacements:
        content = content.replace(target, replacement)

    with open(file_path, 'w') as f:
        f.write(content)

# 1. src/components/ui/MicrophoneCalibration.jsx
patch('src/components/ui/MicrophoneCalibration.jsx', [
    ('className="font-medium text-slate-300">"Check, check, one, two, three"</span>', 'className="font-medium text-slate-300">&quot;Check, check, one, two, three&quot;</span>')
])

# 2. src/components/ui/IntakeQuestionnaire.jsx
patch('src/components/ui/IntakeQuestionnaire.jsx', [
    ('I don\'t know', 'I don&apos;t know'),
    ('className="text-white">"I am starting voice training because..."</p>', 'className="text-white">&quot;I am starting voice training because...&quot;</p>')
])

# 3. src/components/professional/TaskRecorder.jsx
patch('src/components/professional/TaskRecorder.jsx', [
    ('Please read the following passage:<br/>"The rainbow is a division of white light into many beautiful colors..."', 'Please read the following passage:<br/>&quot;The rainbow is a division of white light into many beautiful colors...&quot;')
])

# 4. src/components/professional/ClientDashboard.jsx
patch('src/components/professional/ClientDashboard.jsx', [
    ('import { Users, UserPlus, Settings, FileText, Search, Play, MoreVertical } from \'lucide-react\';', 'import { Users, UserPlus, Settings, FileText, Search, Play, MoreVertical, Activity } from \'lucide-react\';')
])

# 5. src/audio/PitchWorklet.js
patch('src/audio/PitchWorklet.js', [
    ('currentTime - this.lastReportTime', 'globalThis.currentTime - this.lastReportTime'),
    ('this.lastReportTime = currentTime', 'this.lastReportTime = globalThis.currentTime')
])

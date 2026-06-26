import re

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/audio/PitchWorklet.js', [
    ('timestamp: currentTime', 'timestamp: globalThis.currentTime')
])

fix_file('src/components/professional/ClientDashboard.jsx', [
    ('import { \n    Users, Calendar, FileText, \n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';', 'import { \n    Users, Calendar, FileText, Activity,\n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';')
])

fix_file('src/components/professional/TaskRecorder.jsx', [
    ('"The rainbow is a division of white light into many beautiful colors."', '&quot;The rainbow is a division of white light into many beautiful colors.&quot;')
])

fix_file('src/components/ui/IntakeQuestionnaire.jsx', [
    ("assumed 'masculine'", "assumed &apos;masculine&apos;"),
    ('e.g. "Hi, I\'d like to schedule an appointment."', 'e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;'),
    ('placeholder="e.g. &quot;Hi, I\'d like to schedule an appointment.&quot;"', 'placeholder="e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;"')
])

print("Fixed")

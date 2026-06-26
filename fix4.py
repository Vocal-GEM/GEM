import re

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/audio/PitchWorklet.js', [
    ('const startTime = currentTime;', 'const startTime = globalThis.currentTime;'),
    ('const processingTime = (currentTime - startTime) * 1000;', 'const processingTime = (globalThis.currentTime - startTime) * 1000;')
])

fix_file('src/components/professional/ClientDashboard.jsx', [
    ('import {\n    Users, Calendar, FileText,\n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';', 'import {\n    Users, Calendar, FileText, Activity,\n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';'),
    ('import { \n    Users, Calendar, FileText, \n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';', 'import { \n    Users, Calendar, FileText, Activity,\n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';')
])

with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    tr = f.read()
    tr = tr.replace('"The rainbow is a division of white light into many beautiful colors."', '&quot;The rainbow is a division of white light into many beautiful colors.&quot;')
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(tr)

with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    iq = f.read()
    iq = iq.replace('assumed \'masculine\'', 'assumed &apos;masculine&apos;')
    iq = iq.replace('e.g. "Hi, I\'d like to schedule an appointment."', 'e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;')
    iq = iq.replace('placeholder="e.g. &quot;Hi, I\'d like to schedule an appointment.&quot;"', 'placeholder="e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;"')
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(iq)


print("Fixed 4")

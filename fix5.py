import re

with open('src/components/professional/ClientDashboard.jsx', 'r') as f:
    cd = f.read()
    cd = re.sub(r'import\s*\{\s*Users,\s*Calendar,\s*FileText,\s*TrendingUp,\s*Clock,\s*AlertCircle,\s*ChevronRight,\s*Search,\s*Filter,\s*Plus,\s*Mic,\s*Settings,\s*UserPlus\s*\}\s*from\s*\'lucide-react\';',
                "import {\n    Users, Calendar, FileText, Activity,\n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from 'lucide-react';", cd)
with open('src/components/professional/ClientDashboard.jsx', 'w') as f:
    f.write(cd)

with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    tr = f.read()
    tr = tr.replace('>"The rainbow is a division of white light into many beautiful colors."<', '>&quot;The rainbow is a division of white light into many beautiful colors.&quot;<')
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(tr)

with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    iq = f.read()
    iq = iq.replace('assumed \'masculine\'', 'assumed &apos;masculine&apos;')
    iq = iq.replace('e.g. "Hi, I\'d like to schedule an appointment."', 'e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;')
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(iq)

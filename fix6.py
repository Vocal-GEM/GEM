with open('src/components/professional/ClientDashboard.jsx', 'r') as f:
    cd = f.read()
    cd = cd.replace("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")
with open('src/components/professional/ClientDashboard.jsx', 'w') as f:
    f.write(cd)

with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    tr = f.read()
    tr = tr.replace('"The rainbow is a division of white light into many beautiful colors."', '&quot;The rainbow is a division of white light into many beautiful colors.&quot;')
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(tr)

with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    iq = f.read()
    iq = iq.replace('assumed \'masculine\'', 'assumed &apos;masculine&apos;')
    iq = iq.replace('showToast("Open Quotient goal updated (Advanced)", "info");', 'showToast(&quot;Open Quotient goal updated (Advanced)&quot;, &quot;info&quot;);')
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(iq)

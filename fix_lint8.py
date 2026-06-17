with open('src/components/professional/ClientDashboard.jsx', 'r') as file:
    content = file.read()
# Replace Activity import with empty if it's unused, or just ignore it.
content = content.replace("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")

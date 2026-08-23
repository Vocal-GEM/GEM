with open("src/components/professional/ClientDashboard.jsx", "r") as f:
    content = f.read()

content = content.replace("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")

with open("src/components/professional/ClientDashboard.jsx", "w") as f:
    f.write(content)

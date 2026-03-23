const fs = require('fs');
let content = fs.readFileSync('src/components/professional/ClientDashboard.jsx', 'utf8');

// Add Activity to lucide-react imports
content = content.replace("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';");

fs.writeFileSync('src/components/professional/ClientDashboard.jsx', content);

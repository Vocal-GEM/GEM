const fs = require('fs');
const file = 'src/components/professional/ClientDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';`,
`import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';`
);
fs.writeFileSync(file, content);

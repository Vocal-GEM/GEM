const fs = require('fs');
let filepath = 'src/components/viz/BreathinessMeter.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
    "import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';\nimport { renderCoordinator } from '../../services/RenderCoordinator';",
    "import { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';\nimport { renderCoordinator } from '../../services/RenderCoordinator';"
);

fs.writeFileSync(filepath, content);
console.log('BreathinessMeter.jsx patched.');

const fs = require('fs');
const file = 'src/components/ui/IntakeQuestionnaire.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`            Click "Complete Profile" to generate your personalized roadmap.`,
`            Click &quot;Complete Profile&quot; to generate your personalized roadmap.`
);
content = content.replace(
`                🔒 Your data is stored locally and private to you. We only capture what's needed to help you find your voice.`,
`                🔒 Your data is stored locally and private to you. We only capture what&apos;s needed to help you find your voice.`
);
fs.writeFileSync(file, content);

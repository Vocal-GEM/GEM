const fs = require('fs');
const file = 'src/services/PrivacyManager.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`const DEFAULT_SETTINGS = {
    shareProgress: false,
    shareProgress: false,
    showInLeaderboards: false,
    dataRetentionDays: 90
};`,
`const DEFAULT_SETTINGS = {
    shareProgress: false,
    shareMilestones: false,
    showInLeaderboards: false,
    dataRetentionDays: 90
};`
);
fs.writeFileSync(file, content);

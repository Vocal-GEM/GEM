const fs = require('fs');
const file = 'src/components/ui/MicrophoneCalibration.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`Say "Ahhhh" or count to 5...`,
`Say &quot;Ahhhh&quot; or count to 5...`
);
fs.writeFileSync(file, content);

const fs = require('fs');

function replaceAll(file, search, replace) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

// 1. MicrophoneCalibration.jsx
replaceAll('src/components/ui/MicrophoneCalibration.jsx', 'Say "Ahhhh" or count to 5...', 'Say &quot;Ahhhh&quot; or count to 5...');

// 2. IntakeQuestionnaire.jsx
replaceAll('src/components/ui/IntakeQuestionnaire.jsx', "we only capture what's needed", "we only capture what&apos;s needed");
replaceAll('src/components/ui/IntakeQuestionnaire.jsx', 'We only capture what\'s needed', 'We only capture what&apos;s needed');
replaceAll('src/components/ui/IntakeQuestionnaire.jsx', 'Click "Complete Profile" to generate', 'Click &quot;Complete Profile&quot; to generate');

// 3. TaskRecorder.jsx
replaceAll('src/components/professional/TaskRecorder.jsx', '"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;');

// 4. ClientDashboard.jsx
replaceAll('src/components/professional/ClientDashboard.jsx', 'import { Play, User, MoreVertical, MapPin, Calendar, Clock, Video, Brain, MessageSquare } from \'lucide-react\';', 'import { Play, User, MoreVertical, MapPin, Calendar, Clock, Video, Brain, MessageSquare, Activity } from \'lucide-react\';');

// 5. PitchWorklet.js
replaceAll('src/audio/PitchWorklet.js', 'const startTime = currentTime;', 'const startTime = globalThis.currentTime;');
replaceAll('src/audio/PitchWorklet.js', 'const processingTime = (currentTime - startTime) * 1000;', 'const processingTime = (globalThis.currentTime - startTime) * 1000;');
replaceAll('src/audio/PitchWorklet.js', 'timestamp: currentTime,', 'timestamp: globalThis.currentTime,');

// 6. PrivacyManager.js
replaceAll('src/services/PrivacyManager.js', `    shareProgress: false,
    shareProgress: false,`, `    shareProgress: false,`);

// 7. ResearchMode.js
replaceAll('src/services/ResearchMode.js', 'process.env.REACT_APP_RESEARCH_SALT', 'import.meta.env.VITE_RESEARCH_SALT');

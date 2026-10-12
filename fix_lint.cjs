const fs = require('fs');

function replaceInFile(filePath, searchRegex, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(searchRegex, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

// src/components/ui/MicrophoneCalibration.jsx
replaceInFile('src/components/ui/MicrophoneCalibration.jsx', /Say "Ahhhh" or count to 5\.\.\./g, 'Say &quot;Ahhhh&quot; or count to 5...');

// src/components/ui/IntakeQuestionnaire.jsx
replaceInFile('src/components/ui/IntakeQuestionnaire.jsx', /Click "Complete Profile" to generate your personalized roadmap\./g, 'Click &quot;Complete Profile&quot; to generate your personalized roadmap.');
replaceInFile('src/components/ui/IntakeQuestionnaire.jsx', /We only capture what's needed/g, 'We only capture what&apos;s needed');

// src/components/professional/TaskRecorder.jsx
replaceInFile('src/components/professional/TaskRecorder.jsx', /"\{task\.prompt\.replace/g, '&quot;{task.prompt.replace');
replaceInFile('src/components/professional/TaskRecorder.jsx', /"\}/g, '&quot;}');

// src/components/professional/ClientDashboard.jsx
replaceInFile('src/components/professional/ClientDashboard.jsx', /import { \w+, \w+, \w+, \w+, \w+, \w+, \w+, \w+, \w+ } from 'lucide-react';/, (match) => {
    return match.replace(/\} from 'lucide-react'/, ', Activity } from \'lucide-react\'');
});

// src/audio/PitchWorklet.js
replaceInFile('src/audio/PitchWorklet.js', /const startTime = currentTime;/g, 'const startTime = globalThis.currentTime;');
replaceInFile('src/audio/PitchWorklet.js', /const processingTime = \(currentTime - startTime\)/g, 'const processingTime = (globalThis.currentTime - startTime)');
replaceInFile('src/audio/PitchWorklet.js', /timestamp: currentTime/g, 'timestamp: globalThis.currentTime');

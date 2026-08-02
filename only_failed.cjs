const fs = require('fs');

function replaceInFile(filepath, searchRegex, replacement) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(searchRegex, replacement);
    fs.writeFileSync(filepath, content);
}

replaceInFile('src/components/ui/MicrophoneCalibration.jsx',
    /Say "Ahhhh" or count to 5\.\.\./g,
    'Say &quot;Ahhhh&quot; or count to 5...');

replaceInFile('src/components/ui/IntakeQuestionnaire.jsx',
    /"Is my voice too breathy\?"/g,
    '&quot;Is my voice too breathy?&quot;');
replaceInFile('src/components/ui/IntakeQuestionnaire.jsx',
    /"Do I sound natural\?"/g,
    '&quot;Do I sound natural?&quot;');
replaceInFile('src/components/ui/IntakeQuestionnaire.jsx',
    /what's needed/g,
    'what&apos;s needed');

replaceInFile('src/components/professional/TaskRecorder.jsx',
    /Say "Ahhhh" or read a short passage\./g,
    'Say &quot;Ahhhh&quot; or read a short passage.');

replaceInFile('src/components/professional/ClientDashboard.jsx',
    /import \{ Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical \} from 'lucide-react';/,
    "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';");

replaceInFile('src/audio/PitchWorklet.js',
    /const startTime = currentTime;/g,
    "const startTime = globalThis.currentTime;");
replaceInFile('src/audio/PitchWorklet.js',
    /const processingTime = \(currentTime - startTime\) \* 1000;/g,
    "const processingTime = (globalThis.currentTime - startTime) * 1000;");
replaceInFile('src/audio/PitchWorklet.js',
    /timestamp: currentTime,/g,
    "timestamp: globalThis.currentTime,");

const fs = require('fs');

function replaceFile(path, fromStr, toStr) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    const result = data.replace(fromStr, toStr);
    fs.writeFileSync(path, result, 'utf8');
  } catch(e) {}
}

replaceFile('src/components/ui/MicrophoneCalibration.jsx', 'Say "Ahhhh" or count to 5', 'Say &quot;Ahhhh&quot; or count to 5');
replaceFile('src/components/ui/IntakeQuestionnaire.jsx', 'e.g., "I want to sound more feminine"', 'e.g., &quot;I want to sound more feminine&quot;');
replaceFile('src/components/ui/IntakeQuestionnaire.jsx', "Don't know", "Don&apos;t know");
replaceFile('src/components/professional/TaskRecorder.jsx', 'Read the "Rainbow Passage"', 'Read the &quot;Rainbow Passage&quot;');
replaceFile('src/components/professional/ClientDashboard.jsx', 'import { Play, Calendar, Star, Clock, Trophy }', 'import { Play, Calendar, Star, Clock, Trophy, Activity }');

replaceFile('src/audio/PitchWorklet.js', 'currentTime', 'globalThis.currentTime');

replaceFile('src/components/viz/BrightnessMeter.test.jsx', 'require', 'await importOriginal()');

// Remove duplicate shareProgress in PrivacyManager
let pm = fs.readFileSync('src/services/PrivacyManager.js', 'utf8');
pm = pm.replace(/shareProgress: true,\n        shareProgress: true,/, 'shareProgress: true,');
fs.writeFileSync('src/services/PrivacyManager.js', pm, 'utf8');

// ResearchMode.js replace process with import.meta.env
let rm = fs.readFileSync('src/services/ResearchMode.js', 'utf8');
rm = rm.replace(/process\.env\.NODE_ENV/, 'import.meta.env.MODE');
fs.writeFileSync('src/services/ResearchMode.js', rm, 'utf8');

console.log("fixes applied");

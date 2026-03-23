const fs = require('fs');

function replaceFile(path, search, replace) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(path, content);
}

replaceFile('src/components/professional/TaskRecorder.jsx', '"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;');

replaceFile('src/components/ui/IntakeQuestionnaire.jsx', 'capture what\'s needed', 'capture what&apos;s needed');

replaceFile('src/components/ui/IntakeQuestionnaire.jsx', 'Click "Complete Profile"', 'Click &quot;Complete Profile&quot;');

replaceFile('src/components/ui/MicrophoneCalibration.jsx', 'Say "Ahhhh" or count', 'Say &quot;Ahhhh&quot; or count');

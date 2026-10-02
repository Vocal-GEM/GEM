const fs = require('fs');
let content = fs.readFileSync('src/components/professional/TaskRecorder.jsx', 'utf8');
content = content.replace(/"\{task.prompt.replace\('Read: "', ''\).replace\('"', ''\)\}"/g, '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;');
fs.writeFileSync('src/components/professional/TaskRecorder.jsx', content);

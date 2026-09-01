const fs = require('fs');

const filePath = 'src/components/professional/TaskRecorder.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    /\"\{task\.prompt\.replace\('Read: \"', ''\)\.replace\('\"', ''\)\}\"/g,
    '&quot;{task.prompt.replace(\'Read: \"\', \'\').replace(\'\"\', \'\')}&quot;'
);

fs.writeFileSync(filePath, content);

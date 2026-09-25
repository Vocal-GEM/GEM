const fs = require('fs');
const file = 'src/services/ResearchMode.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`const salt = this.studyId + process.env.REACT_APP_RESEARCH_SALT;`,
`const salt = this.studyId + import.meta.env.VITE_RESEARCH_SALT;`
);
fs.writeFileSync(file, content);

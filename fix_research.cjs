const fs = require('fs');
let content = fs.readFileSync('src/services/ResearchMode.js', 'utf8');

// Replace process.env.REACT_APP_RESEARCH_SALT
content = content.replace(
    /process\.env\.REACT_APP_RESEARCH_SALT/g,
    "(typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_RESEARCH_SALT : 'default_salt')"
);

fs.writeFileSync('src/services/ResearchMode.js', content);

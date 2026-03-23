const fs = require('fs');
let content = fs.readFileSync('src/services/PrivacyManager.js', 'utf8');

content = content.replace(/shareProgress: false,\s*shareProgress: false,/g, 'shareProgress: false,');

fs.writeFileSync('src/services/PrivacyManager.js', content);

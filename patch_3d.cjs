const fs = require('fs');
const file = 'src/components/viz/Spectrogram3D.test.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/global\./g, 'globalThis.');
fs.writeFileSync(file, content);

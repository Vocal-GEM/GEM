const fs = require('fs');
let filepath = 'src/components/viz/PitchOrb.test.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/global\.requestAnimationFrame/g, 'globalThis.requestAnimationFrame');

fs.writeFileSync(filepath, content);
console.log('PitchOrb.test.jsx patched.');

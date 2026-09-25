const fs = require('fs');
const file = 'src/components/viz/PitchOrb.test.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`global.requestAnimationFrame = mockRequestAnimationFrame;`,
`globalThis.requestAnimationFrame = mockRequestAnimationFrame;`
);
fs.writeFileSync(file, content);

const fs = require('fs');
let filepath = 'src/components/viz/Spectrogram3D.test.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/global\.mockUseFrameCallback/g, 'globalThis.mockUseFrameCallback');
content = content.replace(/global\.requestAnimationFrame/g, 'globalThis.requestAnimationFrame');

fs.writeFileSync(filepath, content);
console.log('Spectrogram3D.test.jsx patched.');

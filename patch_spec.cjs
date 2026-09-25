const fs = require('fs');
const file = 'src/components/viz/SpectrumAnalyzer.test.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/global\.ResizeObserver/g, 'globalThis.ResizeObserver');
fs.writeFileSync(file, content);

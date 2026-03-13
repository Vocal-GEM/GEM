const fs = require('fs');
let filepath = 'src/components/viz/SpectrumAnalyzer.test.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/global\.ResizeObserver/g, 'globalThis.ResizeObserver');

fs.writeFileSync(filepath, content);
console.log('SpectrumAnalyzer.test.jsx patched.');

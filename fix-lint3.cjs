const fs = require('fs');

// BrightnessMeter.test.jsx
let f = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
f = f.replace(/const React = import\('react'\);/g, "const React = await import('react');");
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', f);

const fs = require('fs');

let f = fs.readFileSync('src/components/viz/HighResSpectrogram.jsx', 'utf8');
f = f.replace(/    \}, \[draw, componentId\]\);\n    \}, \[componentId, draw\]\);/, '    }, [componentId, draw]);');
fs.writeFileSync('src/components/viz/HighResSpectrogram.jsx', f, 'utf8');

console.log("fixes applied");

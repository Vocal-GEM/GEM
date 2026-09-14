const fs = require('fs');

let bm = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
bm = bm.replace(/vi\.mock\('lucide-react', \(\) => {/g, "vi.mock('lucide-react', async () => {");
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', bm, 'utf8');

let pm = fs.readFileSync('src/services/PrivacyManager.js', 'utf8');
pm = pm.replace(/shareProgress: true,\n        shareProgress: true,/g, 'shareProgress: true,');
fs.writeFileSync('src/services/PrivacyManager.js', pm, 'utf8');

let qv = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
qv = qv.replace(/};\n\n    };\n\n    const drawLPC/g, '};\n\n    const drawLPC');
qv = qv.replace(/        }\n\n    };\n\n    useEffect\(/g, '        }\n\n    useEffect(');
qv = qv.replace(/        }\n\n    }\n\n    useEffect\(/g, '        }\n\n    useEffect(');
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', qv, 'utf8');

console.log("fixes applied");

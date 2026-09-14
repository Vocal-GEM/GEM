const fs = require('fs');

let qv = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
qv = qv.replace(/};\n\n    const drawLPC/, '    const drawLPC');
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', qv, 'utf8');

let stm = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');
stm = stm.replace(/    };\n\n    return \(/, '    return (');
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', stm, 'utf8');

console.log("fixes applied");

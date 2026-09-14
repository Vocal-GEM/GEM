const fs = require('fs');

let qw = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
qw = qw.replace(/};\n\n    const drawLPC/, '    };\n\n    const drawLPC');
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', qw, 'utf8');

let stm2 = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');
stm2 = stm2.replace(/};\n\n    return \(/, '    };\n\n    return (');
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', stm2, 'utf8');

console.log("fixes applied");

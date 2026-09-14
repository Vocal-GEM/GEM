const fs = require('fs');

let f = fs.readFileSync('src/components/viz/HighResSpectrogram.jsx', 'utf8');
f = f.replace(/const componentId = useId\(\);\n\n    \/\/ Unique component ID for RenderCoordinator/, 'const componentId = useId();');
f = f.replace(/const uniqueId = useId\(\);\n    const componentId = `spectrogram-highres-\${uniqueId}`;\n/, '');
fs.writeFileSync('src/components/viz/HighResSpectrogram.jsx', f, 'utf8');

f = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
f = f.replace(/};\n\n    };\n\n    const drawLPC = \(ctx, width, height, spectrum\) => {/, '};\n\n    const drawLPC = (ctx, width, height, spectrum) => {');
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', f, 'utf8');

f = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');
f = f.replace(/};\n\n    };\n\n    return \(/, '};\n\n    return (');
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', f, 'utf8');

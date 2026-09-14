const fs = require('fs');

function replaceFile(path, fromStr, toStr) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    const result = data.replace(fromStr, toStr);
    fs.writeFileSync(path, result, 'utf8');
  } catch(e) {}
}

replaceFile('src/components/viz/HighResSpectrogram.jsx', `const componentId = useId();\n    const componentId = useId();`, `const componentId = useId();`);
replaceFile('src/components/viz/QualityVisualizer.jsx', `};\n\n    };`, `};`);

replaceFile('src/components/viz/SpectralTiltMeter.jsx', `};\n\n    };`, `};`);

replaceFile('src/components/viz/PitchOrb.test.jsx', `global.`, `globalThis.`);
replaceFile('src/components/viz/Spectrogram3D.test.jsx', `global.`, `globalThis.`);
replaceFile('src/components/viz/SpectrumAnalyzer.test.jsx', `global.`, `globalThis.`);

console.log("fixes applied");

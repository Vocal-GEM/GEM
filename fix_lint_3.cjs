const fs = require('fs');

function replaceFile(path, fromStr, toStr) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    const result = data.replace(fromStr, toStr);
    fs.writeFileSync(path, result, 'utf8');
  } catch(e) {}
}

replaceFile('src/components/viz/HighResSpectrogram.jsx', `    // Component ID for RenderCoordinator
    const componentId = useId();

    // Reusable buffers to avoid GC
    // Unique component ID for RenderCoordinator
    const uniqueId = useId();
    const componentId = \`spectrogram-highres-\${uniqueId}\`;`, `    // Component ID for RenderCoordinator
    const componentId = useId();`);

replaceFile('src/components/viz/BreathinessMeter.jsx', `const renderCoordinator = {
    subscribe: () => () => {},
    PRIORITY: { MEDIUM: 2 }
};`, ``);


console.log("fixes applied");

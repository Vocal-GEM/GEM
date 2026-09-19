const fs = require('fs');

function replaceAll(file, search, replace) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

// Global errors in test files - use globalThis
replaceAll('src/components/viz/Spectrogram3D.test.jsx', 'global.mockUseFrameCallback', 'globalThis.mockUseFrameCallback');
replaceAll('src/components/viz/Spectrogram3D.test.jsx', 'global.requestAnimationFrame', 'globalThis.requestAnimationFrame');

replaceAll('src/components/viz/SpectrumAnalyzer.test.jsx', 'global.ResizeObserver', 'globalThis.ResizeObserver');

replaceAll('src/components/viz/PitchOrb.test.jsx', 'global.requestAnimationFrame', 'globalThis.requestAnimationFrame');


// BrightnessMeter.test.jsx display name
let bTest = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf-8');
if (bTest.includes("require('react')")) {
    bTest = bTest.replace("const React = require('react');", "const React = require('react');");
    bTest = bTest.replace("const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });", "const createIcon = (name) => { const MockIcon = (props) => React.createElement('div', { ...props, 'data-testid': name }); MockIcon.displayName = name; return MockIcon; };");
    fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', bTest);
}

// RecommendedToolsWidget.jsx escaped quotes
let recWidget = fs.readFileSync('src/components/ui/RecommendedToolsWidget.jsx', 'utf-8');
recWidget = recWidget.replace('                    <p className="text-xs text-slate-400">Try the "Siren Glide" to stretch your vocal folds.</p>', '                    <p className="text-xs text-slate-400">Try the &quot;Siren Glide&quot; to stretch your vocal folds.</p>');
recWidget = recWidget.replace('                    <p className="text-xs text-slate-400">Practice "Resonant Humming" before recording.</p>', '                    <p className="text-xs text-slate-400">Practice &quot;Resonant Humming&quot; before recording.</p>');
recWidget = recWidget.replace('                    "{recommendations.rationale.split(\'.\')[0]}."', '                    &quot;{recommendations.rationale.split(\'.\')[0]}.&quot;');
fs.writeFileSync('src/components/ui/RecommendedToolsWidget.jsx', recWidget);

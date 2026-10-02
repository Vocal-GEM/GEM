const fs = require('fs');

// src/components/viz/Spectrogram3D.test.jsx
let content = fs.readFileSync('src/components/viz/Spectrogram3D.test.jsx', 'utf8');
content = content.replace(/global\./g, 'globalThis.');
fs.writeFileSync('src/components/viz/Spectrogram3D.test.jsx', content);

// src/components/viz/PitchOrb.test.jsx
content = fs.readFileSync('src/components/viz/PitchOrb.test.jsx', 'utf8');
content = content.replace(/global\./g, 'globalThis.');
fs.writeFileSync('src/components/viz/PitchOrb.test.jsx', content);

// src/components/viz/SpectrumAnalyzer.test.jsx
content = fs.readFileSync('src/components/viz/SpectrumAnalyzer.test.jsx', 'utf8');
content = content.replace(/global\./g, 'globalThis.');
fs.writeFileSync('src/components/viz/SpectrumAnalyzer.test.jsx', content);

// src/components/viz/BrightnessMeter.test.jsx
content = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
content = content.replace(/vi.mock\('lucide-react', \(\) => {[\s\S]*?}\);/, `vi.mock('lucide-react', async () => {
    const React = await import('react');
    const createIcon = (name) => {
        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });
        Icon.displayName = name;
        return Icon;
    };

    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Smile: createIcon('Smile')
    };
});`);
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', content);

// src/components/ui/RecommendedToolsWidget.jsx
content = fs.readFileSync('src/components/ui/RecommendedToolsWidget.jsx', 'utf8');
content = content.replace(/"\{recommendations\.rationale\.split\('\.'\)\[0\]\}\."/g, '&quot;{recommendations.rationale.split(\'.\')[0]}.&quot;');
fs.writeFileSync('src/components/ui/RecommendedToolsWidget.jsx', content);

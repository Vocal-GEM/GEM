const fs = require('fs');

function replaceAll(file, search, replace) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

// ClientDashboard.jsx
replaceAll('src/components/professional/ClientDashboard.jsx', '<Activity size={18} /> Progress', '<Activity size={18} /> Progress');

// SuccessStories.test.jsx
replaceAll('src/components/community/SuccessStories.test.jsx', 'import React from \'react\';\nimport React from \'react\';', 'import React from \'react\';');

// JournalForm.test.jsx
replaceAll('src/components/ui/JournalForm.test.jsx', 'const { startRecording, stopRecordingstopRecording } = useJournalRecording();', 'const { startRecording, stopRecording } = useJournalRecording();');
replaceAll('src/components/ui/JournalForm.test.jsx', '        stopRecording: vi.fn(),\n      },', '      },');

// LoadingSpinner.test.jsx
replaceAll('src/components/ui/LoadingSpinner.test.jsx', 'import { render, screen } from \'@testing-library/react\';\nimport { render, screen } from \'@testing-library/react\';', 'import { render, screen } from \'@testing-library/react\';');

// LoadingSpinnerVerification.jsx
replaceAll('src/components/ui/LoadingSpinnerVerification.jsx', '    };\n    return (', '    return (');

// QuickActions.jsx
replaceAll('src/components/ui/QuickActions.jsx', '</div>}', '</div>');

// button.test.jsx
replaceAll('src/components/ui/button.test.jsx', 'import React from \'react\';\nimport { render, screen, fireEvent } from \'@testing-library/react\';\n\nimport { describe, it, expect, vi } from \'vitest\';', '');
let buttonTest = fs.readFileSync('src/components/ui/button.test.jsx', 'utf-8');
if (buttonTest.includes('expect(screen.queryByText("Icon")).not.toBeInTheDocument();\nimport React from "react";')) {
    buttonTest = buttonTest.replace('    expect(screen.queryByText("Icon")).not.toBeInTheDocument();\nimport React from "react";\n', '    expect(screen.queryByText("Icon")).not.toBeInTheDocument();\n  });\n});\n');
    fs.writeFileSync('src/components/ui/button.test.jsx', buttonTest);
}

// BreathinessMeter.jsx
replaceAll('src/components/viz/BreathinessMeter.jsx', 'import { renderCoordinator } from \'../../services/RenderCoordinator\';\nimport { renderCoordinator } from \'../../services/RenderCoordinator\';', 'import { renderCoordinator } from \'../../services/RenderCoordinator\';');

// BrightnessMeter.test.jsx
replaceAll('src/components/viz/BrightnessMeter.test.jsx', 'const React = require(\'react\');', 'const React = require("react");');
replaceAll('src/components/viz/BrightnessMeter.test.jsx', 'const createIcon = (name) => (props) => React.createElement(\'div\', { ...props, \'data-testid\': name });', 'const createIcon = (name) => { const MockIcon = (props) => React.createElement("div", { ...props, "data-testid": name }); MockIcon.displayName = name; return MockIcon; };');

// HighResSpectrogram.jsx
replaceAll('src/components/viz/HighResSpectrogram.jsx', 'const uniqueId = useId();\n    const componentId = `spectrogram-highres-${uniqueId}`;', 'const componentId = `spectrogram-highres-${useId()}`;');

// QualityVisualizer.jsx
replaceAll('src/components/viz/QualityVisualizer.jsx', '};\n;', '};\n');

// SpectralTiltMeter.jsx
replaceAll('src/components/viz/SpectralTiltMeter.jsx', '};\n;', '};\n');

// global. tests
replaceAll('src/components/viz/PitchOrb.test.jsx', 'global.', 'globalThis.');
replaceAll('src/components/viz/Spectrogram3D.test.jsx', 'global.', 'globalThis.');
replaceAll('src/components/viz/SpectrumAnalyzer.test.jsx', 'global.', 'globalThis.');

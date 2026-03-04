const fs = require('fs');

function replaceFile(path, searchRe, replaceStr) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(searchRe, replaceStr);
  fs.writeFileSync(path, content);
}

// ClientDashboard.jsx
replaceFile('src/components/professional/ClientDashboard.jsx', /import \{ Calendar, Trophy, Flame \} from 'lucide-react';/, "import { Calendar, Activity, Trophy, Flame } from 'lucide-react';");

// SuccessStories.test.jsx
replaceFile('src/components/community/SuccessStories.test.jsx', /import \{ render, screen, waitFor \} from '@testing-library\/react';\nimport \{ describe, it, expect, vi, beforeEach \} from 'vitest';\nimport \{ render \} from '@testing-library\/react';/, "import { render, screen, waitFor } from '@testing-library/react';\nimport { describe, it, expect, vi, beforeEach } from 'vitest';");

// IntakeQuestionnaire.jsx
replaceFile('src/components/ui/IntakeQuestionnaire.jsx', /"Skip"/g, '&quot;Skip&quot;');

// JournalForm.test.jsx
replaceFile('src/components/ui/JournalForm.test.jsx', /stopRecording\(\);/, 'await stopRecording();');

// LoadingSpinner.test.jsx
replaceFile('src/components/ui/LoadingSpinner.test.jsx', /import \{ render \} from '@testing-library\/react';\nimport \{ render, screen \} from '@testing-library\/react';/, "import { render, screen } from '@testing-library/react';");

// LoadingSpinnerVerification.jsx
replaceFile('src/components/ui/LoadingSpinnerVerification.jsx', /return\n\s*<div/, 'return (<div');
replaceFile('src/components/ui/LoadingSpinnerVerification.jsx', /<\/div>\n\s*;/g, '</div>);');

// MicrophoneCalibration.jsx
replaceFile('src/components/ui/MicrophoneCalibration.jsx', /"Good"/g, '&quot;Good&quot;');
replaceFile('src/components/ui/MicrophoneCalibration.jsx', /"Excellent"/g, '&quot;Excellent&quot;');

// QuickActions.jsx
let qa = fs.readFileSync('src/components/ui/QuickActions.jsx', 'utf8');
qa = qa.replace(/        \n        \n                \}\)\}/, '                ))}');
fs.writeFileSync('src/components/ui/QuickActions.jsx', qa);

// RecommendedToolsWidget.jsx
replaceFile('src/components/ui/RecommendedToolsWidget.jsx', /"A "/g, '&quot;A &quot;');
replaceFile('src/components/ui/RecommendedToolsWidget.jsx', /" for specific/g, '&quot; for specific');

// button.test.jsx
let bt = fs.readFileSync('src/components/ui/button.test.jsx', 'utf8');
bt = bt.replace(/import React from "react";\nimport \{ render, screen, fireEvent \} from "@testing-library\/react";\n/, '');
fs.writeFileSync('src/components/ui/button.test.jsx', bt);

// BreathinessMeter.jsx
replaceFile('src/components/viz/BreathinessMeter.jsx', /import \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';\nimport \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';/, "import { renderCoordinator } from '../../services/RenderCoordinator';");

// BrightnessMeter.test.jsx
replaceFile('src/components/viz/BrightnessMeter.test.jsx', /require\('lucide-react'\)/g, "vi.importActual('lucide-react')");
replaceFile('src/components/viz/BrightnessMeter.test.jsx', /return \(\) => <div data-testid="sun-icon" \/>;/, 'const Sun = () => <div data-testid="sun-icon" />; Sun.displayName = "Sun"; return Sun;');

// HighResSpectrogram.jsx
replaceFile('src/components/viz/HighResSpectrogram.jsx', /const componentId = `spectrogram-highres-\$\{uniqueId\}`;/, '');

// QualityVisualizer.jsx
replaceFile('src/components/viz/QualityVisualizer.jsx', /        <\/div>\n    ;\n};/, '        </div>\n    );\n};');

// SpectralTiltMeter.jsx
replaceFile('src/components/viz/SpectralTiltMeter.jsx', /        <\/div>\n    ;\n};/, '        </div>\n    );\n};');

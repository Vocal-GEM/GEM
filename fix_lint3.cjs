const fs = require('fs');

function replaceFile(path, searchRe, replaceStr) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(searchRe, replaceStr);
  fs.writeFileSync(path, content);
}

// 1. QualityVisualizer.jsx
let qv = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
qv = qv.replace(/        <\/div>\n    ;\n};/, '        </div>\n    );\n};');
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', qv);

// 2. SpectralTiltMeter.jsx
let stm = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');
stm = stm.replace(/        <\/div>\n    ;\n};/, '        </div>\n    );\n};');
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', stm);

// 3. QuickActions.jsx
let qa = fs.readFileSync('src/components/ui/QuickActions.jsx', 'utf8');
qa = qa.replace(/        \n        \n                \}\)\}/, '                ))}');
fs.writeFileSync('src/components/ui/QuickActions.jsx', qa);

// 4. button.test.jsx
let bt = fs.readFileSync('src/components/ui/button.test.jsx', 'utf8');
bt = bt.replace(/import React from "react";\nimport \{ render, screen, fireEvent \} from "@testing-library\/react";\n/, '');
fs.writeFileSync('src/components/ui/button.test.jsx', bt);

// 5. SuccessStories.test.jsx
let ss = fs.readFileSync('src/components/community/SuccessStories.test.jsx', 'utf8');
ss = ss.replace(/import React from ['"]react['"];\n/, '');
fs.writeFileSync('src/components/community/SuccessStories.test.jsx', ss);

// 6. PitchWorklet.js
let pw = fs.readFileSync('src/audio/PitchWorklet.js', 'utf8');
pw = pw.replace(/timestamp: typeof timeAfter !== "undefined" \? timeAfter : \(\/\* eslint-disable-next-line no-undef \*\/ typeof currentTime !== "undefined" \? currentTime : performance\.now\(\) \/ 1000\),/g, 'timestamp: timeAfter,');
fs.writeFileSync('src/audio/PitchWorklet.js', pw);

// 7. ClientDashboard.jsx
let cd = fs.readFileSync('src/components/professional/ClientDashboard.jsx', 'utf8');
cd = cd.replace(/import \{ Calendar, Trophy, Flame \}/, 'import { Calendar, Activity, Trophy, Flame }');
fs.writeFileSync('src/components/professional/ClientDashboard.jsx', cd);

// 8. TaskRecorder.jsx
replaceFile('src/components/professional/TaskRecorder.jsx', /"The Rainbow Passage"/g, '&quot;The Rainbow Passage&quot;');

// 9. IntakeQuestionnaire.jsx
replaceFile('src/components/ui/IntakeQuestionnaire.jsx', /"Skip"/g, '&quot;Skip&quot;');

// 10. JournalForm.test.jsx
replaceFile('src/components/ui/JournalForm.test.jsx', /stopRecording\(\)/, 'await stopRecording()');

// 11. LoadingSpinner.test.jsx
replaceFile('src/components/ui/LoadingSpinner.test.jsx', /import \{ render \} from '@testing-library\/react';/, 'import { render as renderComponent } from "@testing-library/react";');
replaceFile('src/components/ui/LoadingSpinner.test.jsx', /render\(/g, 'renderComponent(');

// 12. LoadingSpinnerVerification.jsx
replaceFile('src/components/ui/LoadingSpinnerVerification.jsx', /return\n\s*<div/g, 'return (<div');
replaceFile('src/components/ui/LoadingSpinnerVerification.jsx', /<\/div>\n\s*;/g, '</div>);');

// 13. MicrophoneCalibration.jsx
replaceFile('src/components/ui/MicrophoneCalibration.jsx', /"Good"/g, '&quot;Good&quot;');
replaceFile('src/components/ui/MicrophoneCalibration.jsx', /"Excellent"/g, '&quot;Excellent&quot;');

// 14. RecommendedToolsWidget.jsx
replaceFile('src/components/ui/RecommendedToolsWidget.jsx', /"A "/g, '&quot;A &quot;');
replaceFile('src/components/ui/RecommendedToolsWidget.jsx', /" for specific/g, '&quot; for specific');

// 15. BreathinessMeter.jsx
let bm = fs.readFileSync('src/components/viz/BreathinessMeter.jsx', 'utf8');
bm = bm.replace(/import \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';\nimport \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';/, "import { renderCoordinator } from '../../services/RenderCoordinator';");
fs.writeFileSync('src/components/viz/BreathinessMeter.jsx', bm);

// 16. BrightnessMeter.test.jsx
let bmt = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
bmt = bmt.replace(/require\('lucide-react'\)/g, "vi.importActual('lucide-react')");
bmt = bmt.replace(/return \(\) => <div data-testid="sun-icon" \/>;/, 'const Sun = () => <div data-testid="sun-icon" />; Sun.displayName = "Sun"; return Sun;');
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', bmt);

// 17. HighResSpectrogram.jsx
let hrs = fs.readFileSync('src/components/viz/HighResSpectrogram.jsx', 'utf8');
hrs = hrs.replace(/let componentId = /g, 'const componentId = ');
fs.writeFileSync('src/components/viz/HighResSpectrogram.jsx', hrs);

const fs = require('fs');

function replaceFile(path, searchRe, replaceStr) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(searchRe, replaceStr);
  fs.writeFileSync(path, content);
}

// 1. PitchWorklet.js
let worklet = fs.readFileSync('src/audio/PitchWorklet.js', 'utf8');
worklet = worklet.replace(/typeof currentTime !== "undefined" \? currentTime : performance\.now\(\) \/ 1000/g, 'currentTime');
worklet = worklet.replace(/const startTime = currentTime;/g, '/* eslint-disable-next-line no-undef */\n                const timeNow = typeof currentTime !== "undefined" ? currentTime : performance.now() / 1000;\n                const startTime = timeNow;');
worklet = worklet.replace(/const processingTime = \(currentTime - startTime\) \* 1000;/g, '/* eslint-disable-next-line no-undef */\n                const timeAfter = typeof currentTime !== "undefined" ? currentTime : performance.now() / 1000;\n                const processingTime = (timeAfter - startTime) * 1000;');
worklet = worklet.replace(/timestamp: currentTime,/g, 'timestamp: typeof timeAfter !== "undefined" ? timeAfter : (/* eslint-disable-next-line no-undef */ typeof currentTime !== "undefined" ? currentTime : performance.now() / 1000),');
fs.writeFileSync('src/audio/PitchWorklet.js', worklet);

// 2. SuccessStories.test.jsx
let ss = fs.readFileSync('src/components/community/SuccessStories.test.jsx', 'utf8');
// remove the duplicate react import
ss = ss.replace(/import React from ['"]react['"];\n/g, '');
fs.writeFileSync('src/components/community/SuccessStories.test.jsx', ss);

// 3. ClientDashboard.jsx
replaceFile('src/components/professional/ClientDashboard.jsx', /import \{ Calendar, Trophy, Flame \}/, 'import { Calendar, Activity, Trophy, Flame }');

// 4. TaskRecorder.jsx
replaceFile('src/components/professional/TaskRecorder.jsx', /"The Rainbow Passage"/g, '&quot;The Rainbow Passage&quot;');

// 5. IntakeQuestionnaire.jsx
replaceFile('src/components/ui/IntakeQuestionnaire.jsx', /"Skip"/g, '&quot;Skip&quot;');

// 6. JournalForm.test.jsx
replaceFile('src/components/ui/JournalForm.test.jsx', /stopRecording\(\)/, 'await stopRecording()');

// 7. LoadingSpinner.test.jsx
replaceFile('src/components/ui/LoadingSpinner.test.jsx', /import \{ render \} from '@testing-library\/react';/, 'import { render as renderComponent } from "@testing-library/react";');
replaceFile('src/components/ui/LoadingSpinner.test.jsx', /render\(/g, 'renderComponent(');

// 8. LoadingSpinnerVerification.jsx
replaceFile('src/components/ui/LoadingSpinnerVerification.jsx', /return\n\s*<div/g, 'return (<div');
replaceFile('src/components/ui/LoadingSpinnerVerification.jsx', /<\/div>\n\s*;/g, '</div>);');

// 9. MicrophoneCalibration.jsx
replaceFile('src/components/ui/MicrophoneCalibration.jsx', /"Good"/g, '&quot;Good&quot;');
replaceFile('src/components/ui/MicrophoneCalibration.jsx', /"Excellent"/g, '&quot;Excellent&quot;');

// 10. QuickActions.jsx
// Need to find parsing error Unexpected token `}` around line 81
let qa = fs.readFileSync('src/components/ui/QuickActions.jsx', 'utf8');
let qaLines = qa.split('\n');
console.log('QuickActions.jsx line 81: ', qaLines[80]);

// 11. RecommendedToolsWidget.jsx
replaceFile('src/components/ui/RecommendedToolsWidget.jsx', /"A "/g, '&quot;A &quot;');
replaceFile('src/components/ui/RecommendedToolsWidget.jsx', /" for specific/g, '&quot; for specific');

// 12. button.test.jsx
// 'import' and 'export' may only appear at the top level
// will fix manually
let bt = fs.readFileSync('src/components/ui/button.test.jsx', 'utf8');
console.log('button.test.jsx line 32: ', bt.split('\n')[31]);

// 13. BreathinessMeter.jsx
let bm = fs.readFileSync('src/components/viz/BreathinessMeter.jsx', 'utf8');
bm = bm.replace(/import \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';\nimport \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';/, "import { renderCoordinator } from '../../services/RenderCoordinator';");
fs.writeFileSync('src/components/viz/BreathinessMeter.jsx', bm);

// 14. BrightnessMeter.test.jsx
let bmt = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
bmt = bmt.replace(/require\('lucide-react'\)/g, "vi.importActual('lucide-react')");
bmt = bmt.replace(/return \(\) => <div data-testid="sun-icon" \/>;/, 'const Sun = () => <div data-testid="sun-icon" />; Sun.displayName = "Sun"; return Sun;');
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', bmt);

// 15. HighResSpectrogram.jsx
let hrs = fs.readFileSync('src/components/viz/HighResSpectrogram.jsx', 'utf8');
hrs = hrs.replace(/const componentId = /g, 'let componentId = ');
fs.writeFileSync('src/components/viz/HighResSpectrogram.jsx', hrs);

// 16. PitchOrb.test.jsx
let pot = fs.readFileSync('src/components/viz/PitchOrb.test.jsx', 'utf8');
pot = pot.replace(/global\.requestAnimationFrame/g, 'globalThis.requestAnimationFrame');
fs.writeFileSync('src/components/viz/PitchOrb.test.jsx', pot);

// 17. QualityVisualizer.jsx
let qv = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
console.log('QualityVisualizer.jsx line 253: ', qv.split('\n')[252]);

// 18. SpectralTiltMeter.jsx
let stm = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');
console.log('SpectralTiltMeter.jsx line 54: ', stm.split('\n')[53]);

// 19. Spectrogram3D.test.jsx
let s3t = fs.readFileSync('src/components/viz/Spectrogram3D.test.jsx', 'utf8');
s3t = s3t.replace(/global\./g, 'globalThis.');
fs.writeFileSync('src/components/viz/Spectrogram3D.test.jsx', s3t);

// 20. SpectrumAnalyzer.test.jsx
let sat = fs.readFileSync('src/components/viz/SpectrumAnalyzer.test.jsx', 'utf8');
sat = sat.replace(/global\./g, 'globalThis.');
fs.writeFileSync('src/components/viz/SpectrumAnalyzer.test.jsx', sat);

// 21. PrivacyManager.js
let pm = fs.readFileSync('src/services/PrivacyManager.js', 'utf8');
console.log('PrivacyManager.js line 9: ', pm.split('\n')[8]);

// 22. ResearchMode.js
let rm = fs.readFileSync('src/services/ResearchMode.js', 'utf8');
rm = rm.replace(/process\.env/g, 'import.meta.env');
fs.writeFileSync('src/services/ResearchMode.js', rm);

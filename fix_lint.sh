#!/bin/bash

# 1. BrightnessMeter.test.jsx 'require is not defined'
sed -i 's/const { PRIORITY } = require('\''\.\.\/\.\.\/services\/RenderCoordinator'\'');/const PRIORITY = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };/g' src/components/viz/BrightnessMeter.test.jsx
sed -i 's/vi.mock('\''\.\.\/\.\.\/services\/RenderCoordinator'\'', () => {/vi.mock('\''\.\.\/\.\.\/services\/RenderCoordinator'\'', () => {\n    const PRIORITY = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };/g' src/components/viz/BrightnessMeter.test.jsx

# Just rewrite the vi.mock for BrightnessMeter.test.jsx completely to fix the require error
cat << 'MOCK' > patch_brightness_mock.cjs
const fs = require('fs');
const file = 'src/components/viz/BrightnessMeter.test.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /const { PRIORITY } = require\('\.\.\/\.\.\/services\/RenderCoordinator'\);\nvi\.mock\('\.\.\/\.\.\/services\/RenderCoordinator', \(\) => \(\{/,
  `vi.mock('../../services/RenderCoordinator', () => {
    const PRIORITY = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return {`
);
fs.writeFileSync(file, content);
MOCK
node patch_brightness_mock.cjs

# 2. RecommendedToolsWidget.jsx escape quotes
sed -i 's/"Practice"/\&quot;Practice\&quot;/g' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/"Analysis"/\&quot;Analysis\&quot;/g' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/"Exercises"/\&quot;Exercises\&quot;/g' src/components/ui/RecommendedToolsWidget.jsx

# 3. MicrophoneCalibration.jsx (make sure to catch it again if first sed failed)
sed -i 's/"The quick brown fox jumps over the lazy dog"/\&quot;The quick brown fox jumps over the lazy dog\&quot;/g' src/components/ui/MicrophoneCalibration.jsx

# 4. IntakeQuestionnaire.jsx (make sure to catch it)
sed -i 's/Let'\''s get to know your voice/Let\&apos;s get to know your voice/g' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/"Gem Course"/\&quot;Gem Course\&quot;/g' src/components/ui/IntakeQuestionnaire.jsx

# 5. TaskRecorder.jsx (make sure to catch it)
sed -i 's/"When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow."/\&quot;When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow.\&quot;/g' src/components/professional/TaskRecorder.jsx

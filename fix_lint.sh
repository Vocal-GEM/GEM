#!/bin/bash

# 1. MicrophoneCalibration.jsx
sed -i 's/"The quick brown fox jumps over the lazy dog"/\&quot;The quick brown fox jumps over the lazy dog\&quot;/g' src/components/ui/MicrophoneCalibration.jsx

# 2. IntakeQuestionnaire.jsx
sed -i 's/Let'\''s get to know your voice/Let\&apos;s get to know your voice/g' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/"Gem Course"/\&quot;Gem Course\&quot;/g' src/components/ui/IntakeQuestionnaire.jsx

# 3. TaskRecorder.jsx
sed -i 's/"When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow."/\&quot;When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow.\&quot;/g' src/components/professional/TaskRecorder.jsx

# 4. ClientDashboard.jsx
# Add Activity import if missing
sed -i 's/import { Users, UserPlus, FileText, Settings, Video, Search } from '\''lucide-react'\'';/import { Users, UserPlus, FileText, Settings, Video, Search, Activity } from '\''lucide-react'\'';/g' src/components/professional/ClientDashboard.jsx
# Try to catch if import is different
grep -q "import { Activity" src/components/professional/ClientDashboard.jsx || sed -i '/lucide-react/s/}/, Activity }/' src/components/professional/ClientDashboard.jsx

# 5. PitchWorklet.js
sed -i '1s/^/\/* global currentTime *\/\n/' src/audio/PitchWorklet.js

# 6. BreathinessMeter.jsx
sed -i '/import { renderCoordinator } from '\''\.\.\/\.\.\/services\/RenderCoordinator'\'';/d' src/components/viz/BreathinessMeter.jsx

# 7 & 8. BrightnessMeter.test.jsx
sed -i 's/const { PRIORITY } = require('\''\.\.\/\.\.\/services\/RenderCoordinator'\'');/const PRIORITY = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };/g' src/components/viz/BrightnessMeter.test.jsx
sed -i 's/vi.mock('\''\.\.\/\.\.\/services\/RenderCoordinator'\'', () => {/vi.mock('\''\.\.\/\.\.\/services\/RenderCoordinator'\'', () => {\n    const PRIORITY = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };/g' src/components/viz/BrightnessMeter.test.jsx

# Wait, let's just replace the whole vi.mock block for BrightnessMeter

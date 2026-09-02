#!/bin/bash

# 1. BrightnessMeter.test.jsx
sed -i 's/const createIcon = (name) => (props) => React.createElement('\''div'\'', { ...props, '\''data-testid'\'': name });/const createIcon = (name) => {\n        const MockIcon = (props) => React.createElement('\''div'\'', { ...props, '\''data-testid'\'': name });\n        MockIcon.displayName = name;\n        return MockIcon;\n    };/g' src/components/viz/BrightnessMeter.test.jsx

# 2. RecommendedToolsWidget.jsx (unescaped quotes)
sed -i 's/description: "Practice"/description: \&quot;Practice\&quot;/g' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/description: "Analysis"/description: \&quot;Analysis\&quot;/g' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/description: "Exercises"/description: \&quot;Exercises\&quot;/g' src/components/ui/RecommendedToolsWidget.jsx

# Try just to replace any " in text context
sed -i 's/>"Practice"</>\&quot;Practice\&quot;</g' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/>"Analysis"</>\&quot;Analysis\&quot;</g' src/components/ui/RecommendedToolsWidget.jsx
sed -i 's/>"Exercises"</>\&quot;Exercises\&quot;</g' src/components/ui/RecommendedToolsWidget.jsx

# 3. MicrophoneCalibration.jsx
sed -i 's/>"The quick brown fox jumps over the lazy dog"</>\&quot;The quick brown fox jumps over the lazy dog\&quot;</g' src/components/ui/MicrophoneCalibration.jsx

# 4. IntakeQuestionnaire.jsx
sed -i 's/Let'\''s get to know your voice/Let\&apos;s get to know your voice/g' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/>"Gem Course"</>\&quot;Gem Course\&quot;</g' src/components/ui/IntakeQuestionnaire.jsx

# 5. TaskRecorder.jsx
sed -i 's/>"When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow."</>\&quot;When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow.\&quot;</g' src/components/professional/TaskRecorder.jsx

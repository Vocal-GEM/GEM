#!/bin/bash

# Fix IntakeQuestionnaire.jsx escapes
sed -i "s/I'm a trans woman/I\&apos;m a trans woman/g" src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/placeholder="e.g., \\"My voice sounds too...\\""/placeholder="e.g., \&quot;My voice sounds too...\&quot;"/g' src/components/ui/IntakeQuestionnaire.jsx

# Fix TaskRecorder.jsx escapes
sed -i 's/Say \\"Ah\\" for 5 seconds/Say \&quot;Ah\&quot; for 5 seconds/g' src/components/professional/TaskRecorder.jsx

# Fix ClientDashboard.jsx Activity import
sed -i "s/import { Card/import { Activity, Card/g" src/components/professional/ClientDashboard.jsx

# Fix PitchWorklet.js currentTime -> globalThis.currentTime
sed -i 's/currentTime/globalThis.currentTime/g' src/audio/PitchWorklet.js

# Fix MicrophoneCalibration.jsx escapes
sed -i 's/placeholder="Say \\"Hello\\""/placeholder="Say \&quot;Hello\&quot;"/g' src/components/ui/MicrophoneCalibration.jsx

# Fix React already declared in App.jsx / views (often index.js or similar)
# We need to find where line 4 has duplicate React import
grep -n "import React" $(grep -rl "import React" src/) | grep "4:"

#!/bin/bash
# Microcalbration
sed -i 's/Say "Ahhhh" or count to 5.../Say \&quot;Ahhhh\&quot; or count to 5.../g' src/components/ui/MicrophoneCalibration.jsx

# IntakeQuestionnaire
sed -i 's/Click "Complete Profile"/Click \&quot;Complete Profile\&quot;/g' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/what'"'"'s/what\&apos;s/g' src/components/ui/IntakeQuestionnaire.jsx

# TaskRecorder
sed -i 's/"{task.prompt.replace(\x27Read: "\x27, \x27\x27).replace(\x27"\x27, \x27\x27)}"/\&quot;{task.prompt.replace(\x27Read: "\x27, \x27\x27).replace(\x27"\x27, \x27\x27)}\&quot;/g' src/components/professional/TaskRecorder.jsx

# ClientDashboard
sed -i 's/MoreVertical }/MoreVertical, Activity }/g' src/components/professional/ClientDashboard.jsx

# PrivacyManager
sed -i '9d' src/services/PrivacyManager.js

# ResearchMode
sed -i 's/process.env/import.meta.env/g' src/services/ResearchMode.js

# PitchWorklet
sed -i 's/\/\* global sampleRate \*\//\/\* global sampleRate, currentTime \*\//g' src/audio/PitchWorklet.js

npm run lint:ci | grep -n "error "

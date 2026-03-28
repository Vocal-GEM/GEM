#!/bin/bash
set -e

echo "Fixing escaped quotes..."
sed -i 's/Say "Ahhhh" or count to 5.../Say \&quot;Ahhhh\&quot; or count to 5.../g' src/components/ui/MicrophoneCalibration.jsx
sed -i 's/Click "Complete Profile"/Click \&quot;Complete Profile\&quot;/g' src/components/ui/IntakeQuestionnaire.jsx
sed -i "s/what's needed/what\&apos;s needed/g" src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/Read: "/Read: \&quot;/g' src/components/professional/TaskRecorder.jsx
sed -i 's/"}/\&quot;}/g' src/components/professional/TaskRecorder.jsx

echo "Fixing undefined Activity in ClientDashboard.jsx..."
sed -i 's/Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical/Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity/g' src/components/professional/ClientDashboard.jsx

echo "Fixing currentTime in PitchWorklet.js..."
sed -i '1i\/* global currentTime *\/' src/audio/PitchWorklet.js
sed -i 's/process(inputs, outputs, parameters)/process(inputs, _outputs, _parameters)/g' src/audio/PitchWorklet.js

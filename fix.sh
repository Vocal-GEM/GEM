#!/bin/bash
sed -i "s/what's/what\&apos;s/g" src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/"Skip"/\&quot;Skip\&quot;/g' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/import { Calendar, Trophy, Flame }/import { Calendar, Activity, Trophy, Flame }/' src/components/professional/ClientDashboard.jsx
sed -i 's/read "The Rainbow Passage"./read \&quot;The Rainbow Passage\&quot;./g' src/components/professional/TaskRecorder.jsx
sed -i 's/"Good"/\&quot;Good\&quot;/g' src/components/ui/MicrophoneCalibration.jsx
sed -i 's/"Excellent"/\&quot;Excellent\&quot;/g' src/components/ui/MicrophoneCalibration.jsx
sed -i 's/currentTime/typeof currentTime !== "undefined" ? currentTime : performance.now() \/ 1000/g' src/audio/PitchWorklet.js

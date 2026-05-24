#!/bin/bash
# Apply fixes for eslint and other failures

# 1. src/components/ui/MicrophoneCalibration.jsx
sed -i 's/Say "Ahhhh" or count to 5.../Say \&quot;Ahhhh\&quot; or count to 5.../' src/components/ui/MicrophoneCalibration.jsx

# 2. src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/Click "Complete Profile"/Click \&quot;Complete Profile\&quot;/' src/components/ui/IntakeQuestionnaire.jsx
sed -i 's/capture what'"'"'s needed/capture what\&apos;s needed/' src/components/ui/IntakeQuestionnaire.jsx

# 3. src/components/professional/TaskRecorder.jsx
sed -i 's/Read: "/Read: \&quot;/' src/components/professional/TaskRecorder.jsx
sed -i 's/""/"\&quot;/' src/components/professional/TaskRecorder.jsx
# Let's fix this more precisely:
#                     "{task.prompt.replace('Read: "', '').replace('"', '')}"
sed -i 's/                            "{task.prompt.replace('"'"'Read: "'"', '"'"''"'"').replace('"'"'"'"', '"'"''"'"')}"/                            \&quot;{task.prompt.replace('"'"'Read: "'"', '"'"''"'"').replace('"'"'"'"', '"'"''"'"')}\&quot;/' src/components/professional/TaskRecorder.jsx

# 4. src/components/professional/ClientDashboard.jsx
# Remove 'Activity' from the code if it's not imported or just import it.
# It is imported, but the error said 'Activity' is not defined. Wait, it's missing in import?
# head showed: import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';
# Let's add Activity to the import.
sed -i 's/MoreVertical } from '"'"'lucide-react'"'"';/MoreVertical, Activity } from '"'"'lucide-react'"'"';/' src/components/professional/ClientDashboard.jsx

# 5. src/audio/PitchWorklet.js
# 'currentTime' is undefined. In AudioWorklet, `currentTime` is a global. We need to add `/* global currentTime */` at the top.
sed -i '1s/^/\/\* global currentTime \*\/\n/' src/audio/PitchWorklet.js

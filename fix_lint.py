def fix_file(filepath, old, new):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

fix_file("src/audio/PitchWorklet.js", "currentTime", "globalThis.currentTime")

fix_file("src/components/professional/ClientDashboard.jsx", "<Activity className=", "import { Activity } from 'lucide-react';\n<Activity className=")

import re
with open("src/components/professional/TaskRecorder.jsx", 'r') as f:
    content = f.read()
content = re.sub(r'Wait for the "Start Recording" button', 'Wait for the &quot;Start Recording&quot; button', content)
content = re.sub(r'Click "Stop" when', 'Click &quot;Stop&quot; when', content)
with open("src/components/professional/TaskRecorder.jsx", 'w') as f:
    f.write(content)

with open("src/components/ui/IntakeQuestionnaire.jsx", 'r') as f:
    content = f.read()
content = content.replace("Tell us a bit about what you're hoping", "Tell us a bit about what you&apos;re hoping")
content = content.replace('Example: "I want my voice to sound more feminine"', 'Example: &quot;I want my voice to sound more feminine&quot;')
with open("src/components/ui/IntakeQuestionnaire.jsx", 'w') as f:
    f.write(content)

fix_file("src/components/ui/MicrophoneCalibration.jsx", 'Example: "I want my voice to sound more feminine"', 'Example: &quot;I want my voice to sound more feminine&quot;')
fix_file("src/components/ui/MicrophoneCalibration.jsx", '"Say Ahhhhhhh"', '&quot;Say Ahhhhhhh&quot;')

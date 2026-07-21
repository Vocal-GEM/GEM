import re
import os

# Fix IntakeQuestionnaire.jsx
file = 'src/components/ui/IntakeQuestionnaire.jsx'
with open(file, 'r') as f: content = f.read()
content = content.replace('"My voice sounds too..."', '&quot;My voice sounds too...&quot;')
content = content.replace("I'm a trans woman", "I&apos;m a trans woman")
with open(file, 'w') as f: f.write(content)

# Fix TaskRecorder.jsx
file = 'src/components/professional/TaskRecorder.jsx'
with open(file, 'r') as f: content = f.read()
content = content.replace('"Ah"', '&quot;Ah&quot;')
with open(file, 'w') as f: f.write(content)

# Fix MicrophoneCalibration.jsx
file = 'src/components/ui/MicrophoneCalibration.jsx'
with open(file, 'r') as f: content = f.read()
content = content.replace('"Hello"', '&quot;Hello&quot;')
with open(file, 'w') as f: f.write(content)

# Fix ClientDashboard.jsx
file = 'src/components/professional/ClientDashboard.jsx'
with open(file, 'r') as f: content = f.read()
content = content.replace('import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";', 'import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";\nimport { Activity } from "lucide-react";')
with open(file, 'w') as f: f.write(content)

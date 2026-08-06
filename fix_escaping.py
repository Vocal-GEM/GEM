with open('src/components/ui/MicrophoneCalibration.jsx', 'r') as f:
    c = f.read()
    c = c.replace('Say "Ahhhh"', 'Say &quot;Ahhhh&quot;')
with open('src/components/ui/MicrophoneCalibration.jsx', 'w') as f:
    f.write(c)

with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    c = f.read()
    c = c.replace("what's needed", "what&apos;s needed")
    c = c.replace('Click "Complete Profile"', 'Click &quot;Complete Profile&quot;')
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(c)

with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    c = f.read()
    c = c.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(c)

with open('src/components/professional/ClientDashboard.jsx', 'r') as f:
    c = f.read()
    if 'import { Activity' not in c:
        c = c.replace("import { Play, TrendingUp,", "import { Play, TrendingUp, Activity,")
with open('src/components/professional/ClientDashboard.jsx', 'w') as f:
    f.write(c)

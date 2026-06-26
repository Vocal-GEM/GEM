with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    tr = f.read()
    tr = tr.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(tr)

with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    iq = f.read()
    iq = iq.replace("what's needed", "what&apos;s needed")
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(iq)

with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    content = f.read()
# Revert previous faulty replace and do it right
content = content.replace('className="text-center">"Ah" (comfortable pitch)</div>', 'className="text-center">&quot;Ah&quot; (comfortable pitch)</div>')
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(content)

with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    content = f.read()
content = content.replace('I can\'t project my voice', 'I can&apos;t project my voice')
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(content)

with open("src/components/professional/TaskRecorder.jsx", "r") as f:
    content = f.read()

content = content.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')

with open("src/components/professional/TaskRecorder.jsx", "w") as f:
    f.write(content)


with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f:
    content = f.read()

content = content.replace('I can\'t project my voice', 'I can&apos;t project my voice')
content = content.replace('className="text-center">"Ah" (comfortable pitch)</div>', 'className="text-center">&quot;Ah&quot; (comfortable pitch)</div>')
content = content.replace('"Ah" (comfortable pitch)', '&quot;Ah&quot; (comfortable pitch)')
content = content.replace('"I can\'t project my voice"', '&quot;I can&apos;t project my voice&quot;')

with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f:
    f.write(content)

with open("src/components/ui/MicrophoneCalibration.jsx", "r") as f:
    content = f.read()

content = content.replace('Click "Start Calibration" and follow the prompts.', 'Click &quot;Start Calibration&quot; and follow the prompts.')

with open("src/components/ui/MicrophoneCalibration.jsx", "w") as f:
    f.write(content)

def fix_file(filepath, finds, replaces):
    with open(filepath, 'r') as f:
        content = f.read()
    for find, replace in zip(finds, replaces):
        content = content.replace(find, replace)
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/components/professional/TaskRecorder.jsx', ['Example: "Call to schedule a doctor\'s appointment"'], ['Example: &quot;Call to schedule a doctor&apos;s appointment&quot;'])
fix_file('src/components/ui/IntakeQuestionnaire.jsx', ["voice's perceived", 'like "Me"'], ["voice&apos;s perceived", 'like &quot;Me&quot;'])
fix_file('src/components/ui/MicrophoneCalibration.jsx', ['your "normal" voice'], ['your &quot;normal&quot; voice'])
fix_file('src/components/ui/RecommendedToolsWidget.jsx', ['Try "Pitch Perfect"', 'your "Resonance" goal'], ['Try &quot;Pitch Perfect&quot;', 'your &quot;Resonance&quot; goal'])

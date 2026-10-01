import re

files_to_fix = [
    ("src/components/ui/MicrophoneCalibration.jsx", [(r'check your browser&apos;s permissions and "Site Settings"', 'check your browser&apos;s permissions and &quot;Site Settings&quot;')]),
    ("src/components/ui/IntakeQuestionnaire.jsx", [(r'My voice doesn&apos;t sound like "me"', 'My voice doesn&apos;t sound like &quot;me&quot;'), (r'I don&apos;t use my voice', 'I don&apos;t use my voice')]),
    ("src/components/professional/TaskRecorder.jsx", [(r'client&apos;s "default" or "target" voice', 'client&apos;s &quot;default&quot; or &quot;target&quot; voice')])
]

for filepath, replacements in files_to_fix:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            for pattern, repl in replacements:
                content = re.sub(pattern, repl, content)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error on {filepath}: {e}")

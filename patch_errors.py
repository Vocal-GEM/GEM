import re

files_to_fix = [
    ("src/components/ui/MicrophoneCalibration.jsx", [(r'We couldn\'t find any working microphones', 'We couldn&apos;t find any working microphones'), (r'check your browser\'s permissions', 'check your browser&apos;s permissions')]),
    ("src/components/ui/IntakeQuestionnaire.jsx", [(r'I\'m experiencing pain', 'I&apos;m experiencing pain'), (r'I don\'t use my voice', 'I don&apos;t use my voice'), (r'I can\'t sing', 'I can&apos;t sing')]),
    ("src/components/professional/TaskRecorder.jsx", [(r'client\'s', 'client&apos;s'), (r'Let\'s', 'Let&apos;s')]),
    ("src/components/professional/ClientDashboard.jsx", [(r'Activity', '// Activity')]),
    ("src/components/analytics/WeeklyDigest.jsx", [(r'import \{ Card \} from \'../ui/card\';', '// import { Card } from \'../ui/card\';')]),
    ("src/audio/PitchWorklet.js", [(r'currentTime', 'globalThis.currentTime')])
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

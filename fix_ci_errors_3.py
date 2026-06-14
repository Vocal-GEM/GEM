import re

files_to_fix = [
    ("src/components/professional/TaskRecorder.jsx", 'Record yourself saying "Ah" at a comfortable pitch for as long as possible.', 'Record yourself saying &quot;Ah&quot; at a comfortable pitch for as long as possible.'),
    ("src/components/ui/IntakeQuestionnaire.jsx", 'I can\'t project my voice', 'I can&apos;t project my voice'),
    ("src/components/ui/IntakeQuestionnaire.jsx", 'className="text-center">"Ah" (comfortable pitch)</div>', 'className="text-center">&quot;Ah&quot; (comfortable pitch)</div>'),
    ("src/components/ui/MicrophoneCalibration.jsx", 'className="text-slate-300">Click "Start Calibration" and follow the prompts.</span>', 'className="text-slate-300">Click &quot;Start Calibration&quot; and follow the prompts.</span>'),
    ("src/components/professional/TaskRecorder.jsx", 'className="text-center">"Ah" (comfortable pitch)</div>', 'className="text-center">&quot;Ah&quot; (comfortable pitch)</div>')
]

for file, old, new in files_to_fix:
    try:
        with open(file, 'r') as f:
            content = f.read()
        content = content.replace(old, new)
        with open(file, 'w') as f:
            f.write(content)
    except:
        pass

# Fix src/components/professional/ClientDashboard.jsx for Activity
with open("src/components/professional/ClientDashboard.jsx", 'r') as f:
    content = f.read()
if "import { Activity" not in content and "from 'lucide-react'" in content:
    content = re.sub(r"(import \{.*?)(\} from 'lucide-react';)", r"\1, Activity\2", content)
with open("src/components/professional/ClientDashboard.jsx", 'w') as f:
    f.write(content)

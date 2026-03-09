import re

files_to_fix = [
    {
        "path": "src/components/ui/MicrophoneCalibration.jsx",
        "fixes": [
            (r'(>)([^<]*?)"([^<]*?)(<)', lambda m: m.group(1) + m.group(2).replace('"', '&quot;') + m.group(3).replace('"', '&quot;') + m.group(4))
        ]
    },
    {
        "path": "src/components/ui/IntakeQuestionnaire.jsx",
        "fixes": [
            (r'(>)([^<]*?)"([^<]*?)(<)', lambda m: m.group(1) + m.group(2).replace('"', '&quot;') + m.group(3).replace('"', '&quot;') + m.group(4)),
            (r'(>)([^<]*?)\'([^<]*?)(<)', lambda m: m.group(1) + m.group(2).replace("'", '&apos;') + m.group(3).replace("'", '&apos;') + m.group(4))
        ]
    },
    {
        "path": "src/components/professional/TaskRecorder.jsx",
        "fixes": [
            (r'(>)([^<]*?)"([^<]*?)(<)', lambda m: m.group(1) + m.group(2).replace('"', '&quot;') + m.group(3).replace('"', '&quot;') + m.group(4))
        ]
    },
    {
        "path": "src/components/professional/ClientDashboard.jsx",
        "fixes": [
            (r"import\s*\{\s*([^}]*?)\s*\}\s*from\s*'lucide-react';", lambda m: m.group(0).replace('Activity', '') if 'Activity' not in m.group(0) else m.group(0)),
            (r"import\s*\{\s*([^}]*?)\s*\}\s*from\s*'lucide-react';", lambda m: "import {" + m.group(1) + ", Activity } from 'lucide-react';" if 'Activity' not in m.group(1) else m.group(0))
        ]
    },
    {
        "path": "src/audio/PitchWorklet.js",
        "fixes": [
            (r'currentTime', 'typeof currentTime !== "undefined" ? currentTime : Date.now() / 1000')
        ]
    },
    {
        "path": "src/components/viz/BreathinessMeter.jsx",
        "fixes": [
            (r"import \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';\nimport \{ Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle \} from 'lucide-react';\nimport \{ renderCoordinator \} from '\.\.\/\.\.\/services\/RenderCoordinator';", "import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';")
        ]
    },
    {
        "path": "src/components/viz/HighResSpectrogram.jsx",
        "fixes": [
            (r"const componentId = useId\(\);\s*\n\s*const componentId = useId\(\);", "const componentId = useId();")
        ]
    },
    {
        "path": "src/services/PrivacyManager.js",
        "fixes": [
            (r"shareProgress:\s*false,\s*shareProgress:\s*false", "shareProgress: false")
        ]
    },
    {
        "path": "src/services/ResearchMode.js",
        "fixes": [
            (r"process\.env", "import.meta.env")
        ]
    },
    {
         "path": "src/components/viz/QualityVisualizer.jsx",
         "fixes": [
             (r";\s*\}\s*;", "}")
         ]
    },
    {
         "path": "src/components/viz/SpectralTiltMeter.jsx",
         "fixes": [
             (r";\s*\}\s*;", "}")
         ]
    }
]

for file_info in files_to_fix:
    try:
        with open(file_info["path"], "r") as f:
            content = f.read()
        for pattern, replacement in file_info["fixes"]:
            if callable(replacement):
                content = re.sub(pattern, replacement, content)
            else:
                content = re.sub(pattern, replacement, content)
        with open(file_info["path"], "w") as f:
            f.write(content)
        print(f"Fixed {file_info['path']}")
    except Exception as e:
        print(f"Error processing {file_info['path']}: {e}")

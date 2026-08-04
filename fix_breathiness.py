import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # remove duplicate import
    content = content.replace("import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';\nimport { renderCoordinator } from '../../services/RenderCoordinator';", "import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/components/viz/BreathinessMeter.jsx")

import os
import re

def fix_file(filepath, fixes):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r') as f:
        content = f.read()

    for old, new in fixes:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: Could not find '{old}' in {filepath}")

    with open(filepath, 'w') as f:
        f.write(content)

fix_file("src/components/ui/MicrophoneCalibration.jsx", [
    ('Say "Ahhhh" or count to 5...', 'Say &quot;Ahhhh&quot; or count to 5...')
])

fix_file("src/components/ui/IntakeQuestionnaire.jsx", [
    ('what\'s needed to help you', 'what&apos;s needed to help you'),
    ('Click "Complete Profile"', 'Click &quot;Complete Profile&quot;')
])

fix_file("src/components/professional/TaskRecorder.jsx", [
    ('''"{task.prompt.replace('Read: "', '').replace('"', '')}"''', '''&quot;{task.prompt.replace('Read: "', '').replace('"', '')}&quot;''')
])

fix_file("src/components/professional/ClientDashboard.jsx", [
    ("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")
])

fix_file("src/audio/PitchWorklet.js", [
    ('const startTime = currentTime;', 'const startTime = globalThis.currentTime;'),
    ('const processingTime = (currentTime - startTime) * 1000;', 'const processingTime = (globalThis.currentTime - startTime) * 1000;'),
    ('timestamp: currentTime,', 'timestamp: globalThis.currentTime,')
])

fix_file("src/components/viz/BrightnessMeter.test.jsx", [
    ("const React = require('react');", "// const React = require('react');"),
    ("vi.mock('lucide-react', () => {", "vi.mock('lucide-react', async () => {\\n    const React = await import('react');"),
    ("const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });", "const createIcon = (name) => {\\n        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });\\n        Icon.displayName = name;\\n        return Icon;\\n    };")
])

fix_file("src/components/viz/PitchOrb.test.jsx", [
    ("global.requestAnimationFrame =", "globalThis.requestAnimationFrame =")
])

fix_file("src/components/viz/Spectrogram3D.test.jsx", [
    ("global.ResizeObserver =", "globalThis.ResizeObserver ="),
    ("global.cancelAnimationFrame =", "globalThis.cancelAnimationFrame ="),
    ("global.requestAnimationFrame =", "globalThis.requestAnimationFrame ="),
    ("global.innerWidth =", "globalThis.innerWidth ="),
    ("global.innerHeight =", "globalThis.innerHeight =")
])

fix_file("src/components/viz/SpectrumAnalyzer.test.jsx", [
    ("global.ResizeObserver =", "globalThis.ResizeObserver =")
])

# For parsing errors
with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    text = f.read()
if "const width = canvas.width;\n        const height = canvas.height;\n" in text:
    text = text.replace("const width = canvas.width;\n        const height = canvas.height;\n", "", 1)
if "    }, [dataRef, colormap]);\n\n    // Initial canvas setup & ResizeObserver\n    }, [dataRef, colormap, componentId]);\n" in text:
    text = text.replace("    }, [dataRef, colormap]);\n\n    // Initial canvas setup & ResizeObserver\n    }, [dataRef, colormap, componentId]);\n", "    }, [dataRef, colormap, componentId]);\n")
if "    const componentId = `spectrogram-highres-${uniqueId}`;" in text:
    text = text.replace("    const componentId = useId();\n\n    // Reusable buffers to avoid GC\n    // Unique component ID for RenderCoordinator\n    const uniqueId = useId();\n    const componentId = `spectrogram-highres-${uniqueId}`;", "    const uniqueId = useId();\n    const componentId = `spectrogram-highres-${uniqueId}`;")
with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.write(text)

with open("src/components/viz/BreathinessMeter.jsx", "r") as f:
    text = f.read()
if "import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';\nimport { renderCoordinator } from '../../services/RenderCoordinator';" in text:
    text = text.replace("import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';\nimport { renderCoordinator } from '../../services/RenderCoordinator';", "import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';")
if "    const lastValueRef = useRef(50);\n    const componentId = useId();\n    const id = useId();\n\n    // NEW: Refs for OQ and ventricular displays\n    const oqValueRef = useRef(null);\n    const oqZoneRef = useRef(null);\n    const oqIndicatorRef = useRef(null);\n    const lastOqRef = useRef(50);\n    const ventricularRef = useRef(null);\n    const componentId = useId();" in text:
    text = text.replace("    const lastValueRef = useRef(50);\n    const componentId = useId();\n    const id = useId();\n\n    // NEW: Refs for OQ and ventricular displays\n    const oqValueRef = useRef(null);\n    const oqZoneRef = useRef(null);\n    const oqIndicatorRef = useRef(null);\n    const lastOqRef = useRef(50);\n    const ventricularRef = useRef(null);\n    const componentId = useId();", "    const lastValueRef = useRef(50);\n    const id = useId();\n\n    // NEW: Refs for OQ and ventricular displays\n    const oqValueRef = useRef(null);\n    const oqZoneRef = useRef(null);\n    const oqIndicatorRef = useRef(null);\n    const lastOqRef = useRef(50);\n    const ventricularRef = useRef(null);\n    const componentId = useId();")
with open("src/components/viz/BreathinessMeter.jsx", "w") as f:
    f.write(text)

fix_file("src/services/PrivacyManager.js", [
    ("    shareProgress: false,\n    shareProgress: false,", "    shareProgress: false,")
])

fix_file("src/services/ResearchMode.js", [
    ("process.env.REACT_APP_RESEARCH_SALT", "import.meta.env.VITE_RESEARCH_SALT")
])

# SpectralTiltMeter
with open("src/components/viz/SpectralTiltMeter.jsx", "r") as f:
    content = f.read()

old_block = """        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                `spectral-tilt-meter-${id}`,
                loop,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });
            // No recursive requestAnimationFrame - RenderCoordinator handles this
        };

        const unsubscribe = renderCoordinator.subscribe(
            `spectral-tilt-meter-${componentId}`,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };"""

new_block = """        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                `spectral-tilt-meter-${id}`,
                loop,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("src/components/viz/SpectralTiltMeter.jsx", "w") as f:
        f.write(content)

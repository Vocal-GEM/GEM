import re

def fix_file(filepath, pattern, replacement):
    with open(filepath, 'r') as f:
        content = f.read()
    content = re.sub(pattern, replacement, content)
    with open(filepath, 'w') as f:
        f.write(content)

# 1. RecommendedToolsWidget.jsx (unescaped quotes)
fix_file("src/components/ui/RecommendedToolsWidget.jsx", r"Try \"([^\"]+)\"", r"Try &quot;\1&quot;")

# 2. TaskRecorder.jsx (unnecessary escape character)
fix_file("src/components/professional/TaskRecorder.jsx", r"&quot;\{task\.prompt\.replace\('Read: \\\"', ''\)\.replace\('\\\"', ''\)\}&quot;", r"&quot;{task.prompt.replace('Read: \"', '').replace('\"', '')}&quot;")

# 3. ClientDashboard.jsx: 'Activity' is not defined
fix_file("src/components/professional/ClientDashboard.jsx", r"(import \{.*)Play(.*) from 'lucide-react';", r"\1Play, Activity\2 from 'lucide-react';")

# 4. PrivacyManager.js: Duplicate key 'shareProgress'
fix_file("src/services/PrivacyManager.js", r"    shareProgress: false,\n    shareProgress: false,", "    shareProgress: false,")

# 5. ResearchMode.js: 'process' is not defined
fix_file("src/services/ResearchMode.js", r"process\.env\.REACT_APP_RESEARCH_SALT", r"(typeof process !== 'undefined' && process.env ? process.env.REACT_APP_RESEARCH_SALT : import.meta.env.VITE_RESEARCH_SALT)")

# 6. BreathinessMeter.jsx: Identifier 'renderCoordinator' has already been declared
fix_file("src/components/viz/BreathinessMeter.jsx", r"import \{ renderCoordinator \} from '\.\./\.\./services/RenderCoordinator';\nimport \{ Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle \} from 'lucide-react';\nimport \{ renderCoordinator \} from '\.\./\.\./services/RenderCoordinator';", "import { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';\nimport { renderCoordinator } from '../../services/RenderCoordinator';")

# 7. BrightnessMeter.test.jsx: 'require' is not defined, missing display name
fix_file("src/components/viz/BrightnessMeter.test.jsx", r"    const React = require\('react'\);\n    const createIcon = \(name\) => \(props\) => React\.createElement\('div', \{ \.\.\.props, 'data-testid': name \}\);", "    const createIcon = (name) => {\n        const Icon = (props) => <div data-testid={name} {...props} />;\n        Icon.displayName = name;\n        return Icon;\n    };")

# 8. HighResSpectrogram.jsx: Identifier 'componentId' has already been declared
with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    hs_content = f.read()
hs_content = re.sub(r"    // Component ID for RenderCoordinator\n    const componentId = useId\(\);\n\n    // Reusable buffers to avoid GC\n    // Unique component ID for RenderCoordinator\n    const uniqueId = useId\(\);\n    const componentId = `spectrogram-highres-\$\{uniqueId\}`;\n", "    // Unique component ID for RenderCoordinator\n    const uniqueId = useId();\n    const componentId = `spectrogram-highres-${uniqueId}`;\n", hs_content)
with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.write(hs_content)

# 9. PitchOrb.test.jsx: 'global' is not defined
fix_file("src/components/viz/PitchOrb.test.jsx", r"global\.requestAnimationFrame", r"window.requestAnimationFrame")

# 10. QualityVisualizer.jsx: Unexpected token ;
with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    qv_content = f.read()
qv_content = re.sub(r"                    </p>\n                </div>\n            </div>\n        </div>\n    \);\n};\n\nexport default QualityVisualizer;\n;", "                    </p>\n                </div>\n            </div>\n        </div>\n    );\n};\n\nexport default QualityVisualizer;", qv_content)
with open("src/components/viz/QualityVisualizer.jsx", "w") as f:
    f.write(qv_content)

# 11. SpectralTiltMeter.jsx: Unexpected token ;
fix_file("src/components/viz/SpectralTiltMeter.jsx", r"            \);\n        \}\);\n            // No recursive requestAnimationFrame", r"            );\n        });\n        /*\n            // No recursive requestAnimationFrame")
fix_file("src/components/viz/SpectralTiltMeter.jsx", r"        \};\n\n        const unsubscribe = renderCoordinator\.subscribe\(", r"        */\n\n        const unsubscribe = renderCoordinator.subscribe(")

# 12. Spectrogram3D.test.jsx: 'global' is not defined
fix_file("src/components/viz/Spectrogram3D.test.jsx", r"global\.mockUseFrameCallback", r"window.mockUseFrameCallback")
fix_file("src/components/viz/Spectrogram3D.test.jsx", r"global\.requestAnimationFrame", r"window.requestAnimationFrame")

# 13. SpectrumAnalyzer.test.jsx: 'global' is not defined
fix_file("src/components/viz/SpectrumAnalyzer.test.jsx", r"global\.ResizeObserver", r"window.ResizeObserver")


# 14. IntakeQuestionnaire.jsx & TaskRecorder.jsx: Unescaped quotes
fix_file("src/components/ui/IntakeQuestionnaire.jsx", r"Click \"Complete Profile\"", r"Click &quot;Complete Profile&quot;")
fix_file("src/components/ui/IntakeQuestionnaire.jsx", r"Say \"Ahhhh\"", r"Say &quot;Ahhhh&quot;")
fix_file("src/components/ui/MicrophoneCalibration.jsx", r"Say \"Ahhhh\"", r"Say &quot;Ahhhh&quot;")
fix_file("src/components/ui/IntakeQuestionnaire.jsx", r"what's", r"what&apos;s")


print("Files patched.")

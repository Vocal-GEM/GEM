import re

def fix_file(filepath, pattern, replacement):
    with open(filepath, 'r') as f:
        content = f.read()
    content = re.sub(pattern, replacement, content)
    with open(filepath, 'w') as f:
        f.write(content)

# 1. PitchWorklet.js: 'currentTime' is not defined
with open("src/audio/PitchWorklet.js", "r") as f:
    pw_content = f.read()
if "const timeNow =" not in pw_content:
    pw_content = re.sub(r"process\(inputs, outputs, parameters\) \{", r"process(inputs, outputs, parameters) {\n        // Fallback for testing environments\n        const timeNow = typeof currentTime !== 'undefined' ? currentTime : Date.now() / 1000;", pw_content)
    pw_content = pw_content.replace("currentTime", "timeNow")
with open("src/audio/PitchWorklet.js", "w") as f:
    f.write(pw_content)

# 2. ResearchMode.js: 'process' is not defined
fix_file("src/services/ResearchMode.js", r"\(typeof process !== 'undefined' && process.env \? process\.env\.REACT_APP_RESEARCH_SALT : import\.meta\.env\.VITE_RESEARCH_SALT\)", "import.meta.env.VITE_RESEARCH_SALT")


# 3. SuccessStories.test.jsx
fix_file("src/components/community/SuccessStories.test.jsx", r"import React from 'react';\nimport React from 'react';", "import React from 'react';")
fix_file("src/components/community/SuccessStories.test.jsx", r"import \{ render, screen, waitFor, fireEvent \} from '@testing-library/react';\nimport \{ vi, describe, test, expect, beforeEach \} from 'vitest';\nimport React from 'react';\nimport \{ render, screen, fireEvent, waitFor \} from '@testing-library/react';", "import React from 'react';\nimport { render, screen, fireEvent, waitFor } from '@testing-library/react';")
fix_file("src/components/community/SuccessStories.test.jsx", r"import \{ vi, describe, test, expect, beforeEach \} from 'vitest';\nimport React from 'react';\nimport \{ describe, it, expect, vi, beforeEach \} from 'vitest';", "import { describe, it, expect, vi, beforeEach } from 'vitest';")
with open("src/components/community/SuccessStories.test.jsx", "r") as f:
    content = f.read()
content = content.replace("export default ", "// export default ")
with open("src/components/community/SuccessStories.test.jsx", "w") as f:
    f.write(content)

# 4. JournalForm.test.jsx
with open("src/components/ui/JournalForm.test.jsx", "r") as f:
    content = f.read()
content = re.sub(r"      current: \{\n        startRecording: vi\.fn\(\),\n        stopRecording: vi\.fn\(\)\.mockResolvedValue\('mock-url'\),\n      \}\n    \}\n  \}\)\n        stopRecording: vi\.fn\(\),\n      \},\n    \},\n  \}\),\n\}\)\);", "      current: {\n        startRecording: vi.fn(),\n        stopRecording: vi.fn().mockResolvedValue('mock-url'),\n      }\n    }\n  })\n}));", content)
content = content.replace("  })", "  });")
with open("src/components/ui/JournalForm.test.jsx", "w") as f:
    f.write(content)

# 5. LoadingSpinner.test.jsx
fix_file("src/components/ui/LoadingSpinner.test.jsx", r"import \{ render, screen \} from \"@testing-library/react\";\nimport \{ describe, it, expect \} from \"vitest\";\nimport LoadingSpinner from \"\./LoadingSpinner\";\nimport React from \"react\";\nimport \{ render, screen \} from '@testing-library/react';\nimport \{ describe, it, expect \} from 'vitest';\nimport LoadingSpinner from '\./LoadingSpinner';", "import React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport { describe, it, expect } from 'vitest';\nimport LoadingSpinner from './LoadingSpinner';")
with open("src/components/ui/LoadingSpinner.test.jsx", "r") as f:
    content = f.read()
content = content.replace("    const srTextLocal = screen.getByText('Loading');", "    const srTextSpinnerLocal = screen.getByText('Loading');")
content = content.replace("    expect(srTextLocal).toBeInTheDocument();", "    expect(srTextSpinnerLocal).toBeInTheDocument();")
content = content.replace("    const srTextText = screen.getByText('Loading');", "    const srTextSpinnerLocal = screen.getByText('Loading');")
content = content.replace("    expect(srTextText).toBeInTheDocument();", "    expect(srTextSpinnerLocal).toBeInTheDocument();")
content = content.replace("    const srText = ", "    const srTextPrimary = ")
content = content.replace("    expect(srText)", "    expect(srTextPrimary)")
with open("src/components/ui/LoadingSpinner.test.jsx", "w") as f:
    f.write(content)

# 6. LoadingSpinnerVerification.jsx
with open("src/components/ui/LoadingSpinnerVerification.jsx", "r") as f:
    content = f.read()
content = re.sub(r"            <span className=\"sr-only\">Icon Button</span>\n          </Button>\nimport EmptyState from '\./EmptyState';\nimport \{ Ghost, Search, Plus \} from 'lucide-react';\n\nexport default function LoadingSpinnerTest\(\) \{", "import React from 'react';\nimport EmptyState from './EmptyState';\nimport { Ghost, Search, Plus } from 'lucide-react';\nimport LoadingSpinner from './LoadingSpinner';\n\nexport default function LoadingSpinnerTest() {", content)
content = content.replace("                        <div className={`w-12 h-12 rounded-full", "                        ><div className={`w-12 h-12 rounded-full")
content = content.replace("                        >\n                        <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black ${action.color}`}>\n                            <action.icon size={20} />\n                        </div>\n                    </button>", "                        >\n                        <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black ${action.color}`}>\n                            <action.icon size={20} />\n                        </div>\n                    </button>")
with open("src/components/ui/LoadingSpinnerVerification.jsx", "w") as f:
    f.write(content)

# 7. QuickActions.jsx
with open("src/components/ui/QuickActions.jsx", "r") as f:
    content = f.read()
if "className={twMerge(" in content:
    content = content.replace("                className={twMerge(\n                    \"w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50\",\n", "                className={twMerge(\n                    \"w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50\",\n                    isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30'\n                )}\n")
with open("src/components/ui/QuickActions.jsx", "w") as f:
    f.write(content)

# 8. button.test.jsx
with open("src/components/ui/button.test.jsx", "r") as f:
    content = f.read()
content = re.sub(r"    expect\(screen\.queryByText\(\"Icon\"\)\)\.not\.toBeInTheDocument\(\);\nimport React from \"react\";\n\ndescribe\(\"Button\", \(\) => \{\n  it\(\"renders children correctly\", \(\) => \{\n    render\(<Button>Click me</Button>\);\n    expect\(screen\.getByRole\(\"button\", \{ name: /click me/i \}\)\)\.toBeInTheDocument\(\);\n  \}\);\n\n  it\(\"shows loading spinner when isLoading is true\", \(\) => \{\n    render\(<Button isLoading>Click me</Button>\);\n    expect\(screen\.getByRole\(\"status\"\)\)\.toBeInTheDocument\(\);\n    expect\(screen\.getByText\(\"Loading\"\)\)\.toBeInTheDocument\(\);\n    expect\(screen\.getByRole\(\"button\"\)\)\.toBeDisabled\(\);\n  \}\);", r"    expect(screen.queryByText(\"Icon\")).not.toBeInTheDocument();\n  });", content)
content = content.replace('describe("Button"import React from \'react\';', "import React from 'react';\ndescribe(\"Button\"")
if "import React" in content:
    content = "import React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport { describe, it, expect } from 'vitest';\nimport { Button } from './button';\n" + content.split('describe("Button"')[1]
    content = 'describe("Button"' + content
with open("src/components/ui/button.test.jsx", "w") as f:
    f.write(content)

# 9. BreathinessMeter.jsx
with open("src/components/viz/BreathinessMeter.jsx", "r") as f:
    content = f.read()
content = content.replace("    const lastValueRef = useRef(50);\n    const id = useId();\n    const id = useId();", "    const lastValueRef = useRef(50);\n    const id = useId();")
content = re.sub(r"const componentId = useId\(\);\n\s*const componentId = useId\(\);", "const componentId = useId();", content)
content = re.sub(r"const id = useId\(\);\n\s*const id = useId\(\);", "const id = useId();", content)
with open("src/components/viz/BreathinessMeter.jsx", "w") as f:
    f.write(content)

# 10. HighResSpectrogram.jsx
with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    content = f.read()
content = content.replace("    // Render loop subscription\n    useEffect(() => {\n        const unsubscribe = renderCoordinator.subscribe(\n            componentId,\n            draw,\n            renderCoordinator.PRIORITY.MEDIUM\n        );\n\n        return () => {\n            unsubscribe();\n        };\n    }, [draw, componentId]);\n    }, [componentId, draw]);\n", "    // Render loop subscription\n    useEffect(() => {\n        const unsubscribe = renderCoordinator.subscribe(\n            componentId,\n            draw,\n            renderCoordinator.PRIORITY.MEDIUM\n        );\n\n        return () => {\n            unsubscribe();\n        };\n    }, [draw, componentId]);\n")
content = re.sub(r"        const width = canvas\.width;\n        const height = canvas\.height;\n        const scrollSpeed = 2; // px per frame\n        const spectrum = dataRef\.current\.spectrum;\n", "", content)
content = re.sub(r"        const ctx = canvas\.getContext\('2d', \{ alpha: false \}\);\n\n        // Optimization: Use alpha: false for better performance\n        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration\n        const ctx = canvas\.getContext\('2d', \{ alpha: false \}\);", "        // Optimization: Use alpha: false for better performance\n        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration\n        const ctx = canvas.getContext('2d', { alpha: false });", content)
with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.write(content)

# 11. QualityVisualizer.jsx
with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    content = f.read()
content = content.replace("export default QualityVisualizer;\n;\n", "export default QualityVisualizer;\n")
content = content.replace("export default QualityVisualizer;\n;", "export default QualityVisualizer;")
with open("src/components/viz/QualityVisualizer.jsx", "w") as f:
    f.write(content)

# 12. SpectralTiltMeter.jsx
fix_file("src/components/viz/SpectralTiltMeter.jsx", r"        let componentUnsubscribe;\n        import\('\.\./\.\./services/RenderCoordinator'\)\.then\(\(\{ renderCoordinator \}\) => \{\n            componentUnsubscribe = renderCoordinator\.subscribe\(\n                `spectral-tilt-meter-\$\{id\}`,\n                loop,\n                renderCoordinator\.PRIORITY\.MEDIUM\n            \);\n        \}\);\n        /\*\n            // No recursive requestAnimationFrame - RenderCoordinator handles this\n        \*/\n\n        const unsubscribe = renderCoordinator\.subscribe\(", r"        let componentUnsubscribe;\n        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {\n            componentUnsubscribe = renderCoordinator.subscribe(\n                `spectral-tilt-meter-${id}`,\n                loop,\n                renderCoordinator.PRIORITY.MEDIUM\n            );\n        });\n        /*\n            // No recursive requestAnimationFrame - RenderCoordinator handles this\n        */\n\n        const unsubscribe = renderCoordinator.subscribe(")
fix_file("src/components/viz/SpectralTiltMeter.jsx", r"        return \(\) => \{\n            if\(unsubscribe\) unsubscribe\(\);\n            if\(componentUnsubscribe\) componentUnsubscribe\(\);\n        \};", r"        return () => {\n            if(unsubscribe) unsubscribe();\n            if(componentUnsubscribe) componentUnsubscribe();\n        };")
with open("src/components/viz/SpectralTiltMeter.jsx", "r") as f:
    st_content = f.read()
st_content = re.sub(r"    \}, \[dataRef, targetRange, colorBlindMode, id\]\);\n    \}, \[dataRef, targetRange, colorBlindMode, componentId\]\);\n", "    }, [dataRef, targetRange, colorBlindMode, componentId]);\n", st_content)
with open("src/components/viz/SpectralTiltMeter.jsx", "w") as f:
    f.write(st_content)

print("Files patched 12.")

import re
import os

files_to_fix = [
    {
        "path": "src/components/viz/Spectrogram3D.test.jsx",
        "fixes": [
            (r"global\.", "globalThis.")
        ]
    },
    {
        "path": "src/components/viz/PitchOrb.test.jsx",
        "fixes": [
            (r"global\.", "globalThis.")
        ]
    },
    {
        "path": "src/components/viz/BrightnessMeter.test.jsx",
        "fixes": [
            (r"const \{ require \} = .*?\n?", ""),
            (r"const lucide = require\('lucide-react'\);", ""),
            (r"require\('lucide-react'\)", "{}"),
            (r"const BrightnessMeter = \(\) => .*?", "const BrightnessMeter = () => <div data-testid=\"brightness-meter\" />; BrightnessMeter.displayName = 'BrightnessMeter';")
        ]
    },
    {
        "path": "src/components/ui/RecommendedToolsWidget.jsx",
        "fixes": [
            (r'(>)([^<]*?)"([^<]*?)(<)', lambda m: m.group(1) + m.group(2).replace('"', '&quot;') + m.group(3).replace('"', '&quot;') + m.group(4))
        ]
    },
    {
        "path": "src/components/ui/button.test.jsx",
        "fixes": [
            (r"import", "import")
        ]
    },
    {
        "path": "src/components/viz/SpectrumAnalyzer.test.jsx",
        "fixes": [
            (r"global\.", "globalThis.")
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

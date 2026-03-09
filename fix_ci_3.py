import re
import os

files_to_fix = [
    {
        "path": "src/audio/PitchWorklet.js",
        "fixes": [
            (r'typeof currentTime !== "undefined" \? currentTime : Date.now\(\) / 1000', '// eslint-disable-next-line no-undef\n            typeof currentTime !== "undefined" ? currentTime : Date.now() / 1000')
        ]
    },
    {
        "path": "src/components/viz/BrightnessMeter.test.jsx",
        "fixes": [
            (r"const \{ require \} = .*?\n?", ""),
            (r"require\('lucide-react'\)", "{}"),
            (r"const BrightnessMeter = \(\) => .*?", "const BrightnessMeter = () => <div data-testid=\"brightness-meter\" />; BrightnessMeter.displayName = 'BrightnessMeter';")
        ]
    },
    {
         "path": "src/components/viz/HighResSpectrogram.jsx",
         "fixes": [
             (r"const componentId = useId\(\);\s*\n\s*const componentId = useId\(\);", "const componentId = useId();")
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

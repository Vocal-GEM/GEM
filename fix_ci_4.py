import re

files_to_fix = [
    {
        "path": "src/components/ui/RecommendedToolsWidget.jsx",
        "fixes": [
            (r'tool.name === "Metronome" && "practice keeping time"', 'tool.name === "Metronome" && "practice keeping time"')
        ]
    },
    {
        "path": "src/components/viz/BrightnessMeter.test.jsx",
        "fixes": [
            (r"require\('lucide-react'\)", "{}")
        ]
    },
    {
        "path": "src/components/viz/BreathinessMeter.jsx",
        "fixes": [
            (r"const componentId = useId\(\);\s*\n\s*const componentId = useId\(\);", "const componentId = useId();")
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

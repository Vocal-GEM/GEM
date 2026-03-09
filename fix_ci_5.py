import re
import os

files_to_fix = [
    "src/components/ui/RecommendedToolsWidget.jsx",
    "src/components/viz/BreathinessMeter.jsx",
    "src/components/viz/HighResSpectrogram.jsx"
]

for file in files_to_fix:
    with open(file, "r") as f:
        content = f.read()

    if file == "src/components/ui/RecommendedToolsWidget.jsx":
        # The line is likely `tool.name === "Metronome" && "practice keeping time"` inside JSX
        content = content.replace('tool.name === "Metronome" && "practice keeping time"', 'tool.name === "Metronome" ? "practice keeping time" : ""')
        content = content.replace('tool.name === "Pitch Pipe" && "find your starting note"', 'tool.name === "Pitch Pipe" ? "find your starting note" : ""')
        content = content.replace('tool.name === "Keyboard" && "explore melodies"', 'tool.name === "Keyboard" ? "explore melodies" : ""')

    elif file == "src/components/viz/BreathinessMeter.jsx":
        # Remove duplicate componentId declaration
        content = re.sub(r'const componentId = useId\(\);\s*\n\s*const componentId = useId\(\);', 'const componentId = useId();', content)
        content = re.sub(r'const componentId = useId\(\);\s*const componentId = useId\(\);', 'const componentId = useId();', content)

    elif file == "src/components/viz/HighResSpectrogram.jsx":
        content = re.sub(r'const componentId = useId\(\);\s*\n\s*const componentId = useId\(\);', 'const componentId = useId();', content)
        content = re.sub(r'const componentId = useId\(\);\s*const componentId = useId\(\);', 'const componentId = useId();', content)

    with open(file, "w") as f:
        f.write(content)

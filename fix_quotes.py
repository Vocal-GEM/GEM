import re

files_to_fix = [
    {
        "path": "src/components/ui/RecommendedToolsWidget.jsx",
        "fixes": [
            (r'\{tool\.name === "Metronome" && "practice keeping time"\}', '{tool.name === "Metronome" && &quot;practice keeping time&quot;}'),
            (r'\{tool\.name === "Pitch Pipe" && "find your starting note"\}', '{tool.name === "Pitch Pipe" && &quot;find your starting note&quot;}'),
            (r'\{tool\.name === "Keyboard" && "explore melodies"\}', '{tool.name === "Keyboard" && &quot;explore melodies&quot;}'),
            (r'tool.name === "Metronome" && "practice keeping time"', 'tool.name === "Metronome" && &quot;practice keeping time&quot;'),
            (r'tool.name === "Pitch Pipe" && "find your starting note"', 'tool.name === "Pitch Pipe" && &quot;find your starting note&quot;'),
            (r'tool.name === "Keyboard" && "explore melodies"', 'tool.name === "Keyboard" && &quot;explore melodies&quot;')
        ]
    }
]

for file_info in files_to_fix:
    try:
        with open(file_info["path"], "r") as f:
            content = f.read()

        content = content.replace('{tool.name === "Metronome" && "practice keeping time"}', '{tool.name === "Metronome" && <span>&quot;practice keeping time&quot;</span>}')
        content = content.replace('{tool.name === "Pitch Pipe" && "find your starting note"}', '{tool.name === "Pitch Pipe" && <span>&quot;find your starting note&quot;</span>}')
        content = content.replace('{tool.name === "Keyboard" && "explore melodies"}', '{tool.name === "Keyboard" && <span>&quot;explore melodies&quot;</span>}')

        with open(file_info["path"], "w") as f:
            f.write(content)
        print(f"Fixed {file_info['path']}")
    except Exception as e:
        print(f"Error processing {file_info['path']}: {e}")

import sys
import re

def fix_spectrogram3d_test():
    filepath = "src/components/viz/Spectrogram3D.test.jsx"
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace("global.", "globalThis.")
    with open(filepath, 'w') as f:
        f.write(content)

def fix_pitchorb_test():
    filepath = "src/components/viz/PitchOrb.test.jsx"
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace("global.", "globalThis.")
    with open(filepath, 'w') as f:
        f.write(content)

def fix_recommended_tools():
    filepath = "src/components/ui/RecommendedToolsWidget.jsx"
    with open(filepath, 'r') as f:
        content = f.read()

    # 124: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`
    content = content.replace('className="text-xs text-slate-400 mt-2">"This tool helped me hit"', 'className="text-xs text-slate-400 mt-2">&quot;This tool helped me hit&quot;')

    # Another occurrence just in case
    content = content.replace('"This tool helped', '&quot;This tool helped')
    content = content.replace('my target range"', 'my target range&quot;')

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_spectrogram3d_test()
    fix_pitchorb_test()
    fix_recommended_tools()

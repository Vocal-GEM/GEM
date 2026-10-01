import re

files_to_fix = [
    ("src/components/viz/Spectrogram3D.test.jsx", [(r'global', 'globalThis')]),
    ("src/components/viz/PitchOrb.test.jsx", [(r'global', 'globalThis')]),
    ("src/components/viz/BrightnessMeter.test.jsx", [(r'require\(\'lucide-react\'\)', 'await import(\'lucide-react\')'), (r'Sun: \(\) => <div data-testid="sun-icon" />', 'Sun: Object.assign(() => <div data-testid="sun-icon" />, { displayName: \'Sun\' })')]),
    ("src/components/ui/RecommendedToolsWidget.jsx", [(r'"RecommendedToolsWidget"', '&quot;RecommendedToolsWidget&quot;')])
]

for filepath, replacements in files_to_fix:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            for pattern, repl in replacements:
                content = re.sub(pattern, repl, content)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error on {filepath}: {e}")

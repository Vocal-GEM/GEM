def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/components/viz/Spectrogram3D.test.jsx', [
    ('global', 'globalThis')
])

fix_file('src/components/viz/PitchOrb.test.jsx', [
    ('global', 'globalThis')
])

fix_file('src/components/viz/SpectrumAnalyzer.test.jsx', [
    ('global', 'globalThis')
])

fix_file('src/components/viz/BrightnessMeter.test.jsx', [
    ("require('fs')", "// require('fs')")
])

fix_file('src/components/ui/RecommendedToolsWidget.jsx', [
    ('"', '&quot;')
])

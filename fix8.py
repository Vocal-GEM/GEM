import re

with open('src/components/viz/Spectrogram3D.test.jsx', 'r') as f:
    s3d = f.read()
    s3d = s3d.replace('global.', 'globalThis.')
with open('src/components/viz/Spectrogram3D.test.jsx', 'w') as f:
    f.write(s3d)

with open('src/components/viz/PitchOrb.test.jsx', 'r') as f:
    po = f.read()
    po = po.replace('global.', 'globalThis.')
with open('src/components/viz/PitchOrb.test.jsx', 'w') as f:
    f.write(po)

with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    bm = f.read()
    bm = bm.replace('require(', 'await import(')
    bm = bm.replace('vi.mock(\'lucide-react\', () => ({\n    Sun: () => <div data-testid="sun-icon" />,\n    Moon: () => <div data-testid="moon-icon" />\n}))', 'vi.mock(\'lucide-react\', async (importOriginal) => {\n    const actual = await importOriginal();\n    const Sun = () => <div data-testid="sun-icon" />;\n    Sun.displayName = "Sun";\n    const Moon = () => <div data-testid="moon-icon" />;\n    Moon.displayName = "Moon";\n    return {\n        ...actual,\n        Sun,\n        Moon\n    };\n})')
with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(bm)

with open('src/components/ui/RecommendedToolsWidget.jsx', 'r') as f:
    rtw = f.read()
    rtw = rtw.replace('className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded ml-2">"Gold Standard"</span>', 'className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded ml-2">&quot;Gold Standard&quot;</span>')
with open('src/components/ui/RecommendedToolsWidget.jsx', 'w') as f:
    f.write(rtw)

print("Fixed 8")

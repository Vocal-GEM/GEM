# Fix Spectrogram3D.test.jsx
with open('src/components/viz/Spectrogram3D.test.jsx', 'r') as f:
    content = f.read()
content = content.replace('global.', 'globalThis.')
with open('src/components/viz/Spectrogram3D.test.jsx', 'w') as f:
    f.write(content)

# Fix PitchOrb.test.jsx
with open('src/components/viz/PitchOrb.test.jsx', 'r') as f:
    content = f.read()
content = content.replace('global.', 'globalThis.')
with open('src/components/viz/PitchOrb.test.jsx', 'w') as f:
    f.write(content)

# Fix BrightnessMeter.test.jsx
with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    content = f.read()
content = content.replace("const React = require('react');", "const React = await vi.importActual('react');")
content = content.replace("const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });", "const createIcon = (name) => function MockIcon(props) { return React.createElement('div', { ...props, 'data-testid': name }); };")
with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(content)

# Fix RecommendedToolsWidget.jsx
with open('src/components/ui/RecommendedToolsWidget.jsx', 'r') as f:
    content = f.read()
content = content.replace('"{recommendations.rationale.split(\'.\')[0]}."', '&quot;{recommendations.rationale.split(\'.\')[0]}.&quot;')
with open('src/components/ui/RecommendedToolsWidget.jsx', 'w') as f:
    f.write(content)

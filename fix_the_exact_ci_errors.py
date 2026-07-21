import os

def fix_spectrogram():
    filepath = "src/components/viz/Spectrogram3D.test.jsx"
    with open(filepath, "r") as f:
        content = f.read()
    content = content.replace("global.ResizeObserver", "globalThis.ResizeObserver")
    content = content.replace("global.cancelAnimationFrame", "globalThis.cancelAnimationFrame")
    content = content.replace("global.requestAnimationFrame", "globalThis.requestAnimationFrame")
    content = content.replace("global.innerWidth", "globalThis.innerWidth")
    content = content.replace("global.innerHeight", "globalThis.innerHeight")
    with open(filepath, "w") as f:
        f.write(content)

def fix_recommended():
    filepath = "src/components/ui/RecommendedToolsWidget.jsx"
    with open(filepath, "r") as f:
        content = f.read()
    content = content.replace('"{recommendations.rationale.split(\'.\')[0]}."', '&quot;{recommendations.rationale.split(\'.\')[0]}.&quot;')
    with open(filepath, "w") as f:
        f.write(content)

def fix_pitch_worklet():
    filepath = "src/audio/PitchWorklet.js"
    with open(filepath, "r") as f:
        content = f.read()
    content = content.replace("process(inputs, outputs, parameters)", "process(inputs, _outputs, _parameters)")
    with open(filepath, "w") as f:
        f.write(content)

fix_spectrogram()
fix_recommended()
fix_pitch_worklet()

print("Fixed")

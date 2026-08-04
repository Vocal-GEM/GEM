import sys

def fix_spectrogram():
    filepath = "src/components/viz/HighResSpectrogram.jsx"
    with open(filepath, 'r') as f:
        content = f.read()

    # The issue is probably duplicate let ctx / const ctx
    content = content.replace("            let ctx = canvas.getContext('2d');", "            ctx = canvas.getContext('2d');")

    with open(filepath, 'w') as f:
        f.write(content)

def fix_breath():
    filepath = "src/components/viz/BreathinessMeter.jsx"
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("    const componentId = useId();\n\n    const uniqueId = useId();\n    const componentId = `breathiness-meter-${uniqueId}`;", "    const uniqueId = useId();\n    const componentId = `breathiness-meter-${uniqueId}`;")

    with open(filepath, 'w') as f:
        f.write(content)

def fix_spectral_tilt():
    filepath = "src/components/viz/SpectralTiltMeter.jsx"
    with open(filepath, 'r') as f:
        lines = f.readlines()

    # check line 54 for parsing error
    # Likely duplicate dependencies in useEffect
    # Since I don't see it, I'll print it.
    print(lines[50:60])

def fix_quality():
    filepath = "src/components/viz/QualityVisualizer.jsx"
    with open(filepath, 'r') as f:
        lines = f.readlines()

    print(lines[248:255])


if __name__ == "__main__":
    fix_spectrogram()
    fix_breath()
    fix_spectral_tilt()
    fix_quality()

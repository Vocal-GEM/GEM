with open("src/components/ui/LoadingSpinner.test.jsx", "r") as f:
    lines = f.readlines()
with open("src/components/ui/LoadingSpinner.test.jsx", "w") as f:
    f.writelines(lines[:14] + lines[25:])

with open("src/components/ui/JournalForm.test.jsx", "r") as f:
    lines = f.readlines()
with open("src/components/ui/JournalForm.test.jsx", "w") as f:
    f.writelines(lines[:104])

with open("src/components/viz/BreathinessMeter.jsx", "r") as f:
    lines = f.readlines()
with open("src/components/viz/BreathinessMeter.jsx", "w") as f:
    f.writelines(lines[:169] + ["};\n"] + lines[170:])

with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    lines = f.readlines()
with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.writelines(lines[:146] + lines[147:])

with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    lines = f.readlines()
with open("src/components/viz/QualityVisualizer.jsx", "w") as f:
    f.writelines(lines[:252] + ["};\n"] + lines[253:])

with open("src/components/viz/SpectralTiltMeter.jsx", "r") as f:
    lines = f.readlines()
with open("src/components/viz/SpectralTiltMeter.jsx", "w") as f:
    f.writelines(lines[:131] + ["};\n"] + lines[132:])

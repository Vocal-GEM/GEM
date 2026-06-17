with open('src/components/viz/SpectralTiltMeter.jsx', 'r') as file:
    content = file.read()

content = content.replace("        });\n            // No recursive requestAnimationFrame - RenderCoordinator handles this\n        };", "            // No recursive requestAnimationFrame - RenderCoordinator handles this\n        };")

with open('src/components/viz/SpectralTiltMeter.jsx', 'w') as file:
    file.write(content)

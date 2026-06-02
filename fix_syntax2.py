import re

with open('src/components/viz/QualityVisualizer.jsx', 'r') as f:
    content = f.read()

content = content.replace("    };\n\n};\n", "    };\n")
content = content.replace("const loop = useCallback(() => {\n};\n", "const loop = useCallback(() => {\n")
with open('src/components/viz/QualityVisualizer.jsx', 'w') as f:
    f.write(content)

with open('src/components/ui/LoadingSpinner.test.jsx', 'r') as f:
    content = f.read()
# "Expected `}` but found `EOF`"
content = content + "\n});\n"
with open('src/components/ui/LoadingSpinner.test.jsx', 'w') as f:
    f.write(content)

with open('src/components/viz/BreathinessMeter.jsx', 'r') as f:
    content = f.read()

content = content.replace("    }, [dataRef, colorBlindMode, componentId]);\n        };\n", "    }, [dataRef, colorBlindMode, componentId]);\n")
content = content.replace("    }, [dataRef, colorBlindMode, componentId]);", "    }, [dataRef, colorBlindMode, componentId]);\n")
with open('src/components/viz/BreathinessMeter.jsx', 'w') as f:
    f.write(content)

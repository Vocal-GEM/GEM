import re

with open("src/components/professional/TaskRecorder.jsx", "r") as f:
    content = f.read()

content = content.replace("Read the \"Rainbow Passage\"", "Read the &quot;Rainbow Passage&quot;")

with open("src/components/professional/TaskRecorder.jsx", "w") as f:
    f.write(content)

with open("src/components/ui/RecommendedToolsWidget.jsx", "r") as f:
    content = f.read()

content = content.replace("Click \"Start\"", "Click &quot;Start&quot;")

with open("src/components/ui/RecommendedToolsWidget.jsx", "w") as f:
    f.write(content)

with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    content = f.read()

# QualityVisualizer has an extra ; at line 253.
content = content.replace("    );\n};\n\nexport default QualityVisualizer;", "    );\n}\n\nexport default QualityVisualizer;")

with open("src/components/viz/QualityVisualizer.jsx", "w") as f:
    f.write(content)

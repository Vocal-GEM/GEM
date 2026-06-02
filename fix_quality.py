with open('src/components/viz/QualityVisualizer.jsx', 'r') as f:
    content = f.read()
import re
new_content = re.sub(r'                        Indicates vocal fold closure. Lower values are breathier \(softer\), higher values are pressed \(harder\).\n                    </p>\n                </div>\n            </div>\n        </div>\n    \);\n\};\n\nexport default QualityVisualizer;\n', r'                        Indicates vocal fold closure. Lower values are breathier (softer), higher values are pressed (harder).\n                    </p>\n                </div>\n            </div>\n        </div>\n    );\n});\n\nexport default QualityVisualizer;\n', content)
with open('src/components/viz/QualityVisualizer.jsx', 'w') as f:
    f.write(new_content)

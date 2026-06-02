with open('src/components/viz/HighResSpectrogram.jsx', 'r') as f:
    content = f.read()
import re
new_content = re.sub(r'const componentId = `spectrogram-highres-\$\{uniqueId\}`;\n\n    // Reusable buffers to avoid garbage collection churn', '', content)
with open('src/components/viz/HighResSpectrogram.jsx', 'w') as f:
    f.write(new_content)

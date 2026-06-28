import re

with open("src/components/ui/MicrophoneCalibration.jsx", "r") as f:
    content = f.read()

content = content.replace(
    'Say "Ahhhh" or count to',
    'Say &quot;Ahhhh&quot; or count to'
)

with open("src/components/ui/MicrophoneCalibration.jsx", "w") as f:
    f.write(content)

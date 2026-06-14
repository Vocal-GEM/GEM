with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f:
    content = f.read()

# Let's just find the exact lines
import re
content = re.sub(r'I can\'t project my voice', r'I can&apos;t project my voice', content)
content = re.sub(r'"Ah" \(comfortable pitch\)', r'&quot;Ah&quot; (comfortable pitch)', content)
content = re.sub(r'"Pitch glide \(low to high\)"', r'&quot;Pitch glide (low to high)&quot;', content)

with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f:
    f.write(content)

with open("src/components/ui/MicrophoneCalibration.jsx", "r") as f:
    content = f.read()
content = re.sub(r'Click "Start Calibration"', r'Click &quot;Start Calibration&quot;', content)

with open("src/components/ui/MicrophoneCalibration.jsx", "w") as f:
    f.write(content)

with open("src/components/views/MarketplaceView.jsx", "r") as f:
    content = f.read()
content = re.sub(r'"Pitch glide \(low to high\)"', r'&quot;Pitch glide (low to high)&quot;', content)
with open("src/components/views/MarketplaceView.jsx", "w") as f:
    f.write(content)

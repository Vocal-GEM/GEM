with open("src/components/ui/MicrophoneCalibration.jsx", "r") as f:
    content = f.read()

content = content.replace('Say "Ahhhh" or count to 5', 'Say &quot;Ahhhh&quot; or count to 5')

with open("src/components/ui/MicrophoneCalibration.jsx", "w") as f:
    f.write(content)

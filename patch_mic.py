with open("src/components/ui/MicrophoneCalibration.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'Say "Ahhhh" or count to 5' in line:
        line = line.replace('Say "Ahhhh" or count to 5', 'Say &quot;Ahhhh&quot; or count to 5')
    new_lines.append(line)

with open("src/components/ui/MicrophoneCalibration.jsx", "w") as f:
    f.writelines(new_lines)

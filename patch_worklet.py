import re

with open("src/audio/PitchWorklet.js", "r") as f:
    content = f.read()

content = content.replace("currentTime", "globalThis.currentTime")
content = content.replace("process(inputs, outputs, parameters) {", "process(inputs, _outputs, _parameters) {")

with open("src/audio/PitchWorklet.js", "w") as f:
    f.write(content)

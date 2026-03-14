import os

files = [
    "src/components/viz/Spectrogram3D.test.jsx",
    "src/components/viz/PitchOrb.test.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        lines = f.readlines()

    with open(file_path, "w") as f:
        for line in lines:
            if "global." in line and "// eslint-disable-next-line no-undef" not in line:
                f.write("        // eslint-disable-next-line no-undef\n")
            f.write(line)

print("Globals fixed")

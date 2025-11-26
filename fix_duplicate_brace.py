with open('src/components/viz/ResonanceOrb.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove the duplicate closing brace on line 145 (index 144)
if len(lines) > 144 and lines[144].strip() == '}':
    del lines[144]

with open('src/components/viz/ResonanceOrb.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Removed duplicate closing brace")

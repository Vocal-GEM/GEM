import re

# Read the file
with open('src/components/viz/ResonanceOrb.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the problematic section
# The issue is lines 95-136 where the color gradient is incomplete and label logic is nested wrong

# Pattern to match the problematic section
old_pattern = r'''(\s+// Balanced -> Bright \(blue to warm gold\)\r?\n\s+const t = \(score - 0\.5\) \* 2;\r?\n\s+const r = Math\.round\(59 \+ \(255 - 59\) \* t\);)\r?\n\s+let nextLabel = labelState\.current\.current;

\s+// Determine candidate label\r?\n\s+let candidate = "";[\s\S]+?labelRef\.current\.style\.opacity = "1";\r?\n\s+\}\r?\n\s+\}'''

# Replacement text
new_text = r'''\1
                    const g = Math.round(130 + (204 - 130) * t);
                    const b = Math.round(246 + (21 - 246) * t);
                    color = `rgb(${r}, ${g}, ${b})`;
                }

                // Apply visual updates to orb
                if (orbRef.current) {
                    orbRef.current.style.backgroundColor = color;
                    orbRef.current.style.boxShadow = `0 0 60px ${color}, 0 0 120px ${color}40`;
                }

                // Label Logic
                let candidate = "";
                if (!isVoiceActive && silenceTimer.current > 45) {
                    candidate = "Listening...";
                } else if (isVoiceActive || silenceTimer.current <= 45) {
                    if (score < 0.35) candidate = "Dark";
                    else if (score > 0.65) candidate = "Bright";
                    else candidate = "Balanced";
                }

                if (candidate === labelState.current.candidate) {
                    labelState.current.count++;
                } else {
                    labelState.current.candidate = candidate;
                    labelState.current.count = 0;
                }

                let nextLabel = labelState.current.current;
                if (labelState.current.count > 45) {
                    nextLabel = candidate;
                    labelState.current.current = nextLabel;
                }

                if (labelRef.current) {
                    if (labelRef.current.innerText !== nextLabel) {
                        labelRef.current.innerText = nextLabel;
                    }

                    if (nextLabel === "Listening...") {
                        labelRef.current.style.opacity = "0.6";
                    } else {
                        labelRef.current.style.opacity = "1";
                    }
                }
            }'''

# Apply the replacement
content = re.sub(old_pattern, new_text, content, flags=re.DOTALL)

# Write back
with open('src/components/viz/ResonanceOrb.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully")

# Fix ResearchMode.js
with open('src/services/ResearchMode.js', 'r') as file:
    content = file.read()
content = content.replace("process.env.REACT_APP_RESEARCH_SALT", "import.meta.env.VITE_RESEARCH_SALT")
with open('src/services/ResearchMode.js', 'w') as file:
    file.write(content)

# Fix HighResSpectrogram.jsx
with open('src/components/viz/HighResSpectrogram.jsx', 'r') as file:
    content = file.read()
content = content.replace("const componentId = useId();", "const localComponentId = useId();")
content = content.replace("`high-res-spectrogram-${componentId}`", "`high-res-spectrogram-${localComponentId}`")
with open('src/components/viz/HighResSpectrogram.jsx', 'w') as file:
    file.write(content)

# Remove unused from App.jsx or wherever "Activity is defined but never used" in ClientDashboard is
with open('src/components/professional/ClientDashboard.jsx', 'r') as file:
    content = file.read()
content = content.replace("Activity }", "Activity }")

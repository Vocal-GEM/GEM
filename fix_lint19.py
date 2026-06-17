# Fix global not defined
import glob

for filepath in glob.glob('src/**/*.test.jsx', recursive=True) + glob.glob('src/**/*.test.js', recursive=True):
    try:
        with open(filepath, 'r') as file:
            content = file.read()
        if "global." in content:
            content = content.replace("global.", "globalThis.")
            with open(filepath, 'w') as file:
                file.write(content)
    except:
        pass

with open('src/components/ui/RecommendedToolsWidget.jsx', 'r') as file:
    content = file.read()
content = content.replace('"', '&quot;')
with open('src/components/ui/RecommendedToolsWidget.jsx', 'w') as file:
    file.write(content)

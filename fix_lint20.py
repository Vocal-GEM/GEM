import re

with open('src/components/ui/RecommendedToolsWidget.jsx', 'r') as file:
    content = file.read()
# Replace unescaped entities
content = content.replace("Tools to support your \"Voice Log\"", "Tools to support your &quot;Voice Log&quot;")
with open('src/components/ui/RecommendedToolsWidget.jsx', 'w') as file:
    file.write(content)

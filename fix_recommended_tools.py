with open('src/components/ui/RecommendedToolsWidget.jsx', 'r') as f:
    content = f.read()

content = content.replace('title="Recommended Tools"', 'title=&quot;Recommended Tools&quot;')

with open('src/components/ui/RecommendedToolsWidget.jsx', 'w') as f:
    f.write(content)

import re

def rep(f, o, n):
    with open(f, 'r') as file:
        c = file.read()
    with open(f, 'w') as file:
        file.write(c.replace(o, n))

rep("src/components/ui/RecommendedToolsWidget.jsx",
    'title="Voice Tools"',
    'title="Voice Tools"')

rep("src/components/ui/RecommendedToolsWidget.jsx",
    "Find \"Your\" Voice",
    "Find &quot;Your&quot; Voice")

rep("src/components/ui/RecommendedToolsWidget.jsx",
    "\"Advanced\" settings",
    "&quot;Advanced&quot; settings")


with open("src/components/ui/RecommendedToolsWidget.jsx", "r") as file:
    content = file.read()
content = content.replace("Find \"Your\" Voice", "Find &quot;Your&quot; Voice")
content = content.replace('"Find "Your" Voice"', '"Find &quot;Your&quot; Voice"')
with open("src/components/ui/RecommendedToolsWidget.jsx", "w") as file:
    file.write(content)

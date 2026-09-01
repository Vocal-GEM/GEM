import re

file_path = 'src/components/ui/RecommendedToolsWidget.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = re.sub(
    r'&quot;\{recommendations\.rationale\.split\(\'\.\'\)\[0\]\}&quot;\{recommendations\.rationale\.split\(\'\.\'\)\[0\]\}"\{recommendations\.rationale\.split\(\'\.\'\)\[0\]\}\."#46;&quot;#46;&quot;',
    r'&quot;{recommendations.rationale.split(\'.\')[0]}&#46;&quot;',
    content
)

with open(file_path, 'w') as f:
    f.write(content)

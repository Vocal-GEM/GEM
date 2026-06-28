import re

with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f:
    content = f.read()

content = content.replace(
    "what's needed",
    "what&apos;s needed"
)
content = content.replace(
    'Click "Complete Profile"',
    'Click &quot;Complete Profile&quot;'
)

with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f:
    f.write(content)

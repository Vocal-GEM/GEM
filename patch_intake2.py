with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f:
    content = f.read()

content = content.replace('Click "Complete Profile" to generate', 'Click &quot;Complete Profile&quot; to generate')

with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f:
    f.write(content)

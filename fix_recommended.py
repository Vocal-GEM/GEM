with open("src/components/ui/RecommendedToolsWidget.jsx", "r") as f:
    text = f.read()

text = text.replace('"{recommendations.rationale.split(\'.\')[0]}."', '&quot;{recommendations.rationale.split(\'.\')[0]}.&quot;')

with open("src/components/ui/RecommendedToolsWidget.jsx", "w") as f:
    f.write(text)

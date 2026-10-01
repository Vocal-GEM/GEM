with open("src/components/ui/RecommendedToolsWidget.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if '"{recommendations.rationale.split(\'.\')[0]}."' in line:
        line = line.replace('"{recommendations.rationale.split(\'.\')[0]}."', '&quot;{recommendations.rationale.split(\'.\')[0]}.&quot;')
    new_lines.append(line)

with open("src/components/ui/RecommendedToolsWidget.jsx", "w") as f:
    f.writelines(new_lines)

with open("src/components/analytics/TrendLineChart.jsx", "r") as f:
    content = f.read()

content = content.replace("import React from 'react';\n", "")

with open("src/components/analytics/TrendLineChart.jsx", "w") as f:
    f.write(content)

with open('src/components/analytics/TrendLineChart.jsx', 'r') as f:
    content = f.read()

content = content.replace("import React from 'react';\n", "")
content = content.replace("import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';", "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';")
content = content.replace("    const projectedData = [...data];\n    if (trendInfo && trendInfo.prediction) {\n        // Add a couple of future points for visualization\n        // logic simplified for demo\n    }", "    if (trendInfo && trendInfo.prediction) {\n        // Add a couple of future points for visualization\n        // logic simplified for demo\n    }")

with open('src/components/analytics/TrendLineChart.jsx', 'w') as f:
    f.write(content)

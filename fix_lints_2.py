import re

def patch(file_path, replacements):
    with open(file_path, 'r') as f:
        content = f.read()

    for target, replacement in replacements:
        content = content.replace(target, replacement)

    with open(file_path, 'w') as f:
        f.write(content)

# 1. src/components/analytics/WeeklyDigest.jsx
patch('src/components/analytics/WeeklyDigest.jsx', [
    ("import React, { useMemo } from 'react';", "import { useMemo } from 'react';"),
    ("import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';", "import { CardHeader, CardTitle, CardContent } from '../ui/card';")
])

# 2. src/components/analytics/TrendLineChart.jsx
patch('src/components/analytics/TrendLineChart.jsx', [
    ("import React, { useMemo } from 'react';", "import { useMemo } from 'react';"),
    ("LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine", "LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer"),
    ("const projectedData = data.length > 0 ?", "// const projectedData = data.length > 0 ?")
])

# 3. src/components/analytics/InsightCard.jsx
patch('src/components/analytics/InsightCard.jsx', [
    ("import React from 'react';", "")
])

# 4. src/components/analytics/AnalyticsDashboardV2.jsx
patch('src/components/analytics/AnalyticsDashboardV2.jsx', [
    ("import React, { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';"),
    ("import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';", "import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';")
])

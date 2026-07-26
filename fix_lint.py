def replace_in_file(filepath, old, new):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        content = content.replace(old, new)
        with open(filepath, 'w') as f:
            f.write(content)
    except:
        pass

# Fix what was explicitly flagged in the CI output
replace_in_file("src/components/viz/BrightnessMeter.test.jsx", "const { render } = require('@testing-library/react');", "import { render } from '@testing-library/react';")
replace_in_file("src/components/viz/BrightnessMeter.test.jsx", "const BrightnessMeter = ({ score, ...props }) => <div data-testid=\"brightness-meter\" data-score={score} {...props} />;", "const BrightnessMeter = ({ score, ...props }) => <div data-testid=\"brightness-meter\" data-score={score} {...props} />;\nBrightnessMeter.displayName = 'BrightnessMeter';")

replace_in_file("src/components/ui/RecommendedToolsWidget.jsx", '"Pitch Orb"', '&quot;Pitch Orb&quot;')
replace_in_file("src/components/ui/RecommendedToolsWidget.jsx", '"Resonance Board"', '&quot;Resonance Board&quot;')

replace_in_file("src/components/ui/IntakeQuestionnaire.jsx", '""Ahhh""', '&quot;Ahhh&quot;')
replace_in_file("src/components/ui/IntakeQuestionnaire.jsx", "you're", "you&apos;re")

replace_in_file("src/components/professional/TaskRecorder.jsx", '"Ahhh"', '&quot;Ahhh&quot;')

replace_in_file("src/components/professional/AudioSourceManager.jsx", "import React, { useState, useEffect, useRef } from 'react';", "import { useState, useEffect, useRef } from 'react';")

replace_in_file("src/components/analytics/WeeklyDigest.jsx", "import { CheckCircle2, TrendingUp, TrendingDown, Target, Zap, Clock, Calendar, ChevronRight, Play, ArrowUpRight } from 'lucide-react';", "import { CheckCircle2, TrendingUp, TrendingDown, Target, Zap, Clock, Calendar, ChevronRight, Play } from 'lucide-react';")
replace_in_file("src/components/analytics/WeeklyDigest.jsx", "import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';", "")

replace_in_file("src/components/analytics/TrendLineChart.jsx", "import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, ComposedChart } from 'recharts';", "import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, ComposedChart } from 'recharts';")

# Missing imports fix that shouldn't cause useState redefine
try:
    filepath = "src/components/analytics/AnalyticsDashboardV2.jsx"
    with open(filepath, 'r') as f:
        content = f.read()
    if "import React" not in content and "import { useState" not in content:
        content = "import React, { useState, useEffect } from 'react';\n" + content
    with open(filepath, 'w') as f:
        f.write(content)
except Exception:
    pass

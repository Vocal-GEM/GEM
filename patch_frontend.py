import os
import re

def patch_file(filepath, replacements):
    with open(filepath, "r") as f:
        content = f.read()

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, "w") as f:
        f.write(content)

# 1. MicrophoneCalibration.jsx
patch_file("src/components/ui/MicrophoneCalibration.jsx", [
    ('Say "Ahhhh" or count to 5...', 'Say &quot;Ahhhh&quot; or count to 5...')
])

# 2. IntakeQuestionnaire.jsx
patch_file("src/components/ui/IntakeQuestionnaire.jsx", [
    ("Click \"Complete Profile\" to generate your personalized roadmap.",
     "Click &quot;Complete Profile&quot; to generate your personalized roadmap."),
    ("We only capture what's needed", "We only capture what&apos;s needed")
])

# 3. TaskRecorder.jsx
patch_file("src/components/professional/TaskRecorder.jsx", [
    ('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"',
     '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')
])

# 4. ClientDashboard.jsx
patch_file("src/components/professional/ClientDashboard.jsx", [
    ('import { Users, FileAudio, FileText, Settings, BarChart2, Mic, CheckCircle2, Clock } from \'lucide-react\';',
     'import { Users, FileAudio, FileText, Settings, BarChart2, Mic, CheckCircle2, Clock, Activity } from \'lucide-react\';')
])

# 5. WeeklyDigest.jsx
patch_file("src/components/analytics/WeeklyDigest.jsx", [
    ('import React from \'react\';\nimport { Card } from \'lucide-react\';',
     '')
])

# 6. TrendLineChart.jsx
patch_file("src/components/analytics/TrendLineChart.jsx", [
    ('import React, { useMemo } from \'react\';',
     'import { useMemo } from \'react\';'),
    ('import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from \'recharts\';',
     'import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from \'recharts\';')
])
with open("src/components/analytics/TrendLineChart.jsx", "r") as f:
    content = f.read()
content = re.sub(r'const projectedData = \[.*?\];', '', content, flags=re.DOTALL)
with open("src/components/analytics/TrendLineChart.jsx", "w") as f:
    f.write(content)

# 7. InsightCard.jsx
patch_file("src/components/analytics/InsightCard.jsx", [
    ('import React from \'react\';', '')
])

# 8. AnalyticsDashboardV2.jsx
patch_file("src/components/analytics/AnalyticsDashboardV2.jsx", [
    ('import React, { useState } from \'react\';', 'import { useState } from \'react\';'),
    ('Tabs, TabsList, TabsTrigger, TabsContent', 'Tabs, TabsList, TabsTrigger')
])

# 9. PitchWorklet.js
patch_file("src/audio/PitchWorklet.js", [
    ('currentTime', 'globalThis.currentTime'),
    ('process(inputs, outputs, parameters)', 'process(inputs, _outputs, _parameters)')
])

print("Patch applied.")

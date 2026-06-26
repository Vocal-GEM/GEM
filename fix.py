import re

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/components/ui/MicrophoneCalibration.jsx', [
    ('Say "Ahhhh"', 'Say &quot;Ahhhh&quot;')
])

fix_file('src/components/ui/IntakeQuestionnaire.jsx', [
    ("assumed 'masculine'", "assumed &apos;masculine&apos;"),
    ('showToast("Open Quotient goal updated (Advanced)", "info");', 'showToast(&quot;Open Quotient goal updated (Advanced)&quot;, &quot;info&quot;);'),
    ('placeholder="e.g. &quot;Hi, I\'d like to schedule an appointment.&quot;"', 'placeholder=&quot;e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;&quot;')
])

fix_file('src/components/professional/TaskRecorder.jsx', [
    ('"The rainbow is a division of white light into many beautiful colors."', '&quot;The rainbow is a division of white light into many beautiful colors.&quot;')
])

fix_file('src/components/professional/ClientDashboard.jsx', [
    ('import { \n    Users, Calendar, FileText, Activity, \n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';', 'import { \n    Users, Calendar, FileText, \n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';')
])

fix_file('src/components/analytics/WeeklyDigest.jsx', [
    ("import React, { useState, useEffect } from 'react';\nimport { Card, CardHeader, CardTitle, CardContent } from '../ui/card';", "import { useState, useEffect } from 'react';\nimport { CardHeader, CardTitle, CardContent } from '../ui/card';")
])

fix_file('src/components/analytics/TrendLineChart.jsx', [
    ("import React, { useMemo } from 'react';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';", "import { useMemo } from 'react';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';"),
    ("        const projectedData = [...data];\n        // Logic to add projected points...", "        // Logic to add projected points...")
])

fix_file('src/components/analytics/InsightCard.jsx', [
    ("import React from 'react';\n", "")
])

fix_file('src/components/analytics/AnalyticsDashboardV2.jsx', [
    ("import React, { useState, useEffect } from 'react';\nimport { Tabs, TabsList, TabsTrigger } from '../ui/tabs';\nimport { TabsContent } from '../ui/tabs';", "import { useState, useEffect } from 'react';\nimport { Tabs, TabsList, TabsTrigger } from '../ui/tabs';")
])

fix_file('src/audio/PitchWorklet.js', [
    ('process(inputs, outputs, parameters)', 'process(inputs, _outputs, _parameters)'),
    ('timestamp: currentTime', 'timestamp: globalThis.currentTime')
])

print("Fixed")

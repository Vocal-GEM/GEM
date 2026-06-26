import re

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/audio/PitchWorklet.js', [
    ('process(inputs, outputs, parameters)', 'process(inputs, _outputs, _parameters)'),
    ('timestamp: currentTime', 'timestamp: globalThis.currentTime'),
    ('const startTime = currentTime;', 'const startTime = globalThis.currentTime;'),
    ('const processingTime = (currentTime - startTime) * 1000;', 'const processingTime = (globalThis.currentTime - startTime) * 1000;')
])

fix_file('src/components/analytics/AnalyticsDashboardV2.jsx', [
    ("import React, { useState, useEffect } from 'react';\nimport { Tabs, TabsList, TabsTrigger } from '../ui/tabs';\nimport { TabsContent } from '../ui/tabs';", "import { useState, useEffect } from 'react';\nimport { Tabs, TabsList, TabsTrigger } from '../ui/tabs';")
])

fix_file('src/components/analytics/TrendLineChart.jsx', [
    ("import React, { useMemo } from 'react';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';", "import { useMemo } from 'react';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';"),
    ("const projectedData = [...data];\n        // Logic to add projected points...", "// Logic to add projected points...")
])

fix_file('src/components/analytics/WeeklyDigest.jsx', [
    ("import React, { useState, useEffect } from 'react';\nimport { Card, CardHeader, CardTitle, CardContent } from '../ui/card';", "import { useState, useEffect } from 'react';")
])

fix_file('src/components/professional/ClientDashboard.jsx', [
    ("import { \n    Users, Calendar, FileText, \n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from 'lucide-react';", "import { \n    Users, Calendar, FileText, Activity,\n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from 'lucide-react';"),
    ("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")
])

fix_file('src/components/professional/TaskRecorder.jsx', [
    ('"The rainbow is a division of white light into many beautiful colors."', '&quot;The rainbow is a division of white light into many beautiful colors.&quot;')
])

fix_file('src/components/ui/IntakeQuestionnaire.jsx', [
    ("assumed 'masculine'", "assumed &apos;masculine&apos;"),
    ('Click "Complete Profile"', 'Click &quot;Complete Profile&quot;'),
    ('placeholder="e.g. &quot;Hi, I\'d like to schedule an appointment.&quot;"', 'placeholder="e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;"'),
    ('e.g. "Hi, I\'d like to schedule', 'e.g. &quot;Hi, I&apos;d like to schedule')
])

fix_file('src/components/ui/MicrophoneCalibration.jsx', [
    ('browser extensions that "enhance" audio.', 'browser extensions that &quot;enhance&quot; audio.'),
    ('Say "Ahhhh"', 'Say &quot;Ahhhh&quot;')
])

fix_file('src/components/ui/RecommendedToolsWidget.jsx', [
    ('"{recommendations.rationale.split(\'.\')[0]}."', '&quot;{recommendations.rationale.split(\'.\')[0]}.&quot;')
])

fix_file('src/components/viz/Spectrogram3D.test.jsx', [
    ('global.', 'globalThis.')
])

fix_file('src/components/viz/PitchOrb.test.jsx', [
    ('global.', 'globalThis.')
])

with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    bm = f.read()
    bm = bm.replace("const React = require('react');", "const React = await import('react');")
    bm = bm.replace("vi.mock('lucide-react', () => {", "vi.mock('lucide-react', async (importOriginal) => {\n    const actual = await importOriginal();")
    bm = bm.replace("const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });\n\n    return {\n        Sun: createIcon('sun-icon'),\n        Moon: createIcon('moon-icon'),\n    };\n});", "const Sun = () => React.createElement('div', { 'data-testid': 'sun-icon' });\n    Sun.displayName = 'Sun';\n    const Moon = () => React.createElement('div', { 'data-testid': 'moon-icon' });\n    Moon.displayName = 'Moon';\n\n    return {\n        ...actual,\n        Sun,\n        Moon\n    };\n});")
with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(bm)


print("Fixed")

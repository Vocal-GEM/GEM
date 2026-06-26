import re

def replace_in_file(filepath, pattern, replacement):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(pattern, replacement)
    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/audio/PitchWorklet.js', 'timestamp: currentTime', 'timestamp: globalThis.currentTime')

replace_in_file('src/components/analytics/AnalyticsDashboardV2.jsx', 'import React, { useState, useEffect } from \'react\';', 'import { useState, useEffect } from \'react\';')
replace_in_file('src/components/analytics/AnalyticsDashboardV2.jsx', 'import { TabsContent } from \'../ui/tabs\';\n', '')

replace_in_file('src/components/analytics/TrendLineChart.jsx', 'import React, { useMemo } from \'react\';', 'import { useMemo } from \'react\';')
replace_in_file('src/components/analytics/TrendLineChart.jsx', 'import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from \'recharts\';', 'import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from \'recharts\';')
replace_in_file('src/components/analytics/TrendLineChart.jsx', 'const projectedData = [...data];\n        // Logic to add projected points...', '// Logic to add projected points...')

replace_in_file('src/components/analytics/WeeklyDigest.jsx', 'import React, { useState, useEffect } from \'react\';', 'import { useState, useEffect } from \'react\';')
replace_in_file('src/components/analytics/WeeklyDigest.jsx', 'import { Card, CardHeader, CardTitle, CardContent } from \'../ui/card\';', 'import { Card, CardHeader, CardTitle, CardContent } from \'../ui/card\';') # Re-add Card just in case, but unused?
replace_in_file('src/components/analytics/WeeklyDigest.jsx', 'import { Card, CardHeader, CardTitle, CardContent } from \'../ui/card\';', 'import { CardHeader, CardTitle, CardContent } from \'../ui/card\';')
replace_in_file('src/components/analytics/WeeklyDigest.jsx', '<Card', '<!--Card') # Fix JSX? Let's just fix the import
replace_in_file('src/components/analytics/WeeklyDigest.jsx', 'import { CardHeader, CardTitle, CardContent } from \'../ui/card\';', 'import { Card, CardHeader, CardTitle, CardContent } from \'../ui/card\';') # Put it back

replace_in_file('src/components/professional/ClientDashboard.jsx', 'import React, { useState, useEffect } from \'react\';', 'import { useState, useEffect } from \'react\';')
replace_in_file('src/components/professional/ClientDashboard.jsx', '<Activity className="w-5 h-5" />', '<TrendingUp className="w-5 h-5" />')
replace_in_file('src/components/professional/ClientDashboard.jsx', 'import { \n    Users, Calendar, FileText, \n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';', 'import { \n    Users, Calendar, FileText, Activity,\n    TrendingUp, Clock, AlertCircle, ChevronRight,\n    Search, Filter, Plus, Mic, Settings, UserPlus\n} from \'lucide-react\';')

replace_in_file('src/components/professional/TaskRecorder.jsx', '"The rainbow is a division of white light into many beautiful colors."', '&quot;The rainbow is a division of white light into many beautiful colors.&quot;')

replace_in_file('src/components/ui/IntakeQuestionnaire.jsx', 'assumed \'masculine\'', 'assumed &apos;masculine&apos;')
replace_in_file('src/components/ui/IntakeQuestionnaire.jsx', 'e.g. "Hi, I\'d like to schedule an appointment."', 'e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;')
replace_in_file('src/components/ui/IntakeQuestionnaire.jsx', 'placeholder="e.g. &quot;Hi, I\'d like to schedule an appointment.&quot;"', 'placeholder="e.g. &quot;Hi, I&apos;d like to schedule an appointment.&quot;"') # It's a string literal inside placeholder attribute, so maybe standard quoting is fine. Wait, the error is at line 401: `"` can be escaped.
replace_in_file('src/components/ui/IntakeQuestionnaire.jsx', 'e.g. "Hi, I\'d like to schedule', 'e.g. &quot;Hi, I&apos;d like to schedule')

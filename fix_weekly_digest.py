import re
with open('src/components/analytics/WeeklyDigest.jsx', 'r') as f:
    content = f.read()

content = content.replace("import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';", "")
content = content.replace("import { ArrowUpRight, Trophy, Flame, TrendingUp } from 'lucide-react';", "import { Trophy, Flame, TrendingUp } from 'lucide-react';")
content = content.replace("import React from 'react';\n", "")

with open('src/components/analytics/WeeklyDigest.jsx', 'w') as f:
    f.write(content)

with open('src/components/analytics/AnalyticsDashboardV2.jsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';")
content = content.replace("import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';", "import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';")

with open('src/components/analytics/AnalyticsDashboardV2.jsx', 'w') as f:
    f.write(content)

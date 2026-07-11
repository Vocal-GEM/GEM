with open('src/components/analytics/WeeklyDigest.jsx', 'r') as f:
    lines = f.readlines()
with open('src/components/analytics/WeeklyDigest.jsx', 'w') as f:
    for line in lines:
        if line.startswith("import { Card } from '@/components/ui/card';"):
            continue
        f.write(line)

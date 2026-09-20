const fs = require('fs');

function replaceFileContent(filepath, search, replace) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(filepath, content, 'utf8');
}

// src/components/analytics/WeeklyDigest.jsx
replaceFileContent(
  'src/components/analytics/WeeklyDigest.jsx',
  "import { Trophy, Flame, TrendingUp } from 'lucide-react';",
  "import { ArrowUpRight, Trophy, Flame, TrendingUp } from 'lucide-react';" // Need to restore it if it's actually used
);
// Actually ArrowUpRight IS used.
replaceFileContent(
  'src/components/analytics/WeeklyDigest.jsx',
  "import { CardHeader, CardTitle, CardContent } from '../ui/Card';",
  "import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';" // Actually needed in UI
);

// We made a mistake patching WeeklyDigest earlier. Let's reset it and apply just what's needed.
let originalWeeklyDigest = `import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Trophy, Flame, TrendingUp } from 'lucide-react';

export const WeeklyDigest = () => {
    // Mock data - in real app, passed via props
    const digest = {
        period: "May 12 - May 18",
        summary: "Great consistency this week! You've maintained your pitch target in 4/5 sessions.",
        highlights: [
            { icon: <Trophy className="w-4 h-4 text-yellow-500" />, text: "New record: 15 mins sustained resonance" },
            { icon: <Flame className="w-4 h-4 text-orange-500" />, text: "5 day practice streak" },
            { icon: <TrendingUp className="w-4 h-4 text-blue-500" />, text: "Pitch stability improved by 12%" }
        ],
        focusForNextWeek: "Work on maintaining resonance during higher pitches (C4-E4 range)."
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                        Weekly Digest
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {digest.period}
                        </Badge>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-slate-300 text-sm mb-4">{digest.summary}</p>

                <div className="space-y-3 mb-4">
                    {digest.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                            <div className="bg-slate-900 p-1.5 rounded-md">
                                {highlight.icon}
                            </div>
                            <span className="text-sm text-slate-200">{highlight.text}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Focus for Next Week</h4>
                    <p className="text-sm text-slate-300 bg-blue-900/20 p-3 rounded-lg border border-blue-800/30">
                        {digest.focusForNextWeek}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};`;
fs.writeFileSync('src/components/analytics/WeeklyDigest.jsx', originalWeeklyDigest, 'utf8');

// Just remove React import.
replaceFileContent(
  'src/components/analytics/WeeklyDigest.jsx',
  "import React from 'react';\n",
  ""
);

console.log("ESLint WeeklyDigest restored and patched");

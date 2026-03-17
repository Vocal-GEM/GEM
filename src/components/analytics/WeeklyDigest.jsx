import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Trophy, Flame, TrendingUp } from 'lucide-react';

export const WeeklyDigest = () => {
    // Mock data - in real app, passed via props
    const digest = {
        period: "May 12 - May 18",
        summary: {
            sessionsCompleted: 14,
            totalPracticeTimeSeconds: 5400,
        },
        highlights: [
            { type: 'personal_best', icon: Trophy, text: 'Hit F4 for the first time!' },
            { type: 'streak', icon: Flame, text: '7-day streak achieved' },
            { type: 'progress', icon: TrendingUp, text: 'Resonance score up 12%' }
        ],
        nextMilestone: { title: "Level 5", progress: 0.8 }
    };

    return (
        <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {digest.period}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{digest.summary.sessionsCompleted}</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{(digest.summary.totalPracticeTimeSeconds / 60).toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                    Week Highlights <Badge variant="secondary" className="text-[10px] h-5">New</Badge>
                </h4>
                <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-3">
                        {digest.highlights.map((item, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 rounded-md bg-card border border-border/50 hover:bg-accent/50 transition-colors">
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <item.icon size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-tight">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-medium">Next: {digest.nextMilestone.title}</span>
                    <span className="text-xs text-muted-foreground">{(digest.nextMilestone.progress * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${digest.nextMilestone.progress * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

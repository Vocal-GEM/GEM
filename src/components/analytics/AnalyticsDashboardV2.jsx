import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendAnalyzer } from '../../services/TrendAnalyzer';
import { InsightGenerator } from '../../services/InsightGenerator';
import { TrendLineChart } from './TrendLineChart';
import { InsightCard } from './InsightCard';
import { WeeklyDigest } from './WeeklyDigest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { indexedDB } from '../../services/IndexedDBManager';

// Placeholder data for demonstration
const mockSessions = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    avgPitch: 160 + Math.random() * 20 + (i * 0.5), // Slight upward trend
    avgResonance: 0.5 + Math.random() * 0.1,
    duration: 600 + Math.random() * 600
}));

const analyzer = new TrendAnalyzer();
const insightGen = new InsightGenerator();

export const AnalyticsDashboardV2 = () => {
    const [timeframe, setTimeframe] = useState('month');
    const [metric, setMetric] = useState('pitch');
    const [trends, setTrends] = useState(null);
    const [insight, setInsight] = useState(null);
    const [isDemoData, setIsDemoData] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const realSessions = await indexedDB.getSessions();
                if (realSessions && realSessions.length > 2) {
                    const analysis = analyzer.analyzeProgress(realSessions, timeframe);
                    setTrends(analysis);
                    setIsDemoData(false);
                } else {
                    // Fallback to mock data for demonstration if no/little real data
                    const analysis = analyzer.analyzeProgress(mockSessions, timeframe);
                    setTrends(analysis);
                    setIsDemoData(true);
                }

                const dailyInsight = insightGen.generateDailyInsight('user123', { profile: { experienceLevel: 'intermediate' } });
                setInsight(dailyInsight);
            } catch (err) {
                console.error("Failed to load analytics data:", err);
            }
        };

        loadData();
    }, [timeframe]);

    if (!trends) return <div className="p-8 text-center">Loading analytics...</div>;

    return (
        <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Voice Analytics
                </h1>
                <div className="flex gap-2">
                    <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="quarter">Quarter</SelectItem>
                            <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">Export Report</Button>
                </div>
            </div>

            {isDemoData && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm px-4 py-2 rounded-lg flex justify-between items-center mb-4">
                    <span className="flex items-center gap-2">👋 Limited data detected. Showing demonstration data to preview features.</span>
                </div>
            )}

            {insight && (
                <InsightCard insight={insight} onDismiss={() => setInsight(null)} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Avg Pitch"
                    value={`${Math.round(trends.pitch?.prediction?.nextSession || 0)} Hz`}
                    trend={trends.pitch?.direction}
                    subtext="Predicted next session"
                />
                <StatsCard
                    title="Resonance"
                    value="Balanced"
                    trend={trends.resonance?.direction}
                    subtext={`${(trends.resonance?.rateOfChange * 100).toFixed(2)}% change/session`}
                />
                <StatsCard
                    title="Consistency"
                    value={`${trends.consistency}%`}
                    trend={trends.consistency > 70 ? 'good' : 'bad'}
                    subtext="Based on last 30 days"
                />
                <StatsCard
                    title="Practice Volume"
                    value={`${trends.practiceVolume?.totalDurationMinutes} mins`}
                    subtext={`${trends.practiceVolume?.sessionCount} sessions total`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Progress Trends</CardTitle>
                                <Tabs value={metric} onValueChange={setMetric} className="w-[400px]">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="pitch">Pitch</TabsTrigger>
                                        <TabsTrigger value="resonance">Resonance</TabsTrigger>
                                        <TabsTrigger value="consistency">Consistency</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <TrendLineChart
                                data={mockSessions}
                                metric={metric}
                                trendInfo={trends[metric]}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Weekly Digest</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <WeeklyDigest trends={trends} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {trends.plateau?.detected && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardHeader>
                        <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                            <span>⚠️</span> Plateau Detected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">It looks like your progress has leveled off recently. This is normal! Try these tips to break through:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            {trends.plateau.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const StatsCard = ({ title, value, trend, subtext }) => (
    <Card>
        <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold">{value}</span>
                {trend && (
                    <span className={`text-sm ${trend === 'improving' || trend === 'good' ? 'text-green-500' :
                        trend === 'declining' || trend === 'bad' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                        {trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→'}
                    </span>
                )}
            </div>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </CardContent>
    </Card>
);

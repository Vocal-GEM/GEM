import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import CommunityService from '../../services/CommunityService';
import { Loader2 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CommunityBenchmarks = () => {
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState('avg_pitch');
    const [userGroup, setUserGroup] = useState('feminine');
    const [data, setData] = useState(null);

    useEffect(() => {
        loadBenchmarks();
    }, [userGroup]);

    const loadBenchmarks = async () => {
        setLoading(true);
        try {
            // In a real app, you'd get the user's actual current stats here too
            const benchmarks = await CommunityService.getCommunityBenchmarks(userGroup, 'intermediate');

            // Simulate/Merge with user data
            setData({
                labels: ['You', 'Beginners', 'Intermediate', 'Advanced'],
                datasets: [
                    {
                        label: metric === 'avg_pitch' ? 'Average Pitch (Hz)' : 'Resonance (Brightness)',
                        data: [
                            metric === 'avg_pitch' ? 185 : 0.55, // Mock user data
                            benchmarks.benchmarks?.[metric]?.value || (metric === 'avg_pitch' ? 160 : 0.4),
                            metric === 'avg_pitch' ? 190 : 0.6,
                            metric === 'avg_pitch' ? 220 : 0.8
                        ],
                        backgroundColor: [
                            'rgba(168, 85, 247, 0.8)', // Purple for user
                            'rgba(148, 163, 184, 0.5)',
                            'rgba(148, 163, 184, 0.6)',
                            'rgba(148, 163, 184, 0.8)',
                        ],
                        borderRadius: 8,
                    },
                ],
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#94a3b8',
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#e2e8f0',
                }
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-purple-400" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-white">Your Progress vs. Community</h2>
                    <p className="text-sm text-slate-400">See how your stats compare to others with similar goals.</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={userGroup}
                        onChange={(e) => setUserGroup(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="feminine">Feminine Goal</option>
                        <option value="masculine">Masculine Goal</option>
                        <option value="androgynous">Androgynous Goal</option>
                    </select>

                    <select
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="avg_pitch">Pitch Average</option>
                        <option value="avg_resonance">Resonance</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg h-80">
                {data && <Bar options={options} data={data} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-purple-400 text-sm font-medium mb-1">Top 10%</h3>
                    <p className="text-2xl font-bold text-white">215 Hz</p>
                    <p className="text-xs text-slate-500">Average for top performers</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-purple-400 text-sm font-medium mb-1">Your Percentile</h3>
                    <p className="text-2xl font-bold text-white">68th</p>
                    <p className="text-xs text-slate-500">You're doing better than average!</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-purple-400 text-sm font-medium mb-1">Consistent Practice</h3>
                    <p className="text-2xl font-bold text-white">4.2 days</p>
                    <p className="text-xs text-slate-500">Avg. days/week for advanced group</p>
                </div>
            </div>
        </div>
    );
};

export default CommunityBenchmarks;

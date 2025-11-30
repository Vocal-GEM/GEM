import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { indexedDB } from '../../services/IndexedDBManager';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProgressCharts = () => {
    const [timeRange, setTimeRange] = useState(30); // days
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await indexedDB.getJournals();
                setEntries(data);
            } catch (error) {
                console.error("Failed to load journal entries:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredData = useMemo(() => {
        if (!entries.length) return [];

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - timeRange);

        return entries
            .filter(e => new Date(e.date) >= cutoff)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [entries, timeRange]);

    // Pitch Trend Data
    const pitchData = useMemo(() => {
        const labels = filteredData.map(e => new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        const values = filteredData.map(e => e.averagePitch || null);

        return {
            labels,
            datasets: [
                {
                    label: 'Average Pitch (Hz)',
                    data: values,
                    borderColor: 'rgb(236, 72, 153)', // pink-500
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(236, 72, 153)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(236, 72, 153)'
                }
            ]
        };
    }, [filteredData]);

    // Practice Time Data (Mocking duration if not present, assuming 15 mins per entry for now if missing)
    const practiceData = useMemo(() => {
        // Group by date
        const dailyDuration = {};
        filteredData.forEach(e => {
            const date = e.date;
            const duration = e.duration || 15; // Default to 15 mins if not tracked
            dailyDuration[date] = (dailyDuration[date] || 0) + duration;
        });

        const labels = Object.keys(dailyDuration).map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        const values = Object.values(dailyDuration);

        return {
            labels,
            datasets: [
                {
                    label: 'Practice Time (mins)',
                    data: values,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500
                    borderRadius: 4,
                    hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)'
                }
            ]
        };
    }, [filteredData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#94a3b8' } // slate-400
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 10,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: { color: '#334155' }, // slate-700
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    if (loading) return <div className="text-slate-400 text-center py-8">Loading progress...</div>;
    if (entries.length === 0) return <div className="text-slate-400 text-center py-8">No practice data yet. Complete a session to see your progress!</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2">
                {[7, 30, 90].map(days => (
                    <button
                        key={days}
                        onClick={() => setTimeRange(days)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${timeRange === days ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        Last {days} Days
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pitch Chart */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 h-80">
                    <h3 className="text-white font-bold mb-4">Pitch Trend</h3>
                    <div className="h-64">
                        <Line data={pitchData} options={chartOptions} />
                    </div>
                </div>

                {/* Practice Time Chart */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 h-80">
                    <h3 className="text-white font-bold mb-4">Practice Duration</h3>
                    <div className="h-64">
                        <Bar data={practiceData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressCharts;

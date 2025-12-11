import { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PhonetogramChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return { datasets: [] };

        // Sort data by note number for correct plotting
        const sortedData = [...data].sort((a, b) => a.note - b.note);

        const labels = sortedData.map(d => {
            // Convert MIDI note to note name (e.g., 60 -> C4)
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = Math.floor(d.note / 12) - 1;
            const noteName = notes[d.note % 12];
            return `${noteName}${octave}`;
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Max Intensity (dB)',
                    data: sortedData.map(d => d.max),
                    borderColor: 'rgba(59, 130, 246, 1)', // Blue
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: '+1', // Fill to the next dataset (Min)
                    tension: 0.4,
                    pointRadius: 3
                },
                {
                    label: 'Min Intensity (dB)',
                    data: sortedData.map(d => d.min),
                    borderColor: 'rgba(168, 85, 247, 1)', // Purple
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3
                }
            ]
        };
    }, [data]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 40,
                max: 120,
                title: {
                    display: true,
                    text: 'Intensity (dB SPL)',
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Pitch (Note)',
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 20
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#e2e8f0'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    };

    return (
        <div className="w-full h-full bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            {data && data.length > 0 ? (
                <Line data={chartData} options={options} />
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <p>No data recorded yet.</p>
                    <p className="text-sm mt-2">Start recording and glide through your range.</p>
                </div>
            )}
        </div>
    );
};

export default PhonetogramChart;

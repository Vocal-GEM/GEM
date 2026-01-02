
import React, { useState, useEffect } from 'react';
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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ResearchDashboard = () => {
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Mock fetching studies
        setStudies([
            { id: 'study-001', title: 'Pitch Accuracy in Early Transition', status: 'active', participants: 42 },
            { id: 'study-002', title: 'Formant Tuning Effectiveness', status: 'recruiting', participants: 15 },
        ]);
    }, []);

    useEffect(() => {
        if (selectedStudy) {
            // Mock fetching stats for selected study
            setStats({
                enrollmentRate: [5, 12, 25, 30, 38, 42],
                pitchImprovement: {
                    control: [160, 162, 165, 163, 166],
                    intervention: [160, 168, 175, 182, 188]
                },
                demographics: {
                    age: [18, 25, 35, 45, 55],
                    counts: [5, 15, 12, 6, 4]
                }
            });
        }
    }, [selectedStudy]);

    const enrollmentData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
            {
                label: 'Cumulative Enrollment',
                data: stats?.enrollmentRate || [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const effectivenessData = {
        labels: ['Baseline', 'Month 1', 'Month 2', 'Month 3', 'Month 4'],
        datasets: [
            {
                label: 'Control Arm (Hz)',
                data: stats?.pitchImprovement.control || [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Intervention Arm (Hz)',
                data: stats?.pitchImprovement.intervention || [],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return (
        <div className="research-dashboard p-6 bg-gray-900 text-white min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Research Dashboard</h1>
                <p className="text-gray-400">Manage clinical trials and analyze aggregate outcomes.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Study Selector */}
                <div className="bg-gray-800 p-4 rounded-lg md:col-span-1">
                    <h2 className="text-xl font-semibold mb-4">Active Studies</h2>
                    <ul className="space-y-2">
                        {studies.map(study => (
                            <li
                                key={study.id}
                                onClick={() => setSelectedStudy(study)}
                                className={`p-3 rounded cursor-pointer transition-colors ${selectedStudy?.id === study.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <div className="font-medium">{study.title}</div>
                                <div className="text-sm text-gray-300 flex justify-between mt-1">
                                    <span>{study.status}</span>
                                    <span>{study.participants} participants</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300">
                        + Create New Study
                    </button>
                </div>

                {/* Analytics Area */}
                <div className="md:col-span-3 space-y-6">
                    {selectedStudy ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium mb-4">Recruitment Progress</h3>
                                    <div className="h-64">
                                        <Line options={{ responsive: true, maintainAspectRatio: false }} data={enrollmentData} />
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium mb-4">Intervention Effectiveness (Avg Pitch)</h3>
                                    <div className="h-64">
                                        <Line options={{ responsive: true, maintainAspectRatio: false }} data={effectivenessData} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Data Management</h3>
                                    <div className="space-x-4">
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">Download Export (CSV)</button>
                                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">SPSS Format</button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Secure download of anonymized participant data. Last export: 2 hours ago by Dr. Smith.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg text-gray-400">
                            Select a study to view analytics
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResearchDashboard;

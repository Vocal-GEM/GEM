import React, { useState } from 'react';
import VASSlider from './VASSlider';
import TaskRecorder from './TaskRecorder';
import { motion } from 'framer-motion';
import { FileText, Download, Activity } from 'lucide-react';

const CAPEVAssessment = () => {
    const [scores, setScores] = useState({
        overallSeverity: 0,
        roughness: 0,
        breathiness: 0,
        strain: 0,
        pitch: 0,
        loudness: 0
    });

    const [completedTasks, setCompletedTasks] = useState({});
    const [report, setReport] = useState(null);

    const tasks = [
        { id: 'sustained_ah', prompt: 'Sustain /a/ for as long as comfortable', duration: 5 },
        { id: 'sustained_ee', prompt: 'Sustain /i/ for as long as comfortable', duration: 5 },
        { id: 'sentence_1', prompt: 'Read: "The blue spot is on the key again"', text: true },
        { id: 'sentence_2', prompt: 'Read: "How hard did he hit him?"', text: true },
        { id: 'sentence_3', prompt: 'Read: "We were away a year ago"', text: true },
        { id: 'conversation', prompt: 'Tell me about your voice problem', freeform: true }
    ];

    const handleTaskComplete = (taskId, blob) => {
        setCompletedTasks(prev => ({
            ...prev,
            [taskId]: blob
        }));
    };

    const getInterpretation = (score) => {
        if (score < 10) return "Normal / Slight deviation";
        if (score < 35) return "Mild deviation";
        if (score < 60) return "Moderate deviation";
        return "Severe deviation";
    };

    const getRecommendations = (scores) => {
        const recs = [];
        if (scores.roughness > 30) recs.push("Consider laryngoscopy to check for tissue changes.");
        if (scores.breathiness > 30) recs.push("Focus on vocal fold closure exercises (SOVTE).");
        if (scores.strain > 30) recs.push("Relaxation and laryngeal massage recommended.");
        if (scores.pitch > 30) recs.push("Pitch matching exercises and range extension.");
        if (scores.loudness > 30) recs.push("Breath support and projection exercises.");
        if (recs.length === 0) recs.push("Voice appears within normal limits. Maintain vocal hygiene.");
        return recs;
    };

    const calculateResults = () => {
        // Cape-V composite is typically simple average, or weighted. We'll use simple average for now.
        const composite = Object.values(scores).reduce((a, b) => a + b, 0) / 6;

        setReport({
            date: new Date().toLocaleDateString(),
            scores,
            composite,
            interpretation: getInterpretation(composite),
            recommendations: getRecommendations(scores),
            taskCount: Object.keys(completedTasks).length
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-slate-900 min-h-screen text-slate-100">
            <div className="flex items-center gap-3 mb-8">
                <Activity className="w-8 h-8 text-pink-500" />
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                        CAPE-V Assessment
                    </h1>
                    <p className="text-slate-400 text-sm">Consensus Auditory-Perceptual Evaluation of Voice</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Recording Tasks */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-slate-200">1. Voice Samples</h2>
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <TaskRecorder
                                key={task.id}
                                task={task}
                                onComplete={handleTaskComplete}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Perceptual Scoring */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-slate-200">2. Perceptual Rating</h2>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        {Object.keys(scores).map(dimension => (
                            <VASSlider
                                key={dimension}
                                label={dimension.replace(/([A-Z])/g, ' $1').trim()}
                                value={scores[dimension]}
                                onChange={v => setScores({ ...scores, [dimension]: v })}
                                markers={['Normal', 'Mild', 'Moderate', 'Severe']}
                            />
                        ))}

                        <button
                            onClick={calculateResults}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <FileText size={20} /> Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Section */}
            {report && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 bg-slate-800 p-8 rounded-xl border border-slate-600 shadow-2xl"
                >
                    <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Assessment Report</h2>
                            <p className="text-slate-400">{report.date}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-pink-400">{report.composite.toFixed(1)}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">Composite Score</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">Interpretation</h3>
                            <p className="text-xl text-white">{report.interpretation}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-purple-400 mb-2">Completion</h3>
                            <p className="text-slate-300">
                                {report.taskCount} / {tasks.length} tasks recorded
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-green-400 mb-4">Recommendations</h3>
                        <ul className="space-y-2">
                            {report.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors">
                        <Download size={18} /> Export PDF
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default CAPEVAssessment;

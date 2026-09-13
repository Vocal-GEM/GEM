import { useEffect, useState, useRef } from 'react';
import { Activity } from 'lucide-react';
import { cppAnalyzer } from '../../utils/cppAnalysis';

const CPPMeter = ({ dataRef, isActive }) => {
    const [cppData, setCppData] = useState({ cpp: 0, quality: 'unknown', interpretation: '', color: '#64748b' });
    const [history, setHistory] = useState([]);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isActive || !dataRef?.current) return;

        const interval = setInterval(() => {
            const audioData = dataRef.current.timeDomainData;
            if (audioData && audioData.length > 0) {
                // Convert Uint8Array to Float32Array (normalize to -1 to 1)
                const floatData = new Float32Array(audioData.length);
                for (let i = 0; i < audioData.length; i++) {
                    floatData[i] = (audioData[i] - 128) / 128;
                }

                const result = cppAnalyzer.analyzeRealTime(floatData);
                setCppData(result);

                // Update history for sparkline
                setHistory(prev => {
                    const newHistory = [...prev, result.cpp];
                    return newHistory.slice(-50); // Keep last 50 values
                });
            }
        }, 200); // Update every 200ms

        return () => clearInterval(interval);
    }, [isActive, dataRef]);

    // Draw sparkline
    useEffect(() => {
        if (!canvasRef.current || history.length < 2) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw sparkline
        ctx.strokeStyle = cppData.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const maxCPP = 15; // Max CPP value for scaling
        const step = width / (history.length - 1);

        history.forEach((value, index) => {
            const x = index * step;
            const y = height - (value / maxCPP) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw reference line at CPP = 10 (good threshold)
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const goodThreshold = height - (10 / maxCPP) * height;
        ctx.moveTo(0, goodThreshold);
        ctx.lineTo(width, goodThreshold);
        ctx.stroke();
        ctx.setLineDash([]);
    }, [history, cppData.color]);

    return (
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">CPP</div>
                        <div className="text-[10px] text-slate-400">Voice Quality</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: cppData.color }}>
                        {cppData.cpp.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-500">dB</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-300"
                        style={{
                            width: `${Math.min(100, (cppData.cpp / 15) * 100)}%`,
                            backgroundColor: cppData.color
                        }}
                    />
                </div>
                <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                </div>
            </div>

            {/* Sparkline */}
            <div className="mb-2">
                <canvas
                    ref={canvasRef}
                    width={200}
                    height={40}
                    className="w-full h-10 rounded"
                />
            </div>

            {/* Interpretation */}
            <div className="text-center">
                <div className="text-xs font-medium capitalize" style={{ color: cppData.color }}>
                    {cppData.quality}
                </div>
                <div className="text-[10px] text-slate-400">
                    {cppData.interpretation}
                </div>
            </div>

            {/* Clinical Reference */}
            <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[9px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                        <span>Excellent:</span>
                        <span className="text-green-400">&gt; 10 dB</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Good:</span>
                        <span className="text-blue-400">8-10 dB</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fair:</span>
                        <span className="text-amber-400">6-8 dB</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Moderate:</span>
                        <span className="text-orange-400">4-6 dB</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Poor:</span>
                        <span className="text-red-400">&lt; 4 dB</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CPPMeter;

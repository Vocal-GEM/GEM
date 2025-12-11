import { useEffect, useState, useRef } from 'react';
import { Info } from 'lucide-react';

const ResonanceMetrics = ({ dataRef }) => {
    const [metrics, setMetrics] = useState({
        f1: 0,
        f2: 0,
        centroid: 0,
        resonanceScore: 0
    });
    const [showTooltip, setShowTooltip] = useState(null);
    const requestRef = useRef();

    useEffect(() => {
        const updateMetrics = () => {
            if (dataRef.current) {
                // resonanceScore is now the RBI (0-100) from backend
                // resonance is the spectral centroid (Hz)
                const { f1, f2, resonance, resonanceScore } = dataRef.current;
                setMetrics({
                    f1: f1 ? Math.round(f1) : 0,
                    f2: f2 ? Math.round(f2) : 0,
                    centroid: Math.round(resonance || 0),
                    resonanceScore: Math.round(resonanceScore || 0)
                });
            }
            requestRef.current = requestAnimationFrame(updateMetrics);
        };

        requestRef.current = requestAnimationFrame(updateMetrics);
        return () => cancelAnimationFrame(requestRef.current);
    }, [dataRef]);

    const MetricCard = ({ label, value, unit, color, tooltip, id }) => (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 relative group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <button
                    className="text-slate-600 hover:text-slate-300 transition-colors"
                    onMouseEnter={() => setShowTooltip(id)}
                    onMouseLeave={() => setShowTooltip(null)}
                >
                    <Info size={14} />
                </button>
            </div>
            <div className={`text-2xl font-bold ${color}`}>
                {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
            </div>

            {showTooltip === id && (
                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-900/95 backdrop-blur border border-white/10 rounded-lg z-50 text-xs text-slate-300 shadow-xl">
                    {tooltip}
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard
                id="f1"
                label="R1 (F1)"
                value={metrics.f1}
                unit="Hz"
                color="text-emerald-400"
                tooltip="First Formant (R1). Associated with throat space. Higher = Brighter/Feminine, Lower = Darker/Masculine."
            />
            <MetricCard
                id="f2"
                label="R2 (F2)"
                value={metrics.f2}
                unit="Hz"
                color="text-teal-400"
                tooltip="Second Formant (R2). Associated with mouth space and tongue position. Higher = Brighter."
            />
            <MetricCard
                id="centroid"
                label="Brightness"
                value={metrics.centroid}
                unit="Hz"
                color="text-cyan-400"
                tooltip="Spectral Centroid. The 'center of gravity' of your sound spectrum. Higher values mean a brighter sound."
            />
            <MetricCard
                id="score"
                label="RBI Score"
                value={metrics.resonanceScore}
                unit="%"
                color="text-purple-400"
                tooltip="Resonance Brightness Index (RBI). A composite score (0-100) indicating how bright and forward your resonance is. Target: 60-80."
            />
        </div>
    );
};

export default ResonanceMetrics;

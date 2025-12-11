import { useEffect, useRef, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ContourVisualizer = ({ dataRef }) => {
    const canvasRef = useRef(null);
    const [metrics, setMetrics] = useState({
        contour: 0,
        slopeDirection: 'flat',
        semitoneRange: 0
    });

    // History for graph
    const historyRef = useRef([]);
    const maxHistory = 300; // ~5 seconds at 60fps

    useEffect(() => {
        const loop = () => {
            if (!dataRef.current) return;

            const { prosody, isSilent, clarity } = dataRef.current;

            // Only update history if speaking and confident
            // This prevents "monotone" penalties during silence
            const shouldUpdate = !isSilent && (clarity === undefined || clarity > 0.5);

            if (prosody && shouldUpdate) {
                // Update local state for UI text
                setMetrics({
                    contour: prosody.contour || 0,
                    slopeDirection: prosody.slopeDirection || 'flat',
                    semitoneRange: prosody.semitoneRange || 0
                });

                // Update history
                historyRef.current.push(prosody.contour || 0);
                if (historyRef.current.length > maxHistory) {
                    historyRef.current.shift();
                }
            }

            // Draw Graph (Always draw, even if paused, to maintain visual)
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const width = canvas.width;
                const height = canvas.height;

                ctx.clearRect(0, 0, width, height);

                // Draw Target Band (0.25 - 0.6)
                const yTop = height - (0.6 * height);
                const yBottom = height - (0.25 * height);
                const bandHeight = yBottom - yTop;

                ctx.fillStyle = 'rgba(45, 212, 191, 0.05)'; // Very faint teal
                ctx.fillRect(0, yTop, width, bandHeight);

                // Draw Grid Lines & Labels
                ctx.lineWidth = 1;

                // 0.6 Line (Upper Natural Limit)
                ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(0, yTop); ctx.lineTo(width, yTop);
                ctx.stroke();

                // 0.25 Line (Lower Natural Limit)
                ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
                ctx.beginPath();
                ctx.moveTo(0, yBottom); ctx.lineTo(width, yBottom);
                ctx.stroke();
                ctx.setLineDash([]);

                // Target Zone Label
                ctx.fillStyle = 'rgba(45, 212, 191, 0.5)';
                ctx.font = '10px monospace';
                ctx.fillText('TARGET ZONE', 10, yTop + 15);

                // Draw History Line
                if (historyRef.current.length > 1) {
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    // Gradient stroke based on current intensity
                    const gradient = ctx.createLinearGradient(0, height, 0, 0);
                    gradient.addColorStop(0, '#94a3b8'); // slate-400 (low)
                    gradient.addColorStop(0.5, '#2dd4bf'); // teal-400 (med)
                    gradient.addColorStop(1, '#a855f7'); // purple-500 (high)
                    ctx.strokeStyle = gradient;

                    for (let i = 0; i < historyRef.current.length; i++) {
                        const val = historyRef.current[i];
                        const x = (i / (maxHistory - 1)) * width;
                        const y = height - (val * height); // Invert Y
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
            }

            requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'contour-visualizer',
                loop,
                renderCoordinator.PRIORITY.HIGH
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    // Helper for slope icon
    const getSlopeIcon = () => {
        switch (metrics.slopeDirection) {
            case 'rising': return <TrendingUp className="w-8 h-8 text-emerald-400" />;
            case 'falling': return <TrendingDown className="w-8 h-8 text-blue-400" />;
            default: return <Minus className="w-8 h-8 text-slate-400" />;
        }
    };

    // Helper for labels
    const getContourLabel = (val) => {
        if (val < 0.25) return { text: 'Monotone', color: 'text-slate-400' };
        if (val > 0.6) return { text: 'Expressive', color: 'text-purple-400' };
        return { text: 'Natural', color: 'text-teal-400' };
    };

    const label = getContourLabel(metrics.contour);

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="w-6 h-6 text-teal-400" />
                        Pitch Contour
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Visualizes the dynamic range and variability of your speech.
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <div className={`text-3xl font-bold font-mono ${label.color}`}>
                        {(metrics.contour * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                        Variability
                    </div>
                </div>
            </div>

            {/* Main Visualization Area */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Graph */}
                <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={400}
                        className="w-full h-full object-contain"
                    />
                    {/* Overlay Labels */}
                    <div className="absolute top-4 right-4 text-xs font-bold text-purple-500/50 uppercase">Expressive</div>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-teal-500/50 uppercase">Natural</div>
                    <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-500/50 uppercase">Monotone</div>
                </div>

                {/* Metrics Panel */}
                <div className="space-y-4">
                    {/* Current State Card */}
                    <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center h-[180px]">
                        <div className="mb-2">
                            {getSlopeIcon()}
                        </div>
                        <div className="text-xl font-bold text-white mb-1 capitalize">
                            {metrics.slopeDirection}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">
                            Intonation Slope
                        </div>
                    </div>

                    {/* Range Card */}
                    <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center h-[180px]">
                        <div className="text-3xl font-bold text-white mb-1 font-mono">
                            {metrics.semitoneRange.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                            Semitone Range
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${Math.min(100, (metrics.semitoneRange / 12) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContourVisualizer;

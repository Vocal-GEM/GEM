import { useEffect, useRef, useMemo, useState, useCallback, memo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { Activity, X, Maximize2, Minimize2, Settings } from 'lucide-react';

/**
 * QualityVisualizer Component
 *
 * Renders real-time vocal quality metrics (CPP, HNR, Jitter, Shimmer)
 * using an efficient canvas-based history graph.
 *
 * Optimized for performance:
 * - Uses RenderCoordinator for unified animation loop
 * - Uses OffscreenCanvas pattern for smooth scrolling
 * - Memoized configuration and color mapping
 */

const METRICS = {
    cpp: { label: 'CPP', min: 0, max: 25, color: '#10b981', unit: 'dB' }, // Cepstral Peak Prominence
    hnr: { label: 'HNR', min: 0, max: 30, color: '#3b82f6', unit: 'dB' }, // Harmonics-to-Noise Ratio
    jitter: { label: 'Jitter', min: 0, max: 2, color: '#f59e0b', unit: '%' }, // Frequency Perturbation
    shimmer: { label: 'Shimmer', min: 0, max: 10, color: '#ec4899', unit: '%' } // Amplitude Perturbation
};

const QualityVisualizer = memo(function QualityVisualizer({ dataRef, isExpanded = false, onToggleExpand }) {
    const { settings, colorBlindMode } = useSettings();
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const historyRef = useRef([]);
    const [activeMetrics, setActiveMetrics] = useState(['cpp', 'hnr']);
    const [showConfig, setShowConfig] = useState(false);

    // Color mapping based on settings
    const colors = useMemo(() => {
        if (colorBlindMode) {
            return {
                cpp: '#0d9488', // Teal
                hnr: '#2563eb', // Blue
                jitter: '#d97706', // Amber
                shimmer: '#db2777' // Pink
            };
        }
        return {
            cpp: '#10b981', // Emerald
            hnr: '#3b82f6', // Blue
            jitter: '#f59e0b', // Amber
            shimmer: '#ec4899' // Pink
        };
    }, [colorBlindMode]);

    // Draw loop
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get latest data point
        if (dataRef.current) {
            const now = Date.now();
            const point = {
                timestamp: now,
                cpp: dataRef.current.cpp?.mean || 0,
                hnr: dataRef.current.hnr?.mean || 0,
                jitter: dataRef.current.jitter || 0,
                shimmer: dataRef.current.shimmer || 0
            };

            // Add to history
            historyRef.current.push(point);

            // Prune history (keep last 10 seconds)
            const cutoff = now - 10000;
            if (historyRef.current.length > 0 && historyRef.current[0].timestamp < cutoff) {
                // Optimization: Remove chunks instead of shift() one by one
                const keepIndex = historyRef.current.findIndex(p => p.timestamp >= cutoff);
                if (keepIndex > 0) {
                    historyRef.current = historyRef.current.slice(keepIndex);
                }
            }
        }

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const y = (height / 4) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Draw active metrics
        activeMetrics.forEach(metricKey => {
            const metric = METRICS[metricKey];
            const color = colors[metricKey];
            const data = historyRef.current;

            if (data.length < 2) return;

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.beginPath();

            const now = Date.now();
            const timeWindow = 10000; // 10s

            data.forEach((p, i) => {
                const x = width - ((now - p.timestamp) / timeWindow) * width;
                // Normalize value to 0-1
                let normalized = (p[metricKey] - metric.min) / (metric.max - metric.min);
                normalized = Math.max(0, Math.min(1, normalized)); // Clamp

                const y = height - (normalized * height);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });

            ctx.stroke();
        });

    }, [activeMetrics, colors, dataRef]);

    // Handle Resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current && canvasRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = rect.width * dpr;
                canvasRef.current.height = rect.height * dpr;
            }
        };

        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        updateSize();

        return () => resizeObserver.disconnect();
    }, [isExpanded]);

    // Subscribe to render loop
    useEffect(() => {
        // Unique ID for this component instance
        const id = `quality-viz-${Math.random().toString(36).substr(2, 9)}`;

        const unsubscribe = renderCoordinator.subscribe(
            id,
            draw,
            renderCoordinator.PRIORITY.LOW // Quality graphs don't need 60fps precision
        );

        return () => unsubscribe();
    }, [draw]);

    const toggleMetric = (key) => {
        setActiveMetrics(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    return (
        <div
            ref={containerRef}
            className={`relative bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 bg-slate-900 shadow-2xl' : 'h-48'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-slate-800/30 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Voice Quality</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className={`p-1.5 rounded-lg transition-colors ${showConfig ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Settings size={14} />
                    </button>
                    {onToggleExpand && (
                        <button
                            onClick={onToggleExpand}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Config Overlay */}
            {showConfig && (
                <div className="absolute top-12 right-3 z-20 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl w-48 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Visible Metrics</div>
                    <div className="space-y-1">
                        {Object.entries(METRICS).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => toggleMetric(key)}
                                className="flex items-center justify-between w-full p-1.5 rounded hover:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: colors[key] }}
                                    />
                                    <span className={`text-xs ${activeMetrics.includes(key) ? 'text-white' : 'text-slate-500'}`}>
                                        {config.label}
                                    </span>
                                </div>
                                {activeMetrics.includes(key) && <span className="text-xs text-slate-400">✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend (Always visible) */}
            <div className="absolute top-12 left-3 z-10 flex flex-col gap-1 pointer-events-none">
                {activeMetrics.map(key => (
                    <div key={key} className="flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[key] }} />
                        <span className="text-[10px] font-bold text-slate-300">{METRICS[key].label}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                            {(dataRef.current?.[key]?.mean || dataRef.current?.[key] || 0).toFixed(1)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />
        </div>
    );
});

export default QualityVisualizer;

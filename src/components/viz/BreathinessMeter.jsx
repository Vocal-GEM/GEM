import { useRef, useEffect, useState, useMemo, useId } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useSettings } from '../../context/SettingsContext';

const BreathinessMeter = ({ dataRef, width = 200, height = 60, colorBlindMode = false }) => {
    const canvasRef = useRef(null);
    const componentId = useId();
    const { settings } = useSettings(); // Access settings if needed

    // Metrics state for numeric display (throttled)
    const [metrics, setMetrics] = useState({ score: 0, label: 'Normal' });
    const lastUpdateRef = useRef(0);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const { cpp, shimmer } = dataRef.current; // Assuming these are passed

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate a composite breathiness score (0-100)
        // High Shimmer + Low CPP = Breathy
        // CPP > 14dB is good, < 10dB is breathy
        // Shimmer > 5% is breathy
        const cppScore = Math.max(0, Math.min(100, (cpp - 8) * 12.5)); // Map 8-16 to 0-100
        const shimmerScore = Math.max(0, Math.min(100, (10 - shimmer) * 10)); // Map 0-10 to 100-0

        const combinedScore = (cppScore * 0.7 + shimmerScore * 0.3);
        const breathinessIndex = 100 - combinedScore; // 0 = Clear, 100 = Very Breathy

        // Update React state sparsely (every 200ms)
        const now = performance.now();
        if (now - lastUpdateRef.current > 200) {
            let label = 'Normal';
            if (breathinessIndex > 40) label = 'Mild';
            if (breathinessIndex > 70) label = 'Breathy';

            setMetrics({
                score: Math.round(breathinessIndex),
                label
            });
            lastUpdateRef.current = now;
        }

        // Draw Gauge Background
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(0, 20, width, 10, 5);
        ctx.fill();

        // Draw Zones
        // Green (0-40)
        ctx.fillStyle = colorBlindMode ? '#60a5fa' : '#4ade80';
        ctx.beginPath();
        ctx.roundRect(0, 20, width * 0.4, 10, 5);
        ctx.fill();

        // Yellow (40-70)
        ctx.fillStyle = colorBlindMode ? '#fbbf24' : '#facc15';
        ctx.beginPath();
        ctx.roundRect(width * 0.4, 20, width * 0.3, 10, 0);
        ctx.fill();

        // Red (70-100)
        ctx.fillStyle = colorBlindMode ? '#f87171' : '#f87171';
        ctx.beginPath();
        ctx.roundRect(width * 0.7, 20, width * 0.3, 10, 5);
        ctx.fill();

        // Draw Indicator
        const x = (breathinessIndex / 100) * width;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, 25, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    useEffect(() => {
        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            draw,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [draw, componentId]);

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs text-slate-400">
                <span>Breathiness</span>
                <span className={metrics.score > 40 ? 'text-amber-400' : 'text-emerald-400'}>
                    {metrics.label} ({metrics.score})
                </span>
            </div>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full h-auto"
            />
        </div>
    );
};

export default BreathinessMeter;

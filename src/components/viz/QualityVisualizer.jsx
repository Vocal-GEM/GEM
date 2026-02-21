import { useRef, useEffect, useState, useMemo, useId } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useSettings } from '../../context/SettingsContext';

const QualityVisualizer = ({ dataRef, width = 300, height = 200, colorBlindMode = false }) => {
    const canvasRef = useRef(null);
    const componentId = useId();
    const { settings } = useSettings();

    const [qualityState, setQualityState] = useState({ label: 'Analyzing', color: 'text-slate-400' });
    const lastUpdateRef = useRef(0);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const { cpp, shimmer, jitter, hnr } = dataRef.current;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Calculate Quality Metrics (Normalized 0-100)
        const stability = Math.max(0, 100 - (jitter * 20)); // Jitter < 1% is good
        const clarity = Math.max(0, Math.min(100, (hnr - 10) * 5)); // HNR > 20dB is good
        const periodicity = Math.max(0, Math.min(100, (cpp - 8) * 10)); // CPP > 14dB is good

        // Overall Quality Score
        const overall = (stability + clarity + periodicity) / 3;

        // Update State (Throttled)
        const now = performance.now();
        if (now - lastUpdateRef.current > 500) {
            let label = 'Unstable';
            let color = 'text-rose-400';

            if (overall > 40) { label = 'Fair'; color = 'text-amber-400'; }
            if (overall > 70) { label = 'Good'; color = 'text-emerald-400'; }
            if (overall > 85) { label = 'Excellent'; color = 'text-cyan-400'; }

            setQualityState({ label, color });
            lastUpdateRef.current = now;
        }

        // Visualize as Radar Chart (Simplified for Canvas)
        const cx = width / 2;
        const cy = height / 2 + 10;
        const radius = Math.min(width, height) * 0.35;

        // Draw Axes (3 points: Stability, Clarity, Periodicity)
        const angles = [
            -Math.PI / 2, // Top (Stability)
            (Math.PI * 2) / 3 - Math.PI / 2, // Right (Clarity)
            (Math.PI * 4) / 3 - Math.PI / 2 // Left (Periodicity)
        ];

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        angles.forEach(angle => {
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        });
        ctx.stroke();

        // Draw Metric Polygon
        ctx.fillStyle = colorBlindMode ? 'rgba(96, 165, 250, 0.4)' : 'rgba(16, 185, 129, 0.4)';
        ctx.strokeStyle = colorBlindMode ? '#60a5fa' : '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const p1 = stability / 100 * radius;
        const p2 = clarity / 100 * radius;
        const p3 = periodicity / 100 * radius;

        ctx.moveTo(cx + Math.cos(angles[0]) * p1, cy + Math.sin(angles[0]) * p1);
        ctx.lineTo(cx + Math.cos(angles[1]) * p2, cy + Math.sin(angles[1]) * p2);
        ctx.lineTo(cx + Math.cos(angles[2]) * p3, cy + Math.sin(angles[2]) * p3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Stability', cx, cy - radius - 10);
        ctx.textAlign = 'left';
        ctx.fillText('Clarity', cx + Math.cos(angles[1]) * radius + 5, cy + Math.sin(angles[1]) * radius + 5);
        ctx.textAlign = 'right';
        ctx.fillText('Periodicity', cx + Math.cos(angles[2]) * radius - 5, cy + Math.sin(angles[2]) * radius + 5);
    };

    useEffect(() => {
        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            draw,
            renderCoordinator.PRIORITY.LOW
        );

        return () => {
            unsubscribe();
        };
    }, [draw, componentId]);

    return (
        <div className="relative bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-300">Voice Quality</h3>
                <span className={`text-sm font-bold ${qualityState.color}`}>{qualityState.label}</span>
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

export default QualityVisualizer;

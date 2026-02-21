import { useRef, useEffect, useState, useMemo, useId } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useSettings } from '../../context/SettingsContext';

const SpectralTiltMeter = ({ dataRef, width = 200, height = 40, colorBlindMode = false }) => {
    const canvasRef = useRef(null);
    const componentId = useId();
    const { settings } = useSettings();

    const [metrics, setMetrics] = useState({ slope: 0, label: 'Neutral' });
    const lastUpdateRef = useRef(0);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const { spectralSlope, spectralTilt } = dataRef.current;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate simplified slope metric
        // Slope usually negative (-6dB/oct is normal)
        // Flatter (> -3dB) = Pressed/Bright
        // Steeper (< -12dB) = Breathy/Dark

        const slope = spectralSlope || -6;
        const tiltIndex = Math.max(-20, Math.min(0, slope)); // Clamp -20 to 0

        // Update State (Throttled)
        const now = performance.now();
        if (now - lastUpdateRef.current > 300) {
            let label = 'Neutral';
            if (slope > -4) label = 'Bright';
            if (slope < -10) label = 'Dark';

            setMetrics({ slope: Math.round(slope * 10) / 10, label });
            lastUpdateRef.current = now;
        }

        // Draw Scale
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, height / 2);
        ctx.lineTo(width - 10, height / 2);
        ctx.stroke();

        // Draw Ticks (-20, -10, 0)
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';

        // Map -20..0 to 10..width-10
        const mapX = (val) => 10 + ((val + 20) / 20) * (width - 20);

        [-20, -10, 0].forEach(val => {
            const x = mapX(val);
            ctx.beginPath();
            ctx.moveTo(x, height / 2 - 5);
            ctx.lineTo(x, height / 2 + 5);
            ctx.stroke();
            ctx.fillText(`${val}dB`, x - 10, height - 2);
        });

        // Draw Indicator
        const indX = mapX(tiltIndex);
        ctx.fillStyle = colorBlindMode ? '#fbbf24' : '#facc15';
        ctx.beginPath();
        ctx.moveTo(indX, height / 2 - 8);
        ctx.lineTo(indX - 6, height / 2 - 16);
        ctx.lineTo(indX + 6, height / 2 - 16);
        ctx.fill();
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
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs text-slate-400">
                <span>Spectral Tilt</span>
                <span className="text-slate-200">{metrics.label} ({metrics.slope} dB/oct)</span>
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

export default SpectralTiltMeter;

import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
    predictGenderPerception,
    getPerceptionColor,
    getPerceptionExplanation,
    AMBIGUITY_ZONE
} from '../../services/GenderPerceptionPredictor';
import { renderCoordinator } from '../../services/RenderCoordinator';

/**
 * PitchResonanceQuadrant - Visualizes the relationship between pitch (F0) and resonance (F1)
 * 
 * X-axis: F1 (resonance) - Left is darker/masculine, Right is brighter/feminine
 * Y-axis: Pitch (F0) - Bottom is lower/masculine, Top is higher/feminine
 * 
 * Quadrants:
 * - Bottom-Left: Masculine (low pitch + dark resonance)
 * - Top-Right: Feminine (high pitch + bright resonance)
 * - Top-Left: Conflict (high pitch + dark resonance)
 * - Bottom-Right: Conflict (low pitch + bright resonance)
 */
const PitchResonanceQuadrant = ({ dataRef, size = 300 }) => {
    const { colorBlindMode } = useSettings();
    const canvasRef = useRef(null);
    const trailRef = useRef([]);
    const [prediction, setPrediction] = useState(null);

    // Axis ranges
    const PITCH_MIN = 80;
    const PITCH_MAX = 280;
    const F1_MIN = 300;
    const F1_MAX = 800;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const width = size;
        const height = size;
        const padding = 35;

        // Map values to canvas coordinates
        const mapX = (f1) => padding + ((f1 - F1_MIN) / (F1_MAX - F1_MIN)) * (width - padding * 2);
        const mapY = (pitch) => height - padding - ((pitch - PITCH_MIN) / (PITCH_MAX - PITCH_MIN)) * (height - padding * 2);

        const loop = () => {
            ctx.clearRect(0, 0, width, height);

            // Background gradient quadrants
            const gradient = ctx.createLinearGradient(0, height, width, 0);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)'); // Blue (masculine)
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)'); // Purple (ambiguous)
            gradient.addColorStop(1, 'rgba(236, 72, 153, 0.15)'); // Pink (feminine)
            ctx.fillStyle = gradient;
            ctx.fillRect(padding, padding, width - padding * 2, height - padding * 2);

            // Ambiguity zone horizontal band (135-175 Hz)
            const ambigTop = mapY(AMBIGUITY_ZONE.max);
            const ambigBot = mapY(AMBIGUITY_ZONE.min);
            ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
            ctx.fillRect(padding, ambigTop, width - padding * 2, ambigBot - ambigTop);

            // Crossover point marker (157 Hz, 500 Hz F1)
            const crossX = mapX(500);
            const crossY = mapY(157);
            ctx.beginPath();
            ctx.arc(crossX, crossY, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.font = '9px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

            // Pitch grid (horizontal)
            for (let p = 100; p <= 250; p += 50) {
                const y = mapY(p);
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
                ctx.textAlign = 'right';
                ctx.fillText(`${p}`, padding - 5, y + 3);
            }

            // F1 grid (vertical)
            for (let f = 400; f <= 700; f += 100) {
                const x = mapX(f);
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();
                ctx.textAlign = 'center';
                ctx.fillText(`${f}`, x, height - padding + 12);
            }

            // Axis labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('F1 (Resonance) →', width / 2, height - 5);

            ctx.save();
            ctx.translate(10, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Pitch (F0) →', 0, 0);
            ctx.restore();

            // Quadrant labels
            ctx.font = '9px sans-serif';
            ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
            ctx.textAlign = 'left';
            ctx.fillText('♂ Low/Dark', padding + 5, height - padding - 10);

            ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
            ctx.textAlign = 'right';
            ctx.fillText('♀ High/Bright', width - padding - 5, padding + 15);

            // Trail
            const trail = trailRef.current;
            if (trail.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                for (let i = 0; i < trail.length; i++) {
                    const pt = trail[i];
                    const x = mapX(pt.f1);
                    const y = mapY(pt.pitch);
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();

                // Fading dots for trail
                trail.forEach((pt, i) => {
                    const opacity = (i / trail.length) * 0.5;
                    const x = mapX(pt.f1);
                    const y = mapY(pt.pitch);
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fill();
                });
            }

            // Current position
            if (dataRef.current) {
                const { pitch, f1, resonanceScore } = dataRef.current;

                if (pitch > 50 && f1 > 200) {
                    const x = mapX(Math.max(F1_MIN, Math.min(F1_MAX, f1)));
                    const y = mapY(Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch)));

                    // Get prediction
                    const pred = predictGenderPerception(pitch, f1, resonanceScore);
                    setPrediction(pred);

                    // Add to trail
                    trailRef.current.push({ pitch, f1 });
                    if (trailRef.current.length > 30) {
                        trailRef.current.shift();
                    }

                    // Draw current position with glow
                    const color = getPerceptionColor(pred.score, colorBlindMode);

                    // Glow
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = color;

                    // Outer ring
                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, Math.PI * 2);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Inner dot
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();

                    ctx.shadowBlur = 0;
                }
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            'pitch-resonance-quadrant',
            loop,
            renderCoordinator.PRIORITY.NORMAL
        );

        return () => unsubscribe();
    }, [size, colorBlindMode, dataRef]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                style={{ width: size, height: size }}
                className="rounded-xl bg-slate-900/50 border border-white/10"
            />

            {/* Prediction badge */}
            {prediction && prediction.confidence > 0 && (
                <div
                    className="absolute top-2 right-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border text-xs font-bold"
                    style={{
                        backgroundColor: `${getPerceptionColor(prediction.score, colorBlindMode)}20`,
                        borderColor: `${getPerceptionColor(prediction.score, colorBlindMode)}50`,
                        color: getPerceptionColor(prediction.score, colorBlindMode)
                    }}
                >
                    {prediction.label}
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[9px] text-slate-500">
                <span>← Darker</span>
                <span className="text-purple-400">Ambiguity Zone</span>
                <span>Brighter →</span>
            </div>
        </div>
    );
};

export default PitchResonanceQuadrant;

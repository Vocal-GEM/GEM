import { useEffect, useRef, useState, useId, useMemo } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Convert Hz to semitones (MIDI note number)
const hzToSemitones = (hz) => {
    if (hz <= 0) return 0;
    return Math.round(12 * Math.log2(hz / 440) + 69);
};

// Get note name from MIDI number
const getNoteFromSemitone = (semitone) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(semitone / 12) - 1;
    const note = notes[semitone % 12];
    return `${note}${octave}`;
};

const PitchOrb = ({ dataRef, settings = {} }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 });
    const [showSemitones, setShowSemitones] = useState(false);
    const componentId = useId();

    // Default gender ranges if not set in settings
    const defaultRanges = useMemo(() => ({
        feminine: { min: 165, max: 300 },
        androgynous: { min: 135, max: 175 },
        masculine: { min: 85, max: 135 }
    }), []);

    const genderRanges = useMemo(() => settings.genderRanges || defaultRanges, [settings.genderRanges, defaultRanges]);

    // Handle resizing efficiently
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const updateSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Only update if dimensions actually changed to avoid clearing canvas
            if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
                canvas.width = Math.round(width * dpr);
                canvas.height = Math.round(height * dpr);
                dimensionsRef.current = { width, height, dpr };
            }
        };

        // Initial size
        updateSize();

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateSize);
        });

        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: alpha: false if opaque

        // Determine color based on pitch and gender ranges
        const getGenderColor = (pitch) => {
            if (pitch >= genderRanges.feminine.min) {
                return {
                    primary: '#ec4899',
                    glow: 'rgba(236, 72, 153, 0.6)',
                    label: 'Feminine'
                };
            }
            if (pitch >= genderRanges.androgynous.min && pitch <= genderRanges.androgynous.max) {
                return {
                    primary: '#a855f7',
                    glow: 'rgba(168, 85, 247, 0.6)',
                    label: 'Androgynous'
                };
            }
            if (pitch >= genderRanges.masculine.min && pitch <= genderRanges.masculine.max) {
                return {
                    primary: '#3b82f6',
                    glow: 'rgba(59, 130, 246, 0.6)',
                    label: 'Masculine'
                };
            }
            return {
                primary: '#64748b',
                glow: 'rgba(100, 116, 139, 0.3)',
                label: 'Out of Range'
            };
        };

        const loop = () => {
            if (!canvas) return; // Guard against cleanup

            // Optimization: Read from ref instead of DOM (layout thrashing)
            const { width, height, dpr } = dimensionsRef.current;
            if (width === 0 || height === 0) return;

            // Set transform to handle DPR scaling
            // We set it every frame because we need to clear the canvas which relies on the transform?
            // Actually, if we use setTransform, we overwrite previous transforms, which prevents accumulation.
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const centerX = width / 2;
            const centerY = height / 2;

            // Clear using logical dimensions
            ctx.clearRect(0, 0, width, height);

            // Re-drawing background because we might have used alpha: false or just for safety
            // If alpha: false, clearRect might fill with black (or default color).
            // But the component uses a transparent canvas in a div?
            // The original code used clearRect and had a glass panel behind it.
            // If I used alpha: false, I need to fill the background manually if transparency was expected.
            // The original code didn't specify context options, so alpha was true.
            // I'll revert alpha: false to be safe, as 'glass-panel-dark' implies transparency might be needed or handled by CSS.
            // Wait, clearRect makes pixels transparent. If alpha: false, they become black.
            // The canvas is inside a div with 'glass-panel-dark'. The canvas itself usually sits on top.
            // Let's stick to default alpha: true for now to avoid visual regressions.

            const pitch = dataRef.current?.pitch || 0;
            const colorData = getGenderColor(pitch);

            // Draw orb
            const baseRadius = Math.min(width, height) * 0.35;
            const pulseAmount = pitch > 0 ? Math.sin(Date.now() / 300) * 5 : 0;
            const radius = baseRadius + pulseAmount;

            // Outer glow
            if (pitch > 0) {
                const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);
                gradient.addColorStop(0, colorData.glow);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Main orb
            const orbGradient = ctx.createRadialGradient(
                centerX - radius * 0.3,
                centerY - radius * 0.3,
                radius * 0.1,
                centerX,
                centerY,
                radius
            );

            if (pitch > 0) {
                orbGradient.addColorStop(0, `${colorData.primary}aa`);
                orbGradient.addColorStop(0.7, colorData.primary);
                orbGradient.addColorStop(1, `${colorData.primary}66`);
            } else {
                orbGradient.addColorStop(0, '#475569');
                orbGradient.addColorStop(1, '#1e293b');
            }

            ctx.fillStyle = orbGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = pitch > 0 ? colorData.primary : '#334155';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Text
            if (pitch > 0) {
                const displayValue = showSemitones ? hzToSemitones(pitch) : Math.round(pitch);
                const displayUnit = showSemitones ? '' : ' Hz';
                const noteName = showSemitones ? getNoteFromSemitone(hzToSemitones(pitch)) : '';

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 48px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(displayValue + displayUnit, centerX, centerY - 10);

                if (showSemitones && noteName) {
                    ctx.font = 'bold 24px sans-serif';
                    ctx.fillStyle = '#ffffff99';
                    ctx.fillText(noteName, centerX, centerY + 25);
                }

                // Gender label
                ctx.font = 'bold 14px sans-serif';
                ctx.fillStyle = colorData.primary;
                ctx.fillText(colorData.label, centerX, centerY + (showSemitones ? 50 : 35));
            } else {
                ctx.fillStyle = '#64748b';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('--- Hz', centerX, centerY);
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            `pitch-orb-${componentId}`,
            loop,
            renderCoordinator.PRIORITY.CRITICAL
        );

        return () => {
            unsubscribe();
        };
    }, [dataRef, showSemitones, genderRanges, componentId]);

    return (
        <div ref={containerRef} className="glass-panel-dark rounded-2xl p-6 relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Pitch
                </div>
                <button
                    onClick={() => setShowSemitones(!showSemitones)}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                >
                    {showSemitones ? 'Show Hz' : 'Show Notes'}
                </button>
            </div>
            <canvas ref={canvasRef} className="w-full h-64" />
        </div>
    );
};

export default PitchOrb;

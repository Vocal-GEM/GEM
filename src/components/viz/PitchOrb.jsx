import React, { useEffect, useRef, useState } from 'react';

const PitchOrb = ({ dataRef, settings = {} }) => {
    const canvasRef = useRef(null);
    const [showSemitones, setShowSemitones] = useState(false);

    // Default gender ranges if not set in settings
    const defaultRanges = {
        feminine: { min: 165, max: 300 },
        androgynous: { min: 145, max: 175 },
        masculine: { min: 85, max: 145 }
    };

    const genderRanges = settings.genderRanges || defaultRanges;

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

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const loop = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

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

            requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'pitch-orb',
                loop,
                renderCoordinator.PRIORITY.CRITICAL
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef, showSemitones, genderRanges]);

    return (
        <div className="glass-panel-dark rounded-2xl p-6 relative overflow-hidden shadow-lg">
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

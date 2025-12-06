import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import React, { useRef, useEffect, useState } from 'react';

const VowelSpacePlot = ({ dataRef, showAnalysis = true, targetVowel = null, isRecording = false }) => {
    const { colorBlindMode } = useSettings();
    const { profile } = useProfile();

    // Determine ranges based on profile (default to feminine if unknown or not set)
    const isMasc = profile?.gender === 'masc';

    // Scales - Adaptive
    // Feminine: F1 200-1000, F2 500-3000
    // Masculine: F1 150-850, F2 500-2500
    const minF1 = isMasc ? 150 : 200;
    const maxF1 = isMasc ? 850 : 1000;
    const minF2 = isMasc ? 500 : 500;
    const maxF2 = isMasc ? 2500 : 3000;

    // Vowel targets (approximate)
    const targets = {
        'i': { label: '/i/', f1: isMasc ? 270 : 300, f2: isMasc ? 2200 : 2500, color: colorBlindMode ? '#9333ea' : '#ec4899' }, // Pink/Purple
        'a': { label: '/a/', f1: isMasc ? 750 : 850, f2: isMasc ? 1200 : 1700, color: colorBlindMode ? '#0d9488' : '#3b82f6' }, // Blue/Teal
        'u': { label: '/u/', f1: isMasc ? 270 : 300, f2: isMasc ? 700 : 800, color: colorBlindMode ? '#f59e0b' : '#10b981' }   // Green/Amber
    };

    const getXPos = (val) => 100 - ((val - minF2) / (maxF2 - minF2)) * 100;
    const getYPos = (val) => ((val - minF1) / (maxF1 - minF1)) * 100;

    const pointRef = useRef(null);
    const labelRef = useRef(null);
    const canvasRef = useRef(null);

    const [currentVowel, setCurrentVowel] = useState('');
    const [hitScore, setHitScore] = useState(0);

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationId;

        const render = () => {
            // Clear Canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Target Zones
            Object.entries(targets).forEach(([key, t]) => {
                const isActive = targetVowel === key;
                const opacity = isActive ? 0.6 : (targetVowel ? 0.1 : 0.3);

                const x = (getXPos(t.f2) / 100) * canvas.width;
                const y = (getYPos(t.f1) / 100) * canvas.height;

                // Glowing effect for active target
                if (isActive) {
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
                    gradient.addColorStop(0, `${t.color}40`);
                    gradient.addColorStop(1, `${t.color}00`);
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, 60, 0, Math.PI * 2);
                    ctx.fill();

                    // Pulse Ring
                    const time = Date.now() / 500;
                    const pulseSize = 20 + Math.sin(time) * 5;
                    ctx.strokeStyle = t.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Core Circle
                ctx.fillStyle = t.color;
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.globalAlpha = isActive ? 1 : 0.5;
                ctx.fillStyle = '#fff';
                ctx.font = isActive ? 'bold 16px Inter' : '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(t.label, x, y + 25);
                ctx.globalAlpha = 1;
            });

            // Update User Dot
            if (dataRef && dataRef.current && isRecording) {
                const { f1, f2, vowel, clarity } = dataRef.current;

                if (f1 && f2 && clarity > 0.4) {
                    const x = (getXPos(f2) / 100) * canvas.width;
                    const y = (getYPos(f1) / 100) * canvas.height;

                    // Smooth transition (lerp could be added here for smoother movement)
                    if (pointRef.current) {
                        pointRef.current.style.transform = `translate(${x}px, ${y}px)`;
                        pointRef.current.style.opacity = '1';
                    }

                    // Check Hit
                    if (targetVowel) {
                        const t = targets[targetVowel];
                        const tx = (getXPos(t.f2) / 100) * canvas.width;
                        const ty = (getYPos(t.f1) / 100) * canvas.height;
                        const distance = Math.hypot(x - tx, y - ty);

                        // Hit threshold
                        if (distance < 50) {
                            setHitScore(prev => Math.min(100, prev + 1));
                        }
                    }

                    if (labelRef.current) {
                        labelRef.current.innerText = `${f1.toFixed(0)} / ${f2.toFixed(0)} Hz`;
                        // Move label with point
                        labelRef.current.style.transform = `translate(${x + 15}px, ${y}px)`;
                    }

                    setCurrentVowel(vowel);
                } else if (pointRef.current) {
                    pointRef.current.style.opacity = '0.1';
                }
            }

            animationId = requestAnimationFrame(render);
        };

        // Resize handler
        const resize = () => {
            if (!canvas.parentElement) return;
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        render();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [targetVowel, isMasc, isRecording, colorBlindMode]);

    return (
        <div className="w-full h-full relative bg-slate-950 rounded-xl overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

            {/* Grid Lines / Labels */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-4 left-4 text-xs font-mono text-white">High F2 (Front)</div>
                <div className="absolute top-4 right-4 text-xs font-mono text-white">Low F2 (Back)</div>
                <div className="absolute top-1/2 left-2 -rotate-90 text-xs font-mono text-white origin-left">Low F1 (Close)</div>
                <div className="absolute bottom-4 left-4 text-xs font-mono text-white">High F1 (Open)</div>
            </div>

            {/* User Dot (HTML Overlay for crispness/glow) */}
            <div
                ref={pointRef}
                className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-none transition-opacity duration-200 -ml-3 -mt-3"
                style={{ opacity: 0, top: 0, left: 0 }}
            >
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50"></div>
            </div>

            <div ref={labelRef} className="absolute text-[10px] font-mono text-slate-400 pointer-events-none whitespace-nowrap px-2 py-1 bg-black/50 rounded" style={{ top: 0, left: 0 }}></div>

            {/* Hit Score Feedback */}
            {targetVowel && isRecording && (
                <div className="absolute bottom-6 right-6 flex flex-col items-center">
                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Target Resonance</div>
                    <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${hitScore}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VowelSpacePlot;

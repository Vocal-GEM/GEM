import React, { useEffect, useRef } from 'react';

const ResonanceOrb = ({ dataRef, calibration }) => {
    const orbRef = useRef(null);
    const labelRef = useRef(null);
    const minC = calibration ? calibration.dark : 500;
    const maxC = calibration ? calibration.bright : 2500;

    useEffect(() => {
        const loop = () => {
            if (orbRef.current) {
                const { resonance, weight, pitch } = dataRef.current;
                let rPercent = 0;
                if (resonance > 0) {
                    // Adjusted normalization to be less sensitive to extremes
                    // minC (dark) ~ 500, maxC (bright) ~ 2500
                    // Typical speech is often 800-1800
                    // Let's clamp the input range slightly to focus on the middle
                    const effectiveMin = minC + 200;
                    const effectiveMax = maxC - 200;
                    rPercent = ((resonance - effectiveMin) / (effectiveMax - effectiveMin));
                    rPercent = Math.max(0, Math.min(1, rPercent));
                }

                let color = `rgb(59, 130, 246)`;
                if (rPercent > 0.5) { const t = (rPercent - 0.5) * 2; color = `rgb(${139 + (234 - 139) * t}, ${92 + (179 - 92) * t}, ${246 + (8 - 246) * t})`; } else { const t = rPercent * 2; color = `rgb(${59 + (139 - 59) * t}, ${130 + (92 - 130) * t}, ${246 + (246 - 246) * t})`; }
                if (rPercent > 0.8) color = `rgb(250, 204, 21)`;

                const scale = 1 + (weight / 200);
                orbRef.current.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${color})`;
                orbRef.current.style.boxShadow = `0 0 ${20 + weight}px ${color}, inset 0 0 20px rgba(255,255,255,0.5)`;
                orbRef.current.style.transform = `scale(${scale})`;
                orbRef.current.style.opacity = pitch > 0 ? 1 : 0.3;

                if (labelRef.current) {
                    if (pitch <= 0) labelRef.current.innerText = "Listening...";
                    else if (rPercent > 0.75) labelRef.current.innerText = "Bright / Head"; // Higher threshold
                    else if (rPercent < 0.25) labelRef.current.innerText = "Dark / Chest"; // Lower threshold
                    else labelRef.current.innerText = "Balanced";
                }
            }
            requestAnimationFrame(loop);
        };
        const id = requestAnimationFrame(loop); return () => cancelAnimationFrame(id);
    }, [calibration]);

    return (
        <div className="relative h-48 w-full flex items-center justify-center mb-6 mt-2">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
            <div ref={orbRef} className="w-32 h-32 rounded-full transition-colors duration-200 z-10 relative"></div>
            <div ref={labelRef} className="absolute bottom-0 translate-y-full text-xs font-bold tracking-widest text-slate-400 uppercase mt-4">Listening...</div>
        </div>
    );
};

export default ResonanceOrb;
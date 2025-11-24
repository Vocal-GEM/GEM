import React, { useEffect, useRef } from 'react';

const ResonanceOrb = ({ dataRef, calibration }) => {
    const orbRef = useRef(null);
    const labelRef = useRef(null);
    const minC = calibration ? calibration.dark : 500;
    const maxC = calibration ? calibration.bright : 2500;

    // Ref for smoothing
    const currentRPercent = useRef(0);

    useEffect(() => {
        const loop = () => {
            if (orbRef.current) {
                const { resonance, weight, pitch } = dataRef.current;

                // 1. Calculate Target Percentage
                let targetRPercent = 0;
                if (resonance > 0) {
                    // Adjusted normalization:
                    // Lowering the "bright" threshold slightly to make it easier to hit
                    // Shifting the "dark" threshold up slightly to avoid false positives
                    const effectiveMin = minC + 100; // ~600Hz
                    const effectiveMax = maxC - 400; // ~2100Hz (was 2500)

                    targetRPercent = ((resonance - effectiveMin) / (effectiveMax - effectiveMin));
                    targetRPercent = Math.max(0, Math.min(1, targetRPercent));
                }

                // 2. Smoothing (Lerp)
                // factor 0.05 = slow smooth
                const smoothFactor = 0.05;
                currentRPercent.current = currentRPercent.current + (targetRPercent - currentRPercent.current) * smoothFactor;

                const rPercent = currentRPercent.current;

                // 3. Visuals
                let color = `rgb(59, 130, 246)`; // Blue (Neutral)

                if (rPercent > 0.5) {
                    // Blue -> Yellow
                    const t = (rPercent - 0.5) * 2;
                    // Interpolate Blue (59, 130, 246) to Yellow (250, 204, 21)
                    color = `rgb(${59 + (250 - 59) * t}, ${130 + (204 - 130) * t}, ${246 + (21 - 246) * t})`;
                } else {
                    // Darker Blue -> Blue
                    const t = rPercent * 2;
                    // Darker Blue (30, 58, 138) -> Blue (59, 130, 246)
                    color = `rgb(${30 + (59 - 30) * t}, ${58 + (130 - 58) * t}, ${138 + (246 - 138) * t})`;
                }

                const scale = 1 + (weight / 200);
                orbRef.current.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${color})`;
                orbRef.current.style.boxShadow = `0 0 ${20 + weight}px ${color}, inset 0 0 20px rgba(255,255,255,0.5)`;
                orbRef.current.style.transform = `scale(${scale})`;
                orbRef.current.style.opacity = pitch > 0 ? 1 : 0.3;

                if (labelRef.current) {
                    if (pitch <= 0) labelRef.current.innerText = "Listening...";
                    else if (rPercent > 0.65) labelRef.current.innerText = "Bright / Head"; // Lowered threshold
                    else if (rPercent < 0.35) labelRef.current.innerText = "Dark / Chest"; // Raised threshold
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
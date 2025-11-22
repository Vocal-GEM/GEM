import React, { useEffect, useRef } from 'react';

const StaircaseGame = ({ dataRef, targetRange, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const gameState = useRef({ step: 0, progress: 0, targetPitch: 0, currentStepPitch: 0, score: 0, width: 300, height: 400, unstableFrames: 0 });
    const generateScale = () => { const start = targetRange.min; const stepSize = (targetRange.max - targetRange.min) / 5; return [start, start + stepSize, start + stepSize * 2, start + stepSize * 3, start + stepSize * 4]; };
    const scale = useRef(generateScale());
    useEffect(() => {
        const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1;
        const resize = () => { const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); gameState.current.width = rect.width; gameState.current.height = rect.height; };
        resize(); window.addEventListener('resize', resize);
        const loop = () => {
            const state = gameState.current; const width = state.width; const height = state.height;
            const target = scale.current[state.step % scale.current.length]; state.targetPitch = target; const currentPitch = dataRef.current.pitch;
            let isStable = false;
            if (currentPitch > 0) { const diff = Math.abs(currentPitch - target); if (diff < 15) { isStable = true; state.progress += 0.5; state.unstableFrames = 0; } else { state.unstableFrames++; if (state.unstableFrames > 30) { state.progress = Math.max(0, state.progress - 1); } } }
            if (state.progress >= 100) { state.step++; state.progress = 0; state.score += 10; onScore(state.score); }
            ctx.clearRect(0, 0, width, height); const gradient = ctx.createLinearGradient(0, 0, 0, height); gradient.addColorStop(0, '#1e293b'); gradient.addColorStop(1, '#0f172a'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
            const startY = height - 50;
            for (let i = -1; i < 3; i++) { const sIndex = state.step + i; if (sIndex < 0) continue; const x = 50 + (i * 60); const y = startY - (i * 50); ctx.fillStyle = i === 0 ? '#3b82f6' : '#475569'; ctx.fillRect(x, y, 100, 10); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px monospace'; const note = scale.current[sIndex % scale.current.length]; ctx.fillText(Math.round(note) + "Hz", x + 20, y + 25); }
            if (state.progress > 0) { const bridgeWidth = (state.progress / 100) * 60; const bx = 150; const by = startY; ctx.fillStyle = isStable ? '#4ade80' : '#facc15'; ctx.fillRect(bx, by, bridgeWidth, 5); ctx.fillStyle = 'white'; ctx.font = 'bold 12px sans-serif'; ctx.fillText(Math.round(state.progress) + "%", bx + 10, by - 10); }
            const charX = 100; const charY = startY - 30; ctx.font = '30px Arial'; ctx.fillText('🧗', charX, charY);
            ctx.textAlign = 'center'; ctx.fillStyle = 'white'; if (isStable) { ctx.font = 'bold 16px sans-serif'; ctx.fillText("HOLD STEADY!", width / 2, 50); } else { ctx.font = '14px sans-serif'; ctx.fillStyle = '#94a3b8'; ctx.fillText(`Target: ${Math.round(target)} Hz`, width / 2, 50); if (currentPitch > 0) { const diff = currentPitch - target; ctx.fillStyle = diff > 0 ? '#f87171' : '#60a5fa'; ctx.fillText(diff > 0 ? "Too High" : "Too Low", width / 2, 70); } } ctx.textAlign = 'left';
            ctx.fillStyle = 'white'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(`Score: ${state.score}`, width - 20, 30);
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(requestRef.current); };
    }, [targetRange, onScore]);
    return (<div className="relative w-full mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800"> <canvas ref={canvasRef} className="w-full h-80 block cursor-pointer"></canvas> <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10"> 🧗 Hold Pitch to Build </div> <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors z-10"> <i data-lucide="x" className="w-4 h-4"></i> </button> </div>);
};

export default StaircaseGame;

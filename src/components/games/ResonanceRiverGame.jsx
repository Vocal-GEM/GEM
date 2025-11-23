import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ResonanceRiverGame = ({ dataRef, calibration, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const gameState = useRef({ playerLane: 1, playerX: 50, targetX: 50, obstacles: [], score: 0, speed: 2.5, frameCount: 0, gameOver: false, lastCollision: 0, width: 300, height: 400 });
    useEffect(() => {
        const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1;
        const resize = () => { const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); gameState.current.width = rect.width; gameState.current.height = rect.height; };
        resize(); window.addEventListener('resize', resize);
        const loop = () => {
            const state = gameState.current; const width = state.width; const height = state.height; const laneWidth = width / 3;
            if (!state.gameOver) {
                const { resonance, pitch } = dataRef.current; const minR = calibration ? calibration.dark : 500; const maxR = calibration ? calibration.bright : 2500;
                if (pitch > 0 && resonance > 0) { const norm = Math.max(0, Math.min(1, (resonance - minR) / (maxR - minR))); if (norm < 0.35) state.playerLane = 0; else if (norm > 0.65) state.playerLane = 2; else state.playerLane = 1; } else { state.playerLane = 1; }
                state.targetX = (state.playerLane * laneWidth) + (laneWidth / 2); state.playerX += (state.targetX - state.playerX) * 0.1; state.frameCount++;
                if (state.frameCount % 60 === 0) { const lane = Math.floor(Math.random() * 3); const isCoin = Math.random() > 0.7; state.obstacles.push({ lane, x: (lane * laneWidth) + (laneWidth / 2), y: -50, type: isCoin ? 'star' : 'rock', collected: false }); }
                state.obstacles.forEach(obs => obs.y += state.speed); state.obstacles = state.obstacles.filter(obs => obs.y < height + 50);
                const playerY = height - 60;
                state.obstacles.forEach(obs => { const distY = Math.abs(obs.y - playerY); const distX = Math.abs(obs.x - state.playerX); if (distY < 40 && distX < 30 && !obs.collected) { if (obs.type === 'rock') { if (Date.now() - state.lastCollision > 1000) { state.gameOver = true; state.lastCollision = Date.now(); } } else if (obs.type === 'star') { obs.collected = true; state.score += 10; onScore(state.score); if (state.score % 50 === 0) state.speed += 0.2; } } });
            }
            ctx.clearRect(0, 0, width, height); const gradient = ctx.createLinearGradient(0, 0, 0, height); gradient.addColorStop(0, '#1e3a8a'); gradient.addColorStop(1, '#3b82f6'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(laneWidth, 0); ctx.lineTo(laneWidth, height); ctx.moveTo(laneWidth * 2, 0); ctx.lineTo(laneWidth * 2, height); ctx.stroke();
            state.obstacles.forEach(obs => { if (obs.collected) return; ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const icon = obs.type === 'star' ? '🌟' : '🪨'; ctx.fillText(icon, obs.x, obs.y); });
            ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🚣', state.playerX, height - 60);
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px sans-serif'; ctx.fillText('DARK', laneWidth / 2, height - 10); ctx.fillText('NEUTRAL', width / 2, height - 10); ctx.fillText('BRIGHT', width - laneWidth / 2, height - 10);
            ctx.fillStyle = 'white'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(state.score, width - 20, 40);
            if (state.gameOver) { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = 'white'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Crash!', width / 2, height / 2); ctx.font = '16px sans-serif'; ctx.fillStyle = '#cbd5e1'; ctx.fillText('Tap to restart', width / 2, height / 2 + 30); }
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        const handleTap = () => { if (gameState.current.gameOver) { gameState.current.gameOver = false; gameState.current.obstacles = []; gameState.current.score = 0; gameState.current.speed = 2.5; gameState.current.playerLane = 1; } };
        canvas.addEventListener('mousedown', handleTap); canvas.addEventListener('touchstart', handleTap);
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(requestRef.current); canvas.removeEventListener('mousedown', handleTap); canvas.removeEventListener('touchstart', handleTap); };
    }, [calibration, onScore]);
    return (<div className="relative w-full mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800"> <canvas ref={canvasRef} className="w-full h-80 block cursor-pointer"></canvas> <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10"> 🚣 Use RESONANCE to steer </div> <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors z-10"> <X className="w-4 h-4" /> </button> </div>);
};

export default ResonanceRiverGame;

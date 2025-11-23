import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const CloudHopperGame = ({ dataRef, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const gameState = useRef({ player: { x: 150, y: 300, vy: 0, radius: 15, grounded: true }, platforms: [], cameraY: 0, score: 0, width: 300, height: 400, gameOver: false });
    useEffect(() => {
        const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1;
        const resize = () => {
            const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); gameState.current.width = rect.width; gameState.current.height = rect.height;
            if (gameState.current.platforms.length === 0) { for (let i = 0; i < 6; i++) { gameState.current.platforms.push({ x: Math.random() * (rect.width - 60), y: rect.height - (i * 100) - 50, width: 60, height: 15 }); } gameState.current.platforms[0].x = rect.width / 2 - 30; gameState.current.platforms[0].y = rect.height - 50; gameState.current.player.x = rect.width / 2; gameState.current.player.y = rect.height - 70; }
        };
        resize(); window.addEventListener('resize', resize);
        const loop = () => {
            const state = gameState.current; const width = state.width; const height = state.height;
            if (!state.gameOver) {
                const weight = dataRef.current.weight; if (state.player.grounded && weight > 10) { const force = Math.min(100, weight) / 100; state.player.vy = -10 - (force * 15); state.player.grounded = false; }
                state.player.vy += 0.5; state.player.y += state.player.vy;
                if (state.player.vy > 0) { state.platforms.forEach(p => { if (state.player.x > p.x && state.player.x < p.x + p.width && state.player.y + state.player.radius > p.y && state.player.y + state.player.radius < p.y + p.height + 10) { state.player.y = p.y - state.player.radius; state.player.vy = 0; state.player.grounded = true; } }); }
                if (state.player.y < height / 2) { const diff = (height / 2) - state.player.y; state.player.y = height / 2; state.platforms.forEach(p => { p.y += diff; if (p.y > height) { p.y = -20; p.x = Math.random() * (width - 60); state.score += 1; onScore(state.score); } }); }
                if (state.player.y > height + 50) state.gameOver = true; if (state.player.x < 0) state.player.x = width; if (state.player.x > width) state.player.x = 0;
            }
            ctx.clearRect(0, 0, width, height); const gradient = ctx.createLinearGradient(0, 0, 0, height); gradient.addColorStop(0, '#38bdf8'); gradient.addColorStop(1, '#bae6fd'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
            state.platforms.forEach(p => { ctx.font = '30px Arial'; ctx.fillText('☁️', p.x, p.y + 20); });
            ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🐸', state.player.x, state.player.y);
            const w = dataRef.current.weight; const barHeight = Math.min(100, w) * 2; ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(10, height - 210, 20, 200); ctx.fillStyle = w > 10 ? '#4ade80' : '#f87171'; ctx.fillRect(10, height - 10 - barHeight, 20, barHeight);
            ctx.fillStyle = 'white'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(state.score, width - 20, 50);
            if (state.gameOver) { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = 'white'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Fell!', width / 2, height / 2); ctx.font = '16px sans-serif'; ctx.fillStyle = '#cbd5e1'; ctx.fillText('Tap to restart', width / 2, height / 2 + 30); }
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        const handleTap = () => { if (gameState.current.gameOver) { gameState.current.gameOver = false; gameState.current.score = 0; gameState.current.platforms = []; gameState.current.player = { x: 150, y: 300, vy: 0, radius: 15, grounded: true }; const rect = canvas.getBoundingClientRect(); for (let i = 0; i < 6; i++) { gameState.current.platforms.push({ x: Math.random() * (rect.width - 60), y: rect.height - (i * 100) - 50, width: 60, height: 15 }); } gameState.current.platforms[0].x = rect.width / 2 - 30; gameState.current.platforms[0].y = rect.height - 50; gameState.current.player.x = rect.width / 2; gameState.current.player.y = rect.height - 70; } };
        canvas.addEventListener('mousedown', handleTap); canvas.addEventListener('touchstart', handleTap);
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(requestRef.current); canvas.removeEventListener('mousedown', handleTap); canvas.removeEventListener('touchstart', handleTap); };
    }, [onScore]);
    return (<div className="relative w-full mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800"> <canvas ref={canvasRef} className="w-full h-96 block cursor-pointer"></canvas> <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10"> 🐸 Jump with VOLUME </div> <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors z-10"> <X className="w-4 h-4" /> </button> </div>);
};

export default CloudHopperGame;

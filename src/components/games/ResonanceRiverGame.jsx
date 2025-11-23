import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ResonanceRiverGame = ({ dataRef, calibration, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const gameState = useRef({
        playerLane: 1,
        playerX: 50,
        targetX: 50,
        obstacles: [],
        score: 0,
        speed: 2.5,
        frameCount: 0,
        gameOver: false,
        lastCollision: 0,
        width: 300,
        height: 400,
        particles: [], // Splash/Sparkle effects
        waterOffset: 0
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            gameState.current.width = rect.width;
            gameState.current.height = rect.height;
        };

        resize();
        window.addEventListener('resize', resize);

        const loop = () => {
            const state = gameState.current;
            const width = state.width;
            const height = state.height;
            const laneWidth = width / 3;

            if (!state.gameOver) {
                const { resonance, pitch } = dataRef.current;
                const minR = calibration ? calibration.dark : 500;
                const maxR = calibration ? calibration.bright : 2500;

                // Lane Logic
                let targetLane = 1;
                if (pitch > 0 && resonance > 0) {
                    const norm = Math.max(0, Math.min(1, (resonance - minR) / (maxR - minR)));
                    if (norm < 0.35) targetLane = 0;
                    else if (norm > 0.65) targetLane = 2;
                    else targetLane = 1;
                }

                // Splash on lane change
                if (targetLane !== state.playerLane) {
                    for (let i = 0; i < 3; i++) {
                        state.particles.push({
                            x: state.playerX,
                            y: height - 60,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2,
                            life: 20,
                            color: 'rgba(255, 255, 255, 0.5)',
                            size: Math.random() * 3
                        });
                    }
                }
                state.playerLane = targetLane;

                state.targetX = (state.playerLane * laneWidth) + (laneWidth / 2);
                state.playerX += (state.targetX - state.playerX) * 0.1;
                state.frameCount++;
                state.waterOffset += 0.5;

                // Spawn Obstacles
                if (state.frameCount % 60 === 0) {
                    const lane = Math.floor(Math.random() * 3);
                    const isCoin = Math.random() > 0.7;
                    state.obstacles.push({
                        lane,
                        x: (lane * laneWidth) + (laneWidth / 2),
                        y: -50,
                        type: isCoin ? 'star' : 'rock',
                        collected: false,
                        angle: 0
                    });
                }

                state.obstacles.forEach(obs => {
                    obs.y += state.speed;
                    obs.angle += 0.05;
                });
                state.obstacles = state.obstacles.filter(obs => obs.y < height + 50);

                const playerY = height - 60;

                // Collision
                state.obstacles.forEach(obs => {
                    const distY = Math.abs(obs.y - playerY);
                    const distX = Math.abs(obs.x - state.playerX);

                    if (distY < 40 && distX < 30 && !obs.collected) {
                        if (obs.type === 'rock') {
                            if (Date.now() - state.lastCollision > 1000) {
                                state.gameOver = true;
                                state.lastCollision = Date.now();
                            }
                        } else if (obs.type === 'star') {
                            obs.collected = true;
                            state.score += 10;
                            onScore(state.score);
                            if (state.score % 50 === 0) state.speed += 0.2;

                            // Sparkles
                            for (let i = 0; i < 8; i++) {
                                state.particles.push({
                                    x: obs.x,
                                    y: obs.y,
                                    vx: (Math.random() - 0.5) * 5,
                                    vy: (Math.random() - 0.5) * 5,
                                    life: 30,
                                    color: '#fbbf24',
                                    size: Math.random() * 4
                                });
                            }
                        }
                    }
                });

                // Update Particles
                state.particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life--;
                });
                state.particles = state.particles.filter(p => p.life > 0);
            }

            // --- RENDER ---
            ctx.clearRect(0, 0, width, height);

            // Water
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#1e3a8a');
            gradient.addColorStop(1, '#3b82f6');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Water Ripples
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 2;
            for (let i = 0; i < height; i += 40) {
                const y = (i + state.waterOffset) % height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.quadraticCurveTo(width / 2, y + 20, width, y);
                ctx.stroke();
            }

            // Lane Dividers
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(laneWidth, 0);
            ctx.lineTo(laneWidth, height);
            ctx.moveTo(laneWidth * 2, 0);
            ctx.lineTo(laneWidth * 2, height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Obstacles
            state.obstacles.forEach(obs => {
                if (obs.collected) return;

                ctx.save();
                ctx.translate(obs.x, obs.y);

                if (obs.type === 'star') {
                    ctx.rotate(obs.angle);
                    ctx.fillStyle = '#fbbf24';
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 10;
                    // Draw Star Shape
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 15, -Math.sin((18 + i * 72) * Math.PI / 180) * 15);
                        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 6, -Math.sin((54 + i * 72) * Math.PI / 180) * 6);
                    }
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Rock
                    ctx.fillStyle = '#64748b';
                    ctx.shadowColor = 'black';
                    ctx.shadowBlur = 5;
                    ctx.beginPath();
                    ctx.arc(0, 0, 15, 0, Math.PI * 2);
                    ctx.fill();
                    // Detail
                    ctx.fillStyle = '#475569';
                    ctx.beginPath();
                    ctx.arc(-5, -5, 5, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            // Particles
            state.particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            // Player Boat
            const px = state.playerX;
            const py = height - 60;

            ctx.save();
            ctx.translate(px, py);
            // Boat Body
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.quadraticCurveTo(15, 0, 10, 20);
            ctx.quadraticCurveTo(0, 25, -10, 20);
            ctx.quadraticCurveTo(-15, 0, 0, -20);
            ctx.fill();
            // Detail
            ctx.fillStyle = '#ef4444'; // Red stripe
            ctx.fillRect(-8, 0, 16, 5);
            ctx.restore();

            // Labels
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('DARK', laneWidth / 2, height - 20);
            ctx.fillText('NEUTRAL', width / 2, height - 20);
            ctx.fillText('BRIGHT', width - laneWidth / 2, height - 20);

            // Score
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(state.score, width - 20, 40);

            if (state.gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 30px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('Crash!', width / 2, height / 2);
                ctx.font = '16px Inter';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText('Tap to restart', width / 2, height / 2 + 30);
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        const handleTap = () => {
            if (gameState.current.gameOver) {
                gameState.current.gameOver = false;
                gameState.current.obstacles = [];
                gameState.current.score = 0;
                gameState.current.speed = 2.5;
                gameState.current.playerLane = 1;
            }
        };

        canvas.addEventListener('mousedown', handleTap);
        canvas.addEventListener('touchstart', handleTap);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current);
            canvas.removeEventListener('mousedown', handleTap);
            canvas.removeEventListener('touchstart', handleTap);
        };
    }, [calibration, onScore]);

    return (
        <div className="relative w-full mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800">
            <canvas ref={canvasRef} className="w-full h-80 block cursor-pointer"></canvas>
            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                🚣 Use RESONANCE to steer
            </div>
            <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors z-10">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ResonanceRiverGame;

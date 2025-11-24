import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const FlappyVoiceGame = ({ dataRef, targetRange, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    // Game State in Ref to avoid re-renders
    const gameState = useRef({
        status: 'ready', // ready, playing, gameover
        score: 0,
        bestScore: 0,
        birdY: 200,
        pipes: [],
        frame: 0,
        width: 300,
        height: 400,
        clouds: [],
        flash: 0, // Flash intensity for scoring
        particles: [], // For collisions/score
        smoothedPitch: 0,
        silenceTimer: 0,
        lastValidPitch: 0
    });

    // Constants
    const GAP = 180;
    const SPEED = 3; // Slightly faster for better feel

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Initialize clouds
        for (let i = 0; i < 5; i++) {
            gameState.current.clouds.push({
                x: Math.random() * 400,
                y: Math.random() * 200,
                size: 20 + Math.random() * 20,
                speed: 0.2 + Math.random() * 0.3
            });
        }

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

            // --- UPDATE ---
            if (state.status === 'playing') {
                const { pitch } = dataRef.current;

                // Pitch Control with Smoothing & Silence Bridging
                if (pitch > 50) {
                    state.silenceTimer = 0;
                    // Smooth the input pitch (EMA) - Reduced from 0.15 to 0.08 for less jitter
                    state.smoothedPitch += (pitch - state.smoothedPitch) * 0.08;
                    state.lastValidPitch = state.smoothedPitch;
                } else {
                    state.silenceTimer++;
                    // Bridge short gaps in voicing (up to 15 frames / ~250ms)
                    if (state.silenceTimer < 15) {
                        state.smoothedPitch = state.lastValidPitch;
                    } else {
                        // Slowly decay pitch to 0 instead of hard drop
                        state.smoothedPitch *= 0.9;
                    }
                }

                if (state.smoothedPitch > 50) {
                    // Map pitch to screen height (inverted: high pitch = top/0, low pitch = bottom/height)
                    // Range: targetRange.min to targetRange.max
                    // Add 10Hz buffer on each side so it's easier to reach edges
                    const minP = (targetRange.min || 150) - 10;
                    const maxP = (targetRange.max || 300) + 10;
                    const normalized = Math.max(0, Math.min(1, (state.smoothedPitch - minP) / (maxP - minP)));

                    // Target Y (padding of 50px top/bottom)
                    const targetY = (height - 50) - (normalized * (height - 100));

                    // Smooth movement - tuned for responsiveness
                    // Reduced from 0.08 to 0.05 for "heavier" feel
                    state.birdY += (targetY - state.birdY) * 0.05;
                } else {
                    // Gravity (fall down if no sound)
                    state.birdY += 4;
                }

                // Bounds
                if (state.birdY > height - 20) state.birdY = height - 20;
                if (state.birdY < 20) state.birdY = 20;

                // Spawn Pipes
                if (state.frame % 150 === 0) { // More frequent pipes
                    const pipeHeight = Math.random() * (height - GAP - 100) + 50;
                    state.pipes.push({ x: width, topHeight: pipeHeight, passed: false });
                }

                // Move Pipes & Clouds
                state.pipes.forEach(p => p.x -= SPEED);
                state.clouds.forEach(c => {
                    c.x -= c.speed;
                    if (c.x < -50) c.x = width + 50;
                });

                // Remove off-screen pipes
                if (state.pipes.length > 0 && state.pipes[0].x < -60) {
                    state.pipes.shift();
                }

                // Collision Detection
                const birdX = 60;
                const birdRadius = 18;

                state.pipes.forEach(pipe => {
                    // Pipe Box
                    const pipeLeft = pipe.x;
                    const pipeRight = pipe.x + 50;

                    // Check X overlap
                    if (birdX + birdRadius > pipeLeft && birdX - birdRadius < pipeRight) {
                        // Check Y overlap (Hit top or bottom pipe)
                        if (state.birdY - birdRadius < pipe.topHeight || state.birdY + birdRadius > pipe.topHeight + GAP) {
                            state.status = 'gameover';
                            if (state.score > state.bestScore) state.bestScore = state.score;
                        }
                    }

                    // Score
                    if (!pipe.passed && birdX > pipeRight) {
                        pipe.passed = true;
                        state.score += 1;
                        state.flash = 15; // Trigger flash
                        onScore(state.score);

                        // Add particles
                        for (let i = 0; i < 5; i++) {
                            state.particles.push({
                                x: birdX,
                                y: state.birdY,
                                vx: (Math.random() - 0.5) * 5,
                                vy: (Math.random() - 0.5) * 5,
                                life: 30,
                                color: '#fbbf24'
                            });
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

                if (state.flash > 0) state.flash--;

                state.frame++;
            }

            // --- RENDER ---
            ctx.clearRect(0, 0, width, height);

            // Sky
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#38bdf8'); // Sky 400
            gradient.addColorStop(1, '#bae6fd'); // Sky 200
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            state.clouds.forEach(c => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
                ctx.arc(c.x + c.size * 0.8, c.y - c.size * 0.2, c.size * 0.9, 0, Math.PI * 2);
                ctx.arc(c.x - c.size * 0.8, c.y + c.size * 0.1, c.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            });

            // Pipes
            state.pipes.forEach(pipe => {
                // Pipe Body
                const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + 50, 0);
                pipeGradient.addColorStop(0, '#475569');
                pipeGradient.addColorStop(0.5, '#64748b');
                pipeGradient.addColorStop(1, '#475569');
                ctx.fillStyle = pipeGradient;

                // Top
                ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
                // Bottom
                ctx.fillRect(pipe.x, pipe.topHeight + GAP, 50, height - (pipe.topHeight + GAP));

                // Pipe Caps
                ctx.fillStyle = '#334155';
                ctx.fillRect(pipe.x - 2, pipe.topHeight - 24, 54, 24); // Top Cap
                ctx.fillRect(pipe.x - 2, pipe.topHeight + GAP, 54, 24); // Bottom Cap

                // Highlights
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(pipe.x + 5, 0, 10, pipe.topHeight - 24);
                ctx.fillRect(pipe.x + 5, pipe.topHeight + GAP + 24, 10, height);
            });

            // Particles
            state.particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            // Balloon (Player)
            const bx = 60;
            const by = state.birdY;

            // String
            ctx.beginPath();
            ctx.moveTo(bx, by + 24);
            ctx.quadraticCurveTo(bx - 5 + Math.sin(state.frame * 0.2) * 5, by + 40, bx, by + 55);
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Balloon Body
            const balloonGrad = ctx.createRadialGradient(bx - 8, by - 8, 2, bx, by, 22);
            balloonGrad.addColorStop(0, '#f87171');
            balloonGrad.addColorStop(1, '#dc2626');
            ctx.fillStyle = balloonGrad;

            ctx.beginPath();
            ctx.ellipse(bx, by, 20, 24, 0, 0, Math.PI * 2);
            ctx.fill();

            // Knot
            ctx.beginPath();
            ctx.moveTo(bx, by + 23);
            ctx.lineTo(bx - 4, by + 28);
            ctx.lineTo(bx + 4, by + 28);
            ctx.fill();

            // Shine
            ctx.beginPath();
            ctx.ellipse(bx - 8, by - 8, 6, 10, -0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();

            // Flash Effect
            if (state.flash > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${state.flash / 20})`;
                ctx.fillRect(0, 0, width, height);
            }

            // UI Text
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 32px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(state.score, width - 20, 50);

            ctx.font = 'bold 14px Inter';
            ctx.fillStyle = '#475569';
            ctx.fillText(`BEST: ${state.bestScore}`, width - 20, 70);

            ctx.textAlign = 'center';
            if (state.status === 'ready') {
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 32px Inter';
                ctx.fillText("Tap to Start", width / 2, height / 2);
                ctx.font = '16px Inter';
                ctx.fillText("Control height with PITCH", width / 2, height / 2 + 30);
            } else if (state.status === 'gameover') {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 32px Inter';
                ctx.fillText("Game Over", width / 2, height / 2 - 20);
                ctx.font = '24px Inter';
                ctx.fillText(`Score: ${state.score}`, width / 2, height / 2 + 20);
                ctx.font = '14px Inter';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText("Tap to restart", width / 2, height / 2 + 60);
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        const handleTap = () => {
            if (gameState.current.status === 'ready') {
                gameState.current.status = 'playing';
            } else if (gameState.current.status === 'gameover') {
                gameState.current.status = 'ready';
                gameState.current.score = 0;
                gameState.current.birdY = gameState.current.height / 2;
                gameState.current.pipes = [];
                gameState.current.frame = 0;
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
    }, [targetRange, onScore]);

    return (
        <div className="relative w-full mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800">
            <canvas ref={canvasRef} className="w-full h-96 block cursor-pointer"></canvas>

            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                🎈 Pitch Control
            </div>

            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors z-10"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default FlappyVoiceGame;

import React, { useEffect, useRef } from 'react';

const FlappyVoiceGame = ({ dataRef, targetRange, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    // Game State in Ref to avoid re-renders
    const gameState = useRef({
        status: 'ready', // ready, playing, gameover
        score: 0,
        birdY: 200,
        pipes: [],
        frame: 0,
        width: 300,
        height: 400,
        clouds: []
    });

    // Constants
    const GAP = 180;
    const SPEED = 2.5;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Initialize clouds
        for (let i = 0; i < 5; i++) {
            gameState.current.clouds.push({
                x: Math.random() * 400,
                y: Math.random() * 200,
                size: 20 + Math.random() * 20
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

                // Pitch Control
                if (pitch > 50) {
                    // Map pitch to screen height (inverted: high pitch = top/0, low pitch = bottom/height)
                    // Range: targetRange.min to targetRange.max
                    const minP = targetRange.min || 150;
                    const maxP = targetRange.max || 300;
                    const normalized = Math.max(0, Math.min(1, (pitch - minP) / (maxP - minP)));

                    // Target Y (padding of 50px top/bottom)
                    const targetY = (height - 50) - (normalized * (height - 100));

                    // Smooth movement
                    state.birdY += (targetY - state.birdY) * 0.08;
                } else {
                    // Gravity (fall down if no sound)
                    state.birdY += 3;
                }

                // Bounds
                if (state.birdY > height - 20) state.birdY = height - 20;
                if (state.birdY < 20) state.birdY = 20;

                // Spawn Pipes
                if (state.frame % 180 === 0) {
                    const pipeHeight = Math.random() * (height - GAP - 100) + 50;
                    state.pipes.push({ x: width, topHeight: pipeHeight, passed: false });
                }

                // Move Pipes & Clouds
                state.pipes.forEach(p => p.x -= SPEED);
                state.clouds.forEach(c => {
                    c.x -= 0.5;
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
                        }
                    }

                    // Score
                    if (!pipe.passed && birdX > pipeRight) {
                        pipe.passed = true;
                        state.score += 1;
                        onScore(state.score);
                    }
                });

                state.frame++;
            }

            // --- RENDER ---
            ctx.clearRect(0, 0, width, height);

            // Sky
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#7dd3fc'); // Sky 300
            gradient.addColorStop(1, '#e0f2fe'); // Sky 100
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            state.clouds.forEach(c => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
                ctx.arc(c.x + c.size * 0.8, c.y - c.size * 0.2, c.size * 0.9, 0, Math.PI * 2);
                ctx.arc(c.x - c.size * 0.8, c.y + c.size * 0.1, c.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            });

            // Pipes
            state.pipes.forEach(pipe => {
                ctx.fillStyle = '#475569'; // Slate 600
                // Top
                ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
                // Bottom
                ctx.fillRect(pipe.x, pipe.topHeight + GAP, 50, height - (pipe.topHeight + GAP));

                // Borders
                ctx.fillStyle = '#334155'; // Slate 700
                ctx.fillRect(pipe.x, pipe.topHeight - 20, 50, 20);
                ctx.fillRect(pipe.x, pipe.topHeight + GAP, 50, 20);
            });

            // Balloon (Player)
            const bx = 60;
            const by = state.birdY;

            // String
            ctx.beginPath();
            ctx.moveTo(bx, by + 22);
            ctx.lineTo(bx, by + 50);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Balloon Body
            ctx.beginPath();
            ctx.ellipse(bx, by, 20, 24, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444'; // Red 500
            ctx.fill();

            // Shine
            ctx.beginPath();
            ctx.ellipse(bx - 8, by - 8, 6, 10, -0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();

            // UI Text
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(state.score, width - 20, 40);

            ctx.textAlign = 'center';
            if (state.status === 'ready') {
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 32px sans-serif';
                ctx.fillText("Tap to Start", width / 2, height / 2);
                ctx.font = '16px sans-serif';
                ctx.fillText("Control height with PITCH", width / 2, height / 2 + 30);
            } else if (state.status === 'gameover') {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 32px sans-serif';
                ctx.fillText("Game Over", width / 2, height / 2);
                ctx.font = '20px sans-serif';
                ctx.fillText(`Score: ${state.score}`, width / 2, height / 2 + 40);
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText("Tap to restart", width / 2, height / 2 + 70);
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
                <i data-lucide="x" className="w-4 h-4"></i>
            </button>
        </div>
    );
};

export default FlappyVoiceGame;

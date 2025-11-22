import React, { useEffect, useRef, useState } from 'react';

const FlappyVoiceGame = ({ dataRef, targetRange, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
    const [score, setScore] = useState(0);

    // Game constants
    const GRAVITY = 0.15; // Reduced gravity for balloon feel
    const JUMP = -4;
    const SPEED = 3;
    const GAP = 200;

    const gameRef = useRef({
        birdY: 300,
        velocity: 0,
        pipes: [],
        frame: 0
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const loop = () => {
            // 1. Update State
            if (gameState === 'playing') {
                const { pitch } = dataRef.current;

                // Pitch Control (Balloon floats up with higher pitch)
                if (pitch > 50) {
                    // Map pitch to target height (higher pitch = higher on screen/lower Y)
                    // Target range: min -> bottom (600), max -> top (0)
                    const normalized = Math.max(0, Math.min(1, (pitch - targetRange.min) / (targetRange.max - targetRange.min)));
                    const targetY = 600 - (normalized * 600);

                    // Smooth lerp to target
                    gameRef.current.birdY += (targetY - gameRef.current.birdY) * 0.05;
                } else {
                    // Gravity if no voice
                    gameRef.current.birdY += 2;
                }

                // Spawn Birds (Obstacles)
                if (gameRef.current.frame % 200 === 0) {
                    const height = Math.random() * (canvas.height - GAP - 100) + 50;
                    gameRef.current.pipes.push({ x: canvas.width, topHeight: height, passed: false });
                }

                // Move Birds
                gameRef.current.pipes.forEach(pipe => {
                    pipe.x -= SPEED;
                });

                // Remove off-screen
                if (gameRef.current.pipes.length > 0 && gameRef.current.pipes[0].x < -50) {
                    gameRef.current.pipes.shift();
                }

                // Collision
                gameRef.current.pipes.forEach(pipe => {
                    // Bird hitbox (Balloon is circle r=20)
                    const birdLeft = 50 - 15;
                    const birdRight = 50 + 15;
                    const birdTop = gameRef.current.birdY - 20;
                    const birdBottom = gameRef.current.birdY + 20;

                    // Pipe hitbox (Bird Flock)
                    const pipeLeft = pipe.x;
                    const pipeRight = pipe.x + 50;

                    // Check if inside gap (Safe zone)
                    // Top Pipe (Bird Flock 1)
                    if (birdRight > pipeLeft && birdLeft < pipeRight && birdTop < pipe.topHeight) {
                        setGameState('gameover');
                    }
                    // Bottom Pipe (Bird Flock 2)
                    if (birdRight > pipeLeft && birdLeft < pipeRight && birdBottom > pipe.topHeight + GAP) {
                        setGameState('gameover');
                    }

                    // Score
                    if (!pipe.passed && birdLeft > pipeRight) {
                        pipe.passed = true;
                        setScore(s => {
                            const newScore = s + 1;
                            onScore(newScore);
                            return newScore;
                        });
                    }
                });

                gameRef.current.frame++;
            }

            // 2. Render
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background (Sky)
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB'); // Sky Blue
            gradient.addColorStop(1, '#E0F7FA');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Clouds (Parallax)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(100 + (gameRef.current.frame * 0.5) % 400, 100, 30, 0, Math.PI * 2);
            ctx.arc(140 + (gameRef.current.frame * 0.5) % 400, 100, 40, 0, Math.PI * 2);
            ctx.fill();

            // Draw Birds (Obstacles)
            gameRef.current.pipes.forEach(pipe => {
                ctx.fillStyle = '#475569'; // Dark Slate (Bird color)

                // Top Flock
                ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
                // Bottom Flock
                ctx.fillRect(pipe.x, pipe.topHeight + GAP, 50, canvas.height - (pipe.topHeight + GAP));

                // Decorate as birds
                ctx.font = "20px Arial";
                ctx.fillText("🦅", pipe.x + 10, pipe.topHeight - 20);
                ctx.fillText("🦅", pipe.x + 10, pipe.topHeight + GAP + 40);
            });

            // Draw Balloon (Player)
            const y = gameRef.current.birdY;

            // String
            ctx.beginPath();
            ctx.moveTo(50, y + 25);
            ctx.lineTo(50, y + 50);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Balloon Body
            ctx.beginPath();
            ctx.ellipse(50, y, 20, 25, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#FF5252'; // Red Balloon
            ctx.fill();

            // Shine
            ctx.beginPath();
            ctx.ellipse(45, y - 10, 5, 8, -0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();

            // UI
            ctx.fillStyle = 'black';
            ctx.font = 'bold 24px Inter';
            ctx.fillText(`Score: ${score}`, 20, 40);

            if (gameState === 'ready') {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 30px Inter';
                ctx.textAlign = 'center';
                ctx.fillText("Tap to Start", canvas.width / 2, canvas.height / 2);
                ctx.font = '16px Inter';
                ctx.fillText("Hum high to go up, low to go down", canvas.width / 2, canvas.height / 2 + 40);
            }

            if (gameState === 'gameover') {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 40px Inter';
                ctx.textAlign = 'center';
                ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
                ctx.font = '20px Inter';
                ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
                ctx.fillText("Tap to Restart", canvas.width / 2, canvas.height / 2 + 80);
            }

            animationId = requestAnimationFrame(loop);
        };
        loop();

        return () => cancelAnimationFrame(animationId);
    }, [gameState, score]);

    const handleTap = () => {
        if (gameState === 'ready') setGameState('playing');
        if (gameState === 'gameover') {
            setGameState('ready');
            setScore(0);
            gameRef.current = { birdY: 300, velocity: 0, pipes: [], frame: 0 };
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="p-4 flex justify-between items-center bg-slate-900">
                <h3 className="font-bold text-white">Balloon Adventure</h3>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full"><i data-lucide="x" className="w-5 h-5 text-white"></i></button>
            </div>
            <canvas
                ref={canvasRef}
                width={window.innerWidth > 400 ? 400 : window.innerWidth}
                height={600}
                className="block mx-auto bg-slate-800 cursor-pointer"
                onClick={handleTap}
            />
        </div>
    );
};

export default FlappyVoiceGame;

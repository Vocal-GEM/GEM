import React, { useEffect, useRef } from 'react';

const PitchVisualizer = ({ dataRef, targetRange, userMode, exercise, onScore, settings = {} }) => {
    const canvasRef = useRef(null);
    const gameRef = useRef({ score: 0, lastUpdate: Date.now(), lastPitch: 0 });
    const balloonRef = useRef(new Image());
    const birdRef = useRef(new Image());

    useEffect(() => {
        balloonRef.current.src = '/assets/balloon.png';
        birdRef.current.src = '/assets/bird.png';
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1;
        if (exercise) gameRef.current = { score: 0, lastUpdate: Date.now(), lastPitch: 0 };

        const loop = () => {
            const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr);
            const width = rect.width; const height = rect.height; ctx.clearRect(0, 0, width, height);
            const yMin = 50; const yMax = 350; const mapY = (freq) => height - ((freq - yMin) / (yMax - yMin)) * height;

            if (targetRange && !exercise) {
                const topY = mapY(targetRange.max); const botY = mapY(targetRange.min); const h = Math.abs(botY - topY);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'; ctx.fillRect(0, topY, width, h);
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, topY); ctx.lineTo(width, topY); ctx.moveTo(0, botY); ctx.lineTo(width, botY); ctx.stroke(); ctx.setLineDash([]);

                // Draw Home Note Anchor
                if (settings.homeNote && settings.homeNote > yMin && settings.homeNote < yMax) {
                    const homeY = mapY(settings.homeNote);
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([10, 5]);
                    ctx.beginPath();
                    ctx.moveTo(0, homeY);
                    ctx.lineTo(width, homeY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText(`Home: ${Math.round(settings.homeNote)} Hz`, 10, homeY - 5);
                }
            }

            if (exercise) {
                const now = Date.now();
                // Draw Game Path
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([10, 15]); ctx.beginPath();
                let targetFreqAtCurrent = 0;

                // Draw Birds/Obstacles based on path
                for (let i = 0; i < width; i += 5) {
                    const t = i / width; let freq = 0;
                    if (exercise.gameId === 'glide') { const freqRange = exercise.range; const center = (targetRange.min + targetRange.max) / 2; const phase = (Date.now() / 2000) * Math.PI * 2; freq = center + (freqRange / 2) * Math.sin((t * Math.PI * 4) + phase); }
                    else if (exercise.gameId === 'step') { const steps = 4; const stepHeight = exercise.range / steps; const phase = (Date.now() / 4000) % 1; const adjustedT = (t + phase) % 1; const currentStep = Math.floor(adjustedT * steps); freq = targetRange.min + (currentStep * stepHeight); }

                    const y = mapY(freq);
                    if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
                    if (i >= width - 50 && i < width - 40) targetFreqAtCurrent = freq; // Check slightly ahead

                    // Draw birds occasionally
                    if (i % 150 === 0) {
                        const birdY = y + (Math.sin(i + now / 100) * 20); // Bobbing bird
                        if (birdRef.current.complete) ctx.drawImage(birdRef.current, i, birdY - 15, 30, 30);
                    }
                }
                ctx.stroke(); ctx.setLineDash([]);

                const currentPitch = dataRef.current.history[dataRef.current.history.length - 1];
                if (currentPitch > 0) {
                    const playerY = mapY(currentPitch);
                    // Draw Balloon
                    if (balloonRef.current.complete) {
                        ctx.drawImage(balloonRef.current, width - 60, playerY - 25, 50, 50);
                    } else {
                        // Fallback circle
                        ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(width - 40, playerY, 15, 0, Math.PI * 2); ctx.fill();
                    }

                    const diff = Math.abs(currentPitch - targetFreqAtCurrent);
                    if (diff < 20) {
                        gameRef.current.score += 1;
                        ctx.shadowBlur = 20; ctx.shadowColor = "#4ade80";
                        if (gameRef.current.score % 50 === 0) onScore(gameRef.current.score);
                    } else {
                        ctx.shadowBlur = 0;
                    }
                }

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(exercise.name.toUpperCase(), 10, 25);
                ctx.fillStyle = '#4ade80'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(`SCORE: ${gameRef.current.score}`, 10, 55);
            }

            const history = dataRef.current.history;

            // 1. Draw the Line (Green) with Gap Bridging
            ctx.strokeStyle = '#22c55e'; // Bright Green (Tailwind green-500)
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            let hasStarted = false;
            let lastValidIndex = -1;
            const maxGap = 20; // Bridge gaps up to 20 frames (~300ms at 60fps)

            history.forEach((p, i) => {
                const x = (i / (history.length - 1)) * width;
                if (p > 0) {
                    const y = mapY(p);
                    if (!hasStarted) {
                        ctx.moveTo(x, y);
                        hasStarted = true;
                        lastValidIndex = i;
                    } else {
                        const gap = i - lastValidIndex;
                        const lastValidP = history[lastValidIndex];

                        // Connect if: gap is small OR pitch change is reasonable
                        if (gap <= maxGap && Math.abs(p - lastValidP) < 400) {
                            ctx.lineTo(x, y);
                        } else {
                            // Gap too large or pitch jump too big - start new segment
                            ctx.moveTo(x, y);
                        }
                        lastValidIndex = i;
                    }
                }
            });
            ctx.stroke();

            // 2. Draw the Dots (Voice Tools Style)
            ctx.fillStyle = '#22c55e'; // Same Green
            history.forEach((p, i) => {
                if (p > 0) {
                    const x = (i / (history.length - 1)) * width;
                    const y = mapY(p);
                    // Only draw dots if connected to neighbors (to avoid noise dots)
                    // or just draw all valid points
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2); // Small 3px radius dot
                    ctx.fill();
                }
            });

            ctx.shadowBlur = 0;
            const currentP = history[history.length - 1];
            if (currentP > 0) { ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'right'; ctx.fillText(Math.round(currentP) + " Hz", width - 10, 30); }
            requestAnimationFrame(loop);
        };
        const animId = requestAnimationFrame(loop); return () => cancelAnimationFrame(animId);
    }, [targetRange, exercise]);
    const label = userMode === 'slp' ? 'Fundamental Frequency (F0)' : 'Pitch';
    return (<div className="glass-panel-dark rounded-2xl h-48 w-full mb-4 relative overflow-hidden shadow-lg"> <div className="absolute top-3 left-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div> <canvas ref={canvasRef} className="w-full h-full"></canvas> </div>);
};

export default PitchVisualizer;

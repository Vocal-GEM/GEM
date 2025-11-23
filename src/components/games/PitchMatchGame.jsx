import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';

const PitchMatchGame = ({ dataRef, targetRange, onScore, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const gameState = useRef({
        notes: [], // { y, width, hit }
        score: 0,
        speed: 2,
        spawnTimer: 0,
        isPlaying: true,
        combo: 0,
        floatingTexts: [] // { x, y, text, life, color }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Resize handler
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight || 400;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        const spawnNote = () => {
            const minPitch = targetRange.min - 20;
            const maxPitch = targetRange.max + 20;
            const pitch = Math.random() * (maxPitch - minPitch) + minPitch;

            // Map pitch to Y
            // High pitch = Top (0), Low pitch = Bottom (height)
            const y = canvas.height - ((pitch - (minPitch - 20)) / (maxPitch - minPitch + 40)) * canvas.height;

            gameState.current.notes.push({
                x: canvas.width,
                y: y,
                pitch: pitch,
                width: 80, // Slightly longer notes
                hit: false,
                missed: false
            });
        };

        const loop = () => {
            if (!gameState.current.isPlaying) return;

            const { pitch } = dataRef.current;
            const state = gameState.current;

            // Spawn
            state.spawnTimer++;
            if (state.spawnTimer > 100) { // Slightly faster spawn
                spawnNote();
                state.spawnTimer = 0;
            }

            // Update Notes
            state.notes.forEach(note => {
                note.x -= state.speed;
            });

            // Remove off-screen
            state.notes = state.notes.filter(n => n.x + n.width > -50);

            // Check Hits
            // Playhead is at x = 50
            const playheadX = 50;
            const hitZone = 30; // +/- 30px

            // User Cursor Y
            let cursorY = -100;
            if (pitch > 0) {
                const minPitch = targetRange.min - 20;
                const maxPitch = targetRange.max + 20;
                cursorY = canvas.height - ((pitch - (minPitch - 20)) / (maxPitch - minPitch + 40)) * canvas.height;
            }

            state.notes.forEach(note => {
                if (!note.hit && !note.missed) {
                    // Check X overlap
                    if (note.x < playheadX + hitZone && note.x + note.width > playheadX - hitZone) {
                        // Check Y overlap (Pitch match)
                        if (Math.abs(cursorY - note.y) < 30) { // Tighter tolerance
                            note.hit = true;
                            const points = 10 + state.combo;
                            state.score += points;
                            state.combo++;
                            onScore(10);

                            // Floating Text
                            state.floatingTexts.push({
                                x: playheadX,
                                y: note.y,
                                text: `+${points}`,
                                life: 40,
                                color: '#4ade80'
                            });

                            if (state.combo > 5) {
                                state.floatingTexts.push({
                                    x: playheadX + 20,
                                    y: note.y - 20,
                                    text: 'Perfect!',
                                    life: 50,
                                    color: '#fbbf24'
                                });
                            }
                        }
                    } else if (note.x + note.width < playheadX - hitZone) {
                        note.missed = true;
                        state.combo = 0;
                        state.floatingTexts.push({
                            x: playheadX,
                            y: note.y,
                            text: 'Miss',
                            life: 30,
                            color: '#ef4444'
                        });
                    }
                }
            });

            // Update Floating Texts
            state.floatingTexts.forEach(t => {
                t.y -= 1;
                t.life--;
            });
            state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);

            // Render
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Target Range Background
            const minP = targetRange.min;
            const maxP = targetRange.max;
            // Visual guide for target range
            const rangeBottom = canvas.height - ((minP - (targetRange.min - 40)) / (targetRange.max - targetRange.min + 80)) * canvas.height;
            const rangeTop = canvas.height - ((maxP - (targetRange.min - 40)) / (targetRange.max - targetRange.min + 80)) * canvas.height;

            // Background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#0f172a');
            bgGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.height; i += 50) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }

            // Draw Playhead Line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(playheadX, 0);
            ctx.lineTo(playheadX, canvas.height);
            ctx.stroke();

            // Playhead Glow
            if (pitch > 0) {
                const glowGrad = ctx.createRadialGradient(playheadX, cursorY, 5, playheadX, cursorY, 100);
                glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
                glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
                ctx.fillStyle = glowGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw Notes
            state.notes.forEach(note => {
                if (note.hit) {
                    ctx.fillStyle = '#4ade80'; // Green
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 15;
                    ctx.globalAlpha = 1 - (playheadX - note.x) / 100; // Fade out
                } else if (note.missed) {
                    ctx.fillStyle = '#ef4444'; // Red
                    ctx.globalAlpha = 0.3;
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = '#60a5fa'; // Blue
                    ctx.shadowColor = '#60a5fa';
                    ctx.shadowBlur = 10;
                    ctx.globalAlpha = 1;
                }

                if (ctx.globalAlpha > 0) {
                    ctx.beginPath();
                    ctx.roundRect(note.x, note.y - 10, note.width, 20, 10);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            });

            // Draw User Cursor
            if (pitch > 0) {
                ctx.fillStyle = '#fbbf24'; // Amber
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(playheadX, cursorY, 8, 0, Math.PI * 2);
                ctx.fill();

                // Ring
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(playheadX, cursorY, 12, 0, Math.PI * 2);
                ctx.stroke();

                ctx.shadowBlur = 0;
            }

            // Floating Texts
            state.floatingTexts.forEach(t => {
                ctx.fillStyle = t.color;
                ctx.font = 'bold 16px Inter';
                ctx.globalAlpha = t.life / 40;
                ctx.fillText(t.text, t.x, t.y);
                ctx.globalAlpha = 1;
            });

            // Draw Score & Combo
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Inter';
            ctx.fillText(`Score: ${state.score}`, 20, 30);
            if (state.combo > 1) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 16px Inter';
                ctx.fillText(`${state.combo}x Combo!`, 20, 55);
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [targetRange]);

    return (
        <div className="relative w-full mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900">
            <canvas ref={canvasRef} className="w-full h-80 block cursor-pointer"></canvas>

            <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={onClose} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors z-10">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                <div className="inline-block bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white border border-white/10">
                    🎸 Match the pitch as notes hit the line!
                </div>
            </div>
        </div>
    );
};

export default PitchMatchGame;

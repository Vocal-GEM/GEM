import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, RotateCcw, Save } from 'lucide-react';

const VoiceRangeProfile = ({ dataRef, isActive, staticData }) => {
    const canvasRef = useRef(null);
    const [stats, setStats] = useState({
        minPitch: Infinity,
        maxPitch: -Infinity,
        minDb: Infinity,
        maxDb: -Infinity,
        area: 0
    });

    // Grid state: 128 notes x 120 dB
    // We'll use a Map to store visited points for sparse storage
    // Key: "note_db", Value: count
    const gridRef = useRef(new Map());

    // Range configuration
    const minNote = 36; // C2
    const maxNote = 84; // C6
    const minDb = 40;
    const maxDb = 110;

    // Helper to process a single data point
    const processPoint = (pitch, db) => {
        if (pitch > 50 && db > minDb) {
            const note = 12 * Math.log2(pitch / 440) + 69;

            if (note >= minNote && note <= maxNote && db <= maxDb) {
                const noteIdx = Math.floor(note);
                const dbIdx = Math.floor(db);
                const key = `${noteIdx}_${dbIdx}`;

                const count = gridRef.current.get(key) || 0;
                gridRef.current.set(key, count + 1);

                return { pitch, db };
            }
        }
        return null;
    };

    // Effect to handle static data loading
    useEffect(() => {
        if (staticData && staticData.length > 0) {
            gridRef.current.clear();
            let minP = Infinity, maxP = -Infinity, minD = Infinity, maxD = -Infinity;

            staticData.forEach(point => {
                // Ensure point has frequency and volume
                if (point.frequency && point.volume) {
                    const result = processPoint(point.frequency, point.volume);
                    if (result) {
                        minP = Math.min(minP, result.pitch);
                        maxP = Math.max(maxP, result.pitch);
                        minD = Math.min(minD, result.db);
                        maxD = Math.max(maxD, result.db);
                    }
                }
            });

            if (minP !== Infinity) {
                setStats({
                    minPitch: minP,
                    maxPitch: maxP,
                    minDb: minD,
                    maxDb: maxD,
                    area: gridRef.current.size
                });
            }
        }
    }, [staticData]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationId;

        const draw = () => {
            // If we have static data, we don't need to loop for updates unless we want to support mixing both?
            // For now, let's assume if isActive is true, we are in live mode.

            if (isActive && dataRef?.current) {
                const { pitch, volume } = dataRef.current;

                let db = -100;
                if (volume > 0.001) {
                    db = 20 * Math.log10(volume) + 100; // Normalize: 0.001 -> 40dB, 1.0 -> 100dB approx
                }

                const result = processPoint(pitch, db);
                if (result) {
                    setStats(prev => ({
                        minPitch: Math.min(prev.minPitch, result.pitch),
                        maxPitch: Math.max(prev.maxPitch, result.pitch),
                        minDb: Math.min(prev.minDb, result.db),
                        maxDb: Math.max(prev.maxDb, result.db),
                        area: gridRef.current.size
                    }));
                }
            }

            // Render
            ctx.fillStyle = '#0f172a'; // slate-900
            ctx.fillRect(0, 0, width, height);

            // Draw Grid Lines
            ctx.strokeStyle = '#1e293b'; // slate-800
            ctx.lineWidth = 1;

            // Vertical lines (Octaves)
            for (let n = minNote; n <= maxNote; n++) {
                if (n % 12 === 0) { // C notes
                    const x = ((n - minNote) / (maxNote - minNote)) * width;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();

                    ctx.fillStyle = '#64748b';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`C${n / 12 - 1}`, x + 2, height - 5);
                }
            }

            // Horizontal lines (dB)
            for (let d = minDb; d <= maxDb; d += 10) {
                const y = height - ((d - minDb) / (maxDb - minDb)) * height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();

                ctx.fillStyle = '#64748b';
                ctx.fillText(`${d}dB`, 2, y - 2);
            }

            // Draw Points
            gridRef.current.forEach((count, key) => {
                const [n, d] = key.split('_').map(Number);

                const x = ((n - minNote) / (maxNote - minNote)) * width;
                const y = height - ((d - minDb) / (maxDb - minDb)) * height;

                // Color based on density/count
                const intensity = Math.min(1, count / (staticData ? 5 : 50)); // Lower threshold for static data visibility
                ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`; // blue-500

                // Draw cell (approx size)
                const cellW = width / (maxNote - minNote);
                const cellH = height / (maxDb - minDb);
                ctx.fillRect(x, y - cellH, cellW, cellH);
            });

            // Draw Live Cursor
            if (isActive && dataRef?.current) {
                const { pitch, volume } = dataRef.current;
                let db = -100;
                if (volume > 0.001) {
                    db = 20 * Math.log10(volume) + 100;
                }

                if (pitch > 50 && db > minDb) {
                    const note = 12 * Math.log2(pitch / 440) + 69;
                    const x = ((note - minNote) / (maxNote - minNote)) * width;
                    const y = height - ((db - minDb) / (maxDb - minDb)) * height;

                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#ef4444'; // red-500
                    ctx.fill();
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'voice-range-profile',
                draw,
                renderCoordinator.PRIORITY.LOW
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef, isActive, staticData]);

    const handleReset = () => {
        gridRef.current.clear();
        setStats({
            minPitch: Infinity,
            maxPitch: -Infinity,
            minDb: Infinity,
            maxDb: -Infinity,
            area: 0
        });
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <Maximize2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Voice Range Profile</div>
                        <div className="text-[10px] text-slate-400">Phonetogram</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Reset"
                    >
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Save"
                    >
                        <Save className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="relative h-48 w-full bg-black rounded-lg overflow-hidden mb-3">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full h-full"
                />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Range</div>
                    <div className="text-xs font-mono text-white">
                        {stats.minPitch === Infinity ? '-' : Math.round(stats.minPitch)} - {stats.maxPitch === -Infinity ? '-' : Math.round(stats.maxPitch)} Hz
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Dynamics</div>
                    <div className="text-xs font-mono text-white">
                        {stats.minDb === Infinity ? '-' : Math.round(stats.minDb)} - {stats.maxDb === -Infinity ? '-' : Math.round(stats.maxDb)} dB
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Area</div>
                    <div className="text-xs font-mono text-white">
                        {stats.area} pts
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceRangeProfile;

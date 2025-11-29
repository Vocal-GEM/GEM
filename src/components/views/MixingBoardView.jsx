import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic, Gauge, Sliders } from 'lucide-react';

const MixingBoardView = ({ dataRef, audioEngine, calibration, compact = false }) => {
    const [toneMode, setToneMode] = useState(false);
    const [viewMode, setViewMode] = useState('sliders'); // 'sliders' or 'gauges'
    const [sliderValues, setSliderValues] = useState({
        pitch: 200,
        resonance: 0.5, // Now a score 0-1
        weight: 50,
        contour: 0.5,
        volume: 50
    });

    // Refs for DOM elements to update directly
    const fillRefs = useRef({});
    const knobRefs = useRef({});
    const valueRefs = useRef({});
    const gaugeRefs = useRef({}); // For gauge needles

    // Ref for smooth visual interpolation of numbers
    const displayedValues = useRef({
        pitch: 200, resonance: 0.5, weight: 50, contour: 0.5, volume: 0
    });

    // Audio Context Refs
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);
    const audioContextRef = useRef(null);

    // Helper: Linear Interpolation
    const lerp = (start, end, factor) => start + (end - start) * factor;

    // Start/Stop Tone Mode
    useEffect(() => {
        if (toneMode && audioEngine?.audioContext) {
            const ctx = audioEngine.audioContext;
            audioContextRef.current = ctx;

            // Create oscillator and gain node
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(sliderValues.pitch, ctx.currentTime);
            gain.gain.setValueAtTime(sliderValues.volume / 100 * 0.3, ctx.currentTime);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();

            oscillatorRef.current = osc;
            gainNodeRef.current = gain;
        } else {
            // Stop tone
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current = null;
                gainNodeRef.current = null;
            }
        }

        return () => {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
            }
        };
    }, [toneMode, audioEngine]);

    // Update tone in real-time when sliders change (Tone Mode)
    useEffect(() => {
        if (toneMode && oscillatorRef.current && gainNodeRef.current && audioContextRef.current) {
            const ctx = audioContextRef.current;
            oscillatorRef.current.frequency.setValueAtTime(sliderValues.pitch, ctx.currentTime);
            gainNodeRef.current.gain.setValueAtTime(sliderValues.volume / 100 * 0.3, ctx.currentTime);
        }
    }, [sliderValues, toneMode]);

    // Animation Loop for Voice Mode
    useEffect(() => {
        if (toneMode) return;

        const loop = () => {
            if (!dataRef.current) return;

            const data = dataRef.current;

            // Calculate Resonance Score locally if missing
            let resScore = data.resonanceScore;
            if (resScore === undefined && calibration && data.resonance > 0) {
                const range = calibration.bright - calibration.dark;
                if (range !== 0) {
                    resScore = (data.resonance - calibration.dark) / range;
                    resScore = Math.max(0, Math.min(1, resScore));
                } else {
                    resScore = 0.5;
                }
            } else if (resScore === undefined) {
                resScore = 0.5;
            }

            // Map data to slider percentages
            const targets = {
                pitch: { val: data.pitch, min: 50, max: 350 },
                resonance: { val: resScore, min: 0, max: 1 },
                weight: { val: data.weight, min: 0, max: 100 },
                contour: { val: data.prosody?.contour || 0, min: 0, max: 1 },
                volume: { val: (data.volume || 0) * 100, min: 0, max: 100 }
            };

            Object.keys(targets).forEach(key => {
                const target = targets[key];

                // Smooth the display value
                if (target.val !== undefined && (key === 'resonance' || target.val > 0)) {
                    displayedValues.current[key] = lerp(displayedValues.current[key], target.val, 0.1);
                }

                const val = displayedValues.current[key];
                const { min, max } = target;

                let percentage = ((val - min) / (max - min)) * 100;
                percentage = Math.max(0, Math.min(100, percentage));

                // Update Sliders
                if (viewMode === 'sliders') {
                    if (fillRefs.current[key]) {
                        fillRefs.current[key].style.height = `${percentage}%`;
                    }
                    if (knobRefs.current[key]) {
                        knobRefs.current[key].style.bottom = `calc(${percentage}% - 12px)`;
                    }
                }

                // Update Gauges
                if (viewMode === 'gauges') {
                    if (gaugeRefs.current[key]) {
                        // Map 0-100% to -90deg to 90deg
                        const deg = (percentage / 100) * 180 - 90;
                        gaugeRefs.current[key].style.transform = `rotate(${deg}deg)`;
                    }
                }

                // Update Text Values
                if (valueRefs.current[key]) {
                    if (key === 'resonance') {
                        valueRefs.current[key].innerText = val > 0.65 ? 'Bright' : (val < 0.35 ? 'Dark' : 'Balanced');
                    } else if (key === 'weight') {
                        valueRefs.current[key].innerText = val > 60 ? 'Pressed' : (val < 40 ? 'Airy' : 'Balanced');
                    } else {
                        valueRefs.current[key].innerText = (data.pitch > 0 || key === 'volume') ? (Math.round(val * 10) / 10) : '---';
                    }
                }
            });

            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [toneMode, dataRef, calibration, viewMode]);

    const handleSliderChange = (param, value) => {
        if (toneMode) {
            setSliderValues(prev => ({ ...prev, [param]: parseFloat(value) }));
            // Also update DOM for immediate feedback in tone mode
            const slider = sliders.find(s => s.id === param);
            if (slider) {
                const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
                if (fillRefs.current[param]) fillRefs.current[param].style.height = `${percentage}%`;
                if (knobRefs.current[param]) knobRefs.current[param].style.bottom = `calc(${percentage}% - 12px)`;
                if (valueRefs.current[param]) valueRefs.current[param].innerText = Math.round(value * 10) / 10;
            }
        }
    };

    // Custom Drag Handler for Vertical Sliders
    const handleDragStart = (e, param, min, max) => {
        if (!toneMode) return;

        const track = e.currentTarget.getBoundingClientRect();

        const updateValue = (clientY) => {
            const relativeY = clientY - track.top;
            const height = track.height;
            // Inverted Y (bottom is 0%)
            let percentage = 1 - (relativeY / height);
            percentage = Math.max(0, Math.min(1, percentage));

            const value = min + percentage * (max - min);
            handleSliderChange(param, value);
        };

        updateValue(e.clientY || e.touches[0].clientY);

        const handleMove = (moveEvent) => {
            updateValue(moveEvent.clientY || moveEvent.touches[0].clientY);
        };

        const handleEnd = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
    };

    const sliders = [
        { id: 'pitch', label: 'Pitch', min: 50, max: 350, top: 'HIGH', bottom: 'LOW', unit: 'Hz' },
        { id: 'resonance', label: 'Resonance', min: 0, max: 1, top: 'BRIGHT', bottom: 'DARK', unit: '' },
        { id: 'weight', label: 'Weight', min: 0, max: 100, top: 'PRESSED', bottom: 'AIRY', unit: '' },
        { id: 'contour', label: 'Contour', min: 0, max: 1, top: 'WIDE', bottom: 'FLAT', unit: '' },
        { id: 'volume', label: 'Volume', min: 0, max: 100, top: 'LOUD', bottom: 'QUIET', unit: '' }
    ];

    return (
        <div className={`flex flex-col h-full ${compact ? '' : 'space-y-6 pb-20'}`}>
            {/* Header */}
            {!compact ? (
                <div className="glass-panel-dark p-6 rounded-2xl flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Mixing Board</h2>
                            <p className="text-slate-400 text-sm">
                                {toneMode
                                    ? 'Interactive Mode - Drag sliders to generate tone'
                                    : 'Voice Mode - Visualizes your voice in real-time'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'sliders' ? 'gauges' : 'sliders')}
                                className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                                title="Toggle View"
                            >
                                {viewMode === 'sliders' ? <Gauge size={20} /> : <Sliders size={20} />}
                            </button>
                            <button
                                onClick={() => setToneMode(!toneMode)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${toneMode
                                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                    : 'glass-panel hover:bg-white/10 text-white'
                                    }`}
                            >
                                {toneMode ? <Volume2 size={20} /> : <Mic size={20} />}
                                {toneMode ? 'Tone Mode' : 'Voice Mode'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between mb-4 flex-shrink-0 px-2 pt-2">
                    <h3 className="font-bold text-slate-300">Mixing Board</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'sliders' ? 'gauges' : 'sliders')}
                            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            {viewMode === 'sliders' ? <Gauge size={16} /> : <Sliders size={16} />}
                        </button>
                        <button
                            onClick={() => setToneMode(!toneMode)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${toneMode
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-300'
                                }`}
                        >
                            {toneMode ? <Volume2 size={14} /> : <Mic size={14} />}
                            {toneMode ? 'Tone' : 'Voice'}
                        </button>
                    </div>
                </div>
            )}

            {/* Visualization Area */}
            <div className={`${compact ? 'flex-1 min-h-0' : 'glass-panel-dark p-8 rounded-2xl'}`}>
                {viewMode === 'sliders' ? (
                    <div className={`flex justify-around items-end gap-2 ${compact ? 'h-full' : 'h-[600px]'}`}>
                        {sliders.map(slider => {
                            const val = toneMode ? sliderValues[slider.id] : 0;
                            const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;

                            return (
                                <div key={slider.id} className="flex flex-col items-center gap-2 flex-1 h-full">
                                    <div className="text-[10px] font-bold text-slate-500 tracking-widest">{slider.top}</div>
                                    <div
                                        className={`relative flex-1 w-full max-w-[60px] flex flex-col items-center bg-slate-900/50 rounded-full border border-slate-700/50 p-1 ${toneMode ? 'cursor-pointer' : ''}`}
                                        onMouseDown={(e) => handleDragStart(e, slider.id, slider.min, slider.max)}
                                        onTouchStart={(e) => handleDragStart(e, slider.id, slider.min, slider.max)}
                                    >
                                        <div className="absolute inset-x-0 top-4 bottom-4 w-1 mx-auto bg-slate-800 rounded-full"></div>
                                        {[0, 25, 50, 75, 100].map(tick => (
                                            <div key={tick} className="absolute left-4 right-4 h-px bg-slate-600/30" style={{ bottom: `${tick}%` }} />
                                        ))}
                                        <div
                                            ref={el => fillRefs.current[slider.id] = el}
                                            className="absolute bottom-4 left-0 right-0 w-3 mx-auto rounded-full transition-all duration-75 ease-out opacity-80"
                                            style={{ height: `${pct}%`, background: `linear-gradient(to top, #10b981, #3b82f6)` }}
                                        />
                                        <div
                                            ref={el => knobRefs.current[slider.id] = el}
                                            className={`absolute w-full h-6 left-0 flex items-center justify-center transition-all duration-75 ease-out z-10 ${toneMode ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
                                            style={{ bottom: `calc(${pct}% - 12px)` }}
                                        >
                                            <div className="w-8 h-4 rounded bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-500 shadow-lg flex items-center justify-center">
                                                <div className="w-4 h-0.5 bg-white/50 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-white/90 tracking-wide mt-1 truncate w-full text-center">{slider.label}</div>
                                    <div ref={el => valueRefs.current[slider.id] = el} className="text-[10px] font-mono text-emerald-400 font-bold">
                                        {val > 0 ? (slider.id === 'resonance' ? (val > 0.65 ? 'Bright' : (val < 0.35 ? 'Dark' : 'Balanced')) : Math.round(val * 10) / 10) : '---'}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 tracking-widest">{slider.bottom}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={`grid grid-cols-2 ${compact ? 'gap-4 overflow-y-auto h-full pb-4' : 'md:grid-cols-3 gap-8'}`}>
                        {sliders.map(slider => (
                            <div key={slider.id} className={`flex flex-col items-center bg-slate-900/50 ${compact ? 'p-3' : 'p-6'} rounded-2xl border border-white/5`}>
                                <div className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-white mb-2`}>{slider.label}</div>
                                <div className={`relative ${compact ? 'w-24 h-12' : 'w-40 h-20'} overflow-hidden mb-2`}>
                                    {/* Gauge Background */}
                                    <div className={`absolute ${compact ? 'w-24 h-24 border-[8px]' : 'w-40 h-40 border-[12px]'} rounded-full border-slate-700 border-b-0 border-l-0 border-r-0`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                                    {/* Gauge Arc */}
                                    <div className={`absolute ${compact ? 'w-24 h-24 border-[8px]' : 'w-40 h-40 border-[12px]'} rounded-full border-transparent border-t-emerald-500`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(0deg)' }}></div>

                                    {/* Needle */}
                                    <div
                                        ref={el => gaugeRefs.current[slider.id] = el}
                                        className={`absolute bottom-0 left-1/2 w-1 ${compact ? 'h-12' : 'h-20'} bg-white origin-bottom transition-transform duration-100 ease-out`}
                                        style={{ transform: 'rotate(-90deg)' }}
                                    ></div>
                                    <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-300 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                                </div>
                                <div ref={el => valueRefs.current[slider.id] = el} className={`${compact ? 'text-sm' : 'text-xl'} font-mono text-emerald-400 font-bold mt-1`}>
                                    ---
                                </div>
                                <div className="flex justify-between w-full text-[10px] text-slate-500 mt-1 px-2">
                                    <span>{slider.bottom}</span>
                                    <span>{slider.top}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MixingBoardView;

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic } from 'lucide-react';

const MixingBoardView = ({ dataRef, audioEngine }) => {
    const [toneMode, setToneMode] = useState(false);
    const [sliderValues, setSliderValues] = useState({
        pitch: 200,
        resonance: 1000,
        weight: 0,
        contour: 0.5,
        volume: 50
    });

    // Refs for DOM elements to update directly
    const fillRefs = useRef({});
    const knobRefs = useRef({});
    const valueRefs = useRef({});

    // Audio Context Refs
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);
    const audioContextRef = useRef(null);

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

            // Map data to slider percentages
            const updates = {
                pitch: { val: data.pitch, min: 50, max: 350 },
                resonance: { val: data.resonance, min: 500, max: 2000 }, // Adjusted for no pre-emphasis
                weight: { val: data.weight, min: -2, max: 2 },
                contour: { val: data.prosody?.variation || 0, min: 0, max: 1 },
                volume: { val: data.volume, min: 0, max: 100 } // Assuming volume is 0-100 or dB?
            };

            Object.keys(updates).forEach(key => {
                const { val, min, max } = updates[key];
                let percentage = ((val - min) / (max - min)) * 100;
                percentage = Math.max(0, Math.min(100, percentage));

                // Update DOM directly
                if (fillRefs.current[key]) {
                    fillRefs.current[key].style.height = `${percentage}%`;
                }
                if (knobRefs.current[key]) {
                    knobRefs.current[key].style.bottom = `calc(${percentage}% - 12px)`; // Center knob
                }
                if (valueRefs.current[key]) {
                    valueRefs.current[key].innerText = val > 0 ? Math.round(val * 10) / 10 : '---';
                }
            });

            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [toneMode, dataRef]);

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
        { id: 'resonance', label: 'Resonance', min: 500, max: 2000, top: 'BRIGHT', bottom: 'DARK', unit: '' },
        { id: 'weight', label: 'Weight', min: -2, max: 2, top: 'HEAVY', bottom: 'LIGHT', unit: '' },
        { id: 'contour', label: 'Contour', min: 0, max: 1, top: 'WIDE', bottom: 'FLAT', unit: '' },
        { id: 'volume', label: 'Volume', min: 0, max: 100, top: 'LOUD', bottom: 'QUIET', unit: '' }
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="glass-panel-dark p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Mixing Board</h2>
                        <p className="text-slate-400 text-sm">
                            {toneMode
                                ? 'Interactive Mode - Drag sliders to generate tone'
                                : 'Voice Mode - Sliders visualize your voice in real-time'}
                        </p>
                    </div>
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

            {/* Mixing Board */}
            <div className="glass-panel-dark p-8 rounded-2xl">
                <div className="flex justify-around items-end gap-4 h-[600px]"> {/* Increased height */}
                    {sliders.map(slider => {
                        // Initial render values
                        const val = toneMode ? sliderValues[slider.id] : 0;
                        const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;

                        return (
                            <div key={slider.id} className="flex flex-col items-center gap-4 flex-1 h-full">
                                {/* Top Label */}
                                <div className="text-xs font-bold text-slate-400 tracking-widest">
                                    {slider.top}
                                </div>

                                {/* Slider Track (Custom) */}
                                <div
                                    className={`relative flex-1 w-16 flex flex-col items-center bg-slate-900/50 rounded-full border border-slate-700/50 p-1 ${toneMode ? 'cursor-pointer' : ''}`}
                                    onMouseDown={(e) => handleDragStart(e, slider.id, slider.min, slider.max)}
                                    onTouchStart={(e) => handleDragStart(e, slider.id, slider.min, slider.max)}
                                >
                                    {/* Background Track Line */}
                                    <div className="absolute inset-x-0 top-4 bottom-4 w-1 mx-auto bg-slate-800 rounded-full"></div>

                                    {/* Tick Marks */}
                                    {[0, 25, 50, 75, 100].map(tick => (
                                        <div
                                            key={tick}
                                            className="absolute left-4 right-4 h-px bg-slate-600/30"
                                            style={{ bottom: `${tick}%` }}
                                        />
                                    ))}

                                    {/* Fill Bar */}
                                    <div
                                        ref={el => fillRefs.current[slider.id] = el}
                                        className="absolute bottom-4 left-0 right-0 w-4 mx-auto rounded-full transition-all duration-75 ease-out opacity-80"
                                        style={{
                                            height: `${pct}%`,
                                            background: `linear-gradient(to top, #10b981, #3b82f6)`
                                        }}
                                    />

                                    {/* Knob/Fader Cap */}
                                    <div
                                        ref={el => knobRefs.current[slider.id] = el}
                                        className={`absolute w-12 h-8 left-2 flex items-center justify-center transition-all duration-75 ease-out z-10 ${toneMode ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
                                        style={{
                                            bottom: `calc(${pct}% - 12px)`
                                        }}
                                    >
                                        <div className="w-12 h-6 rounded-md bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-500 shadow-lg flex items-center justify-center">
                                            <div className="w-8 h-0.5 bg-white/50 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Parameter Label */}
                                <div className="text-sm font-bold text-white/90 tracking-wide mt-2">
                                    {slider.label}
                                </div>

                                {/* Current Value */}
                                <div ref={el => valueRefs.current[slider.id] = el} className="text-xs font-mono text-emerald-400 font-bold">
                                    {val > 0 ? Math.round(val * 10) / 10 : '---'}
                                </div>

                                {/* Bottom Label */}
                                <div className="text-xs font-bold text-slate-400 tracking-widest">
                                    {slider.bottom}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MixingBoardView;

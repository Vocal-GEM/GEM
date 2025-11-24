import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic } from 'lucide-react';

const MixingBoardView = ({ dataRef, audioEngine }) => {
    const [toneMode, setToneMode] = useState(false);
    const [sliderValues, setSliderValues] = useState({
        pitch: 200,
        resonance: 1500,
        weight: 0,
        contour: 0.5,
        volume: 50
    });

    // Refs for DOM elements to update directly
    const sliderRefs = useRef({});
    const valueRefs = useRef({});
    const fillRefs = useRef({});
    const knobRefs = useRef({});

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
    }, [toneMode]);

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
                resonance: { val: data.resonance, min: 500, max: 2500 },
                weight: { val: data.weight, min: -2, max: 2 },
                contour: { val: data.prosody?.variation || 0, min: 0, max: 1 },
                volume: { val: data.volume, min: 0, max: 100 }
            };

            Object.keys(updates).forEach(key => {
                const { val, min, max } = updates[key];
                const percentage = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));

                // Update DOM directly
                if (fillRefs.current[key]) {
                    fillRefs.current[key].style.height = `${percentage}%`;
                }
                if (knobRefs.current[key]) {
                    knobRefs.current[key].style.bottom = `calc(${percentage}% - 24px)`;
                }
                if (valueRefs.current[key]) {
                    valueRefs.current[key].innerText = val > 0 ? Math.round(val * 10) / 10 : '---';
                }
            });

            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [toneMode]);

    const handleSliderChange = (param, value) => {
        if (toneMode) {
            setSliderValues(prev => ({ ...prev, [param]: parseFloat(value) }));
            // Also update DOM for immediate feedback in tone mode
            const slider = sliders.find(s => s.id === param);
            if (slider) {
                const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
                if (fillRefs.current[param]) fillRefs.current[param].style.height = `${percentage}%`;
                if (knobRefs.current[param]) knobRefs.current[param].style.bottom = `calc(${percentage}% - 24px)`;
                if (valueRefs.current[param]) valueRefs.current[param].innerText = Math.round(value * 10) / 10;
            }
        }
    };

    const sliders = [
        { id: 'pitch', label: 'Pitch', min: 50, max: 350, top: 'HIGH', bottom: 'LOW', unit: 'Hz' },
        { id: 'resonance', label: 'Resonance', min: 500, max: 2500, top: 'BRIGHT', bottom: 'DARK', unit: '' },
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
                                ? 'Interactive Mode - Adjust sliders to hear a generated tone'
                                : 'Voice Mode - Sliders respond to your voice in real-time'}
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
                <div className="flex justify-around items-end gap-4 h-[500px]">
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

                                {/* Slider Container */}
                                <div className="relative flex-1 w-20 flex flex-col items-center bg-slate-900/50 rounded-full border border-slate-700/50 p-1">
                                    {/* Background Track */}
                                    <div className="absolute inset-x-0 top-2 bottom-2 w-1 mx-auto bg-slate-800 rounded-full"></div>

                                    {/* Tick Marks */}
                                    {[0, 25, 50, 75, 100].map(tick => (
                                        <div
                                            key={tick}
                                            className="absolute left-2 right-2 h-px bg-slate-600/30"
                                            style={{ bottom: `${tick}%` }}
                                        />
                                    ))}

                                    {/* Fill */}
                                    <div
                                        ref={el => fillRefs.current[slider.id] = el}
                                        className="absolute bottom-2 left-0 right-0 w-full rounded-full transition-all duration-75 ease-out opacity-50"
                                        style={{
                                            height: `${pct}%`,
                                            background: `linear-gradient(to top, #10b981, #3b82f6)`
                                        }}
                                    />

                                    {/* Slider Input (Interactive in Tone Mode) */}
                                    <input
                                        type="range"
                                        min={slider.min}
                                        max={slider.max}
                                        step={(slider.max - slider.min) / 100}
                                        value={toneMode ? sliderValues[slider.id] : (slider.min + slider.max) / 2} // Dummy value in voice mode
                                        onChange={(e) => handleSliderChange(slider.id, e.target.value)}
                                        disabled={!toneMode}
                                        className="absolute inset-0 w-full h-full opacity-0 z-20"
                                        style={{
                                            writingMode: 'bt-lr', /* IE */
                                            WebkitAppearance: 'slider-vertical', /* WebKit */
                                            cursor: toneMode ? 'pointer' : 'default'
                                        }}
                                    />

                                    {/* Knob/Indicator */}
                                    <div
                                        ref={el => knobRefs.current[slider.id] = el}
                                        className="absolute w-16 h-12 left-2 flex items-center justify-center transition-all duration-75 ease-out pointer-events-none z-10"
                                        style={{
                                            bottom: `calc(${pct}% - 24px)`
                                        }}
                                    >
                                        <div className="w-16 h-10 rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 shadow-xl flex items-center justify-center">
                                            <div className="w-10 h-1 bg-slate-900/50 rounded-full"></div>
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

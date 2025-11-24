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

    // Update tone in real-time when sliders change
    useEffect(() => {
        if (toneMode && oscillatorRef.current && gainNodeRef.current && audioContextRef.current) {
            const ctx = audioContextRef.current;
            oscillatorRef.current.frequency.setValueAtTime(sliderValues.pitch, ctx.currentTime);
            gainNodeRef.current.gain.setValueAtTime(sliderValues.volume / 100 * 0.3, ctx.currentTime);
        }
    }, [sliderValues, toneMode]);

    const handleSliderChange = (param, value) => {
        if (toneMode) {
            setSliderValues(prev => ({ ...prev, [param]: parseFloat(value) }));
        }
    };

    // Get current values from dataRef or sliderValues
    const getCurrentValue = (param) => {
        if (toneMode) {
            return sliderValues[param];
        }

        // Map from dataRef
        switch (param) {
            case 'pitch':
                return dataRef.current?.pitch || 0;
            case 'resonance':
                return dataRef.current?.resonance || 1500;
            case 'weight':
                return dataRef.current?.weight || 0;
            case 'contour':
                return dataRef.current?.prosody?.variation || 0.5;
            case 'volume':
                return dataRef.current?.volume || 0;
            default:
                return 0;
        }
    };

    const sliders = [
        {
            id: 'pitch',
            label: 'Pitch',
            min: 50,
            max: 350,
            top: 'HIGH',
            bottom: 'LOW',
            unit: 'Hz'
        },
        {
            id: 'resonance',
            label: 'Resonance',
            min: 500,
            max: 2500,
            top: 'BRIGHT',
            bottom: 'DARK',
            unit: ''
        },
        {
            id: 'weight',
            label: 'Weight',
            min: -2,
            max: 2,
            top: 'HEAVY',
            bottom: 'LIGHT',
            unit: ''
        },
        {
            id: 'contour',
            label: 'Contour',
            min: 0,
            max: 1,
            top: 'WIDE',
            bottom: 'SHALLOW',
            unit: ''
        },
        {
            id: 'volume',
            label: 'Volume',
            min: 0,
            max: 100,
            top: 'LOUD',
            bottom: 'QUIET',
            unit: ''
        }
    ];

    return (
        <div className="space-y-6">
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
                <div className="flex justify-around items-end gap-8 h-96">
                    {sliders.map(slider => {
                        const value = getCurrentValue(slider.id);
                        const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;

                        return (
                            <div key={slider.id} className="flex flex-col items-center gap-4 flex-1">
                                {/* Top Label */}
                                <div className="text-xs font-bold text-slate-400 tracking-widest">
                                    {slider.top}
                                </div>

                                {/* Slider Container */}
                                <div className="relative flex-1 w-16 flex flex-col items-center">
                                    {/* Background Track */}
                                    <div className="absolute inset-0 w-16 bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-700/50">
                                        {/* Tick Marks */}
                                        {[0, 25, 50, 75, 100].map(tick => (
                                            <div
                                                key={tick}
                                                className="absolute left-0 right-0 h-0.5 bg-slate-600/30"
                                                style={{ bottom: `${tick}%` }}
                                            />
                                        ))}

                                        {/* Fill */}
                                        <div
                                            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
                                            style={{
                                                height: `${Math.max(0, Math.min(100, percentage))}%`,
                                                background: `linear-gradient(to top, #10b981, #3b82f6)`
                                            }}
                                        />
                                    </div>

                                    {/* Slider Input (Interactive in Tone Mode) */}
                                    <input
                                        type="range"
                                        min={slider.min}
                                        max={slider.max}
                                        step={(slider.max - slider.min) / 100}
                                        value={value}
                                        onChange={(e) => handleSliderChange(slider.id, e.target.value)}
                                        disabled={!toneMode}
                                        className="absolute inset-0 w-16 h-full opacity-0 cursor-pointer"
                                        style={{
                                            writingMode: 'bt-lr',
                                            WebkitAppearance: 'slider-vertical',
                                            cursor: toneMode ? 'pointer' : 'default'
                                        }}
                                    />

                                    {/* Moth/Indicator */}
                                    <div
                                        className="absolute w-12 h-12 -left-8 flex items-center justify-center transition-all duration-300 pointer-events-none"
                                        style={{
                                            bottom: `calc(${Math.max(0, Math.min(100, percentage))}% - 24px)`
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-white/90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Parameter Label */}
                                <div className="text-sm font-bold text-white/90 tracking-wide">
                                    {slider.label}
                                </div>

                                {/* Current Value */}
                                <div className="text-xs font-mono text-slate-400">
                                    {value > 0 ? Math.round(value * 10) / 10 : '---'}
                                    {value > 0 && slider.unit}
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

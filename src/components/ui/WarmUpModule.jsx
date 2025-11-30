import React, { useState, useMemo } from 'react';
import { WARMUP_IMAGES } from '../../data/WarmupImages';

const WarmUpModule = ({ onComplete, onSkip, embedded = false }) => {
    const [mode, setMode] = useState('guided'); // 'guided' or 'visual'
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedVisual, setSelectedVisual] = useState(null);

    const visualWarmups = useMemo(() => WARMUP_IMAGES || [], []);

    const exercises = [
        {
            title: 'Lip Trills',
            icon: '💋',
            instructions: 'Blow air through your lips to make them vibrate (like a motorboat). Do this for 30 seconds.',
            duration: 30,
            demo: 'Brrrrrrr...'
        },
        {
            title: 'Humming',
            icon: '🎵',
            instructions: 'Hum gently on "mmm" at a comfortable pitch. Feel the vibration in your lips and face.',
            duration: 30,
            demo: 'Mmmmmm...'
        },
        {
            title: 'Sirens',
            icon: '🚨',
            instructions: 'Glide smoothly from your lowest note to your highest and back down. Keep it gentle.',
            duration: 30,
            demo: 'Wooooo...'
        }
    ];

    const handleNext = () => {
        if (currentStep < exercises.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            if (embedded) {
                setCurrentStep(0); // Restart if embedded
            } else {
                onComplete();
            }
        }
    };

    const exercise = exercises[currentStep];

    const renderGuided = () => (
        <div className="relative z-10">
            <div className="text-center mb-6">
                <div className="text-5xl mb-4 animate-bounce">{exercise.icon}</div>
                <h2 className="text-xl font-bold text-white mb-2">{exercise.title}</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{exercise.instructions}</p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 mb-6 text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Example</div>
                <div className="text-xl font-serif text-blue-300">{exercise.demo}</div>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
                {exercises.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-orange-500 w-8' : i < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                    ></div>
                ))}
            </div>

            <div className="flex gap-4">
                {!embedded && (
                    <button
                        onClick={onSkip}
                        className="flex-1 py-2 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-wider"
                    >
                        Skip Warm-Up
                    </button>
                )}
                <button
                    onClick={handleNext}
                    className="flex-[2] py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 text-xs uppercase tracking-wider"
                >
                    {currentStep === exercises.length - 1 ? (embedded ? "Restart" : "I'm Warmed Up!") : 'Next Exercise'}
                </button>
            </div>
        </div>
    );

    const renderVisualList = () => (
        <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Visual Guides</h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 max-h-[400px]">
                {visualWarmups.length > 0 ? (
                    visualWarmups.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedVisual(item)}
                            className="w-full p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-orange-500/30 transition-all text-left flex items-center gap-3 group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 relative">
                                <img
                                    src={`/assets/warmups/${item.filename}`}
                                    alt={item.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); e.target.parentElement.innerHTML = '📷' }}
                                />
                            </div>
                            <div>
                                <div className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">{item.title}</div>
                                <div className="text-xs text-slate-500 truncate">{item.description}</div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center text-slate-500 py-8">
                        <p>No images found.</p>
                        <p className="text-xs mt-2">Add images to public/assets/warmups and update src/data/WarmupImages.js</p>
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
                <button
                    onClick={onSkip}
                    className="w-full py-2 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-wider"
                >
                    Close
                </button>
            </div>
        </div>
    );

    const renderVisualDetail = () => (
        <div className="relative z-10 flex flex-col h-full">
            <button
                onClick={() => setSelectedVisual(null)}
                className="absolute top-0 left-0 p-2 text-slate-400 hover:text-white z-20 bg-black/20 rounded-full backdrop-blur-sm"
            >
                ← Back
            </button>

            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                <div className="relative w-full max-h-[60vh] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
                    <img
                        src={`/assets/warmups/${selectedVisual.filename}`}
                        alt={selectedVisual.title}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold text-white">{selectedVisual.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{selectedVisual.description}</p>
                </div>
            </div>
        </div>
    );

    const content = (
        <div className={`glass-panel w-full p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden ${embedded ? 'bg-slate-900/50' : 'max-w-md w-full'}`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>

            {/* Mode Switcher */}
            {!selectedVisual && (
                <div className="relative z-20 flex justify-center mb-6 bg-slate-900/50 p-1 rounded-full w-max mx-auto border border-white/5">
                    <button
                        onClick={() => setMode('guided')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'guided' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Guided
                    </button>
                    <button
                        onClick={() => setMode('visual')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'visual' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Visual
                    </button>
                </div>
            )}

            {mode === 'guided' && renderGuided()}
            {mode === 'visual' && !selectedVisual && renderVisualList()}
            {mode === 'visual' && selectedVisual && renderVisualDetail()}

            <div className="mt-4 text-center text-[10px] text-slate-500 relative z-10">
                💡 Warm-ups protect your voice and improve performance
            </div>
        </div>
    );

    if (embedded) return content;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            {content}
        </div>
    );
};

export default WarmUpModule;

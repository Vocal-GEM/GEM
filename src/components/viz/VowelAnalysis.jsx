import React, { useEffect, useState } from 'react';

const VowelAnalysis = ({ dataRef, colorBlindMode }) => {
    const [currentVowel, setCurrentVowel] = useState('');
    const [currentF1, setCurrentF1] = useState(0);
    const [currentF2, setCurrentF2] = useState(0);

    useEffect(() => {
        const loop = () => {
            if (dataRef.current) {
                const { f1, f2, vowel } = dataRef.current;
                setCurrentVowel(vowel || '');
                setCurrentF1(f1 || 0);
                setCurrentF2(f2 || 0);
            }
            requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'vowel-analysis',
                loop,
                renderCoordinator.PRIORITY.LOW
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    return (
        <div className="flex flex-col gap-4">
            <div className="glass-panel-dark px-4 py-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Detected Vowel</div>
                <div className={`text-4xl font-bold transition-all ${currentVowel ? 'text-teal-400 animate-pulse' : 'text-slate-600'
                    }`}>
                    {currentVowel ? `/${currentVowel}/` : '—'}
                </div>
            </div>
            <div className="glass-panel-dark px-4 py-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Formants</div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-slate-400">F1 (Openness)</span>
                        <span className="text-sm font-mono">
                            <span className={`font-bold ${colorBlindMode ? 'text-purple-400' : 'text-pink-400'}`}>{currentF1 > 0 ? currentF1.toFixed(0) : '—'}</span> <span className="text-slate-500 text-xs">Hz</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-slate-400">F2 (Backness)</span>
                        <span className="text-sm font-mono">
                            <span className={`font-bold ${colorBlindMode ? 'text-teal-400' : 'text-blue-400'}`}>{currentF2 > 0 ? currentF2.toFixed(0) : '—'}</span> <span className="text-slate-500 text-xs">Hz</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VowelAnalysis;

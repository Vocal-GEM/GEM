import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const VowelSpacePlot = ({ f1, f2, dataRef }) => {
    const { colorBlindMode } = useSettings();

    // Vowel targets (approximate for feminine resonance)
    const targets = [
        { label: '/i/', f1: 300, f2: 2500, color: colorBlindMode ? 'rgba(147, 51, 234, 0.2)' : 'rgba(236, 72, 153, 0.2)' }, // Pink/Purple
        { label: '/a/', f1: 850, f2: 1700, color: colorBlindMode ? 'rgba(13, 148, 136, 0.2)' : 'rgba(59, 130, 246, 0.2)' }, // Blue/Teal
        { label: '/u/', f1: 300, f2: 800, color: colorBlindMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)' }   // Green/Amber
    ];

    // Scales
    const minF1 = 200, maxF1 = 1000;
    const minF2 = 500, maxF2 = 3000;

    const getXPos = (val) => 100 - ((val - minF2) / (maxF2 - minF2)) * 100;
    const getYPos = (val) => ((val - minF1) / (maxF1 - minF1)) * 100;

    const pointRef = React.useRef(null);
    const labelRef = React.useRef(null);
    const [currentVowel, setCurrentVowel] = React.useState('');
    const [currentF1, setCurrentF1] = React.useState(0);
    const [currentF2, setCurrentF2] = React.useState(0);

    React.useEffect(() => {
        if (!dataRef) return;

        const loop = () => {
            if (pointRef.current && dataRef.current) {
                const { f1: currentF1, f2: currentF2, vowel } = dataRef.current;

                // Update state for vowel display
                setCurrentVowel(vowel || '');
                setCurrentF1(currentF1 || 0);
                setCurrentF2(currentF2 || 0);

                if (currentF1 && currentF2 && currentF1 > 0 && currentF2 > 0) {
                    pointRef.current.style.opacity = '1';
                    pointRef.current.style.left = `${getXPos(currentF2)}%`;
                    pointRef.current.style.top = `${getYPos(currentF1)}%`;

                    if (labelRef.current) {
                        labelRef.current.innerText = `${currentF1.toFixed(0)} / ${currentF2.toFixed(0)} Hz`;
                    }
                } else {
                    pointRef.current.style.opacity = '0';
                }
            }
            requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'vowel-space-plot',
                loop,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    return (
        <div className="h-full bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden">
            {/* Vowel Detection Display */}
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
                <div className="glass-panel-dark px-3 py-2 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Detected Vowel</div>
                    <div className={`text-xl font-bold transition-all ${currentVowel ? 'text-teal-400 animate-pulse' : 'text-slate-600'
                        }`}>
                        {currentVowel ? `/${currentVowel}/` : '—'}
                    </div>
                </div>
                <div className="glass-panel-dark px-3 py-2 rounded-lg text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Formants</div>
                    <div className="text-xs font-mono text-slate-300">
                        F1: <span className={`font-bold ${colorBlindMode ? 'text-purple-400' : 'text-pink-400'}`}>{currentF1 > 0 ? currentF1.toFixed(0) : '—'}</span> Hz
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                        F2: <span className={`font-bold ${colorBlindMode ? 'text-teal-400' : 'text-blue-400'}`}>{currentF2 > 0 ? currentF2.toFixed(0) : '—'}</span> Hz
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 p-4 pt-20">
                {/* Grid & Labels */}
                <div className="w-full h-full border-l border-b border-slate-700 relative">
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                        F2 (Resonance/Backness)
                    </div>
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
                        F1 (Openness)
                    </div>

                    {/* Target Zones */}
                    {targets.map(t => (
                        <div
                            key={t.label}
                            className="absolute rounded-full flex items-center justify-center text-xs font-bold text-white/50"
                            style={{
                                left: `${getXPos(t.f2)}%`,
                                top: `${getYPos(t.f1)}%`,
                                width: '40px',
                                height: '40px',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: t.color
                            }}
                        >
                            {t.label}
                        </div>
                    ))}

                    {/* User Point (Static Props) */}
                    {f1 && f2 && !dataRef && (
                        <div
                            className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] transition-all duration-500"
                            style={{
                                left: `${getXPos(f2)}%`,
                                top: `${getYPos(f1)}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                {f1.toFixed(0)} / {f2.toFixed(0)} Hz
                            </div>
                        </div>
                    )}

                    {/* User Point (Real-time Ref) */}
                    {dataRef && (
                        <div
                            ref={pointRef}
                            className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] transition-all duration-75 opacity-0"
                            style={{
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div ref={labelRef} className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                0 / 0 Hz
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VowelSpacePlot;

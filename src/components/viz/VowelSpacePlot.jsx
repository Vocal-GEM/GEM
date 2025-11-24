import React from 'react';

const VowelSpacePlot = ({ f1, f2 }) => {
    // Vowel targets (approximate for feminine resonance)
    const targets = [
        { label: '/i/', f1: 300, f2: 2500, color: 'rgba(236, 72, 153, 0.2)' }, // Pink
        { label: '/a/', f1: 850, f2: 1700, color: 'rgba(59, 130, 246, 0.2)' }, // Blue
        { label: '/u/', f1: 300, f2: 800, color: 'rgba(16, 185, 129, 0.2)' }   // Green
    ];

    // Scales
    const minF1 = 200, maxF1 = 1000;
    const minF2 = 500, maxF2 = 3000;

    const getX = (val) => ((val - minF2) / (maxF2 - minF2)) * 100; // F2 is usually X (inverted often, but let's keep standard X)
    // Actually, standard vowel charts have F2 on X (inverted) and F1 on Y (inverted).
    // Let's do: X = F2 (high to low), Y = F1 (low to high) - wait, F1 low is high vowel (top).
    // Standard chart:
    // Top-Left: /i/ (Low F1, High F2)
    // Bottom-Left: /a/ (High F1, High F2) - Wait /a/ is central/back?
    // Let's stick to a simple scatter: X=F2, Y=F1.
    // To match "Vowel Space":
    // X-axis: F2 (Back -> Front) :: 800 -> 2500
    // Y-axis: F1 (Close -> Open) :: 200 -> 1000

    // Let's invert axes to match standard IPA chart orientation roughly
    // X: F2 (3000 -> 500)
    // Y: F1 (200 -> 1000)

    const getXPos = (val) => 100 - ((val - minF2) / (maxF2 - minF2)) * 100;
    const getYPos = (val) => ((val - minF1) / (maxF1 - minF1)) * 100;

    return (
        <div className="h-64 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 p-4">
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

                    {/* User Point */}
                    {f1 && f2 && (
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
                </div>
            </div>
        </div>
    );
};

export default VowelSpacePlot;

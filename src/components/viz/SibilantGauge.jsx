import React from 'react';

const SibilantGauge = ({ centroid = 0, isSibilant = false }) => {
    // Target zones
    const minFreq = 3000;
    const maxFreq = 9000;
    const range = maxFreq - minFreq;

    // Calculate percentage position
    const getPercent = (freq) => {
        const clamped = Math.max(minFreq, Math.min(freq, maxFreq));
        return ((clamped - minFreq) / range) * 100;
    };

    const currentPercent = getPercent(centroid);

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-slate-400 text-sm font-bold mb-4 flex justify-between">
                <span>SIBILANT SHARPNESS</span>
                <span className={isSibilant ? "text-green-400" : "text-slate-600"}>
                    {isSibilant ? "DETECTED" : "WAITING"}
                </span>
            </h3>

            <div className="relative h-12 bg-slate-800 rounded-full overflow-hidden">
                {/* Zones */}
                <div className="absolute inset-0 flex opacity-30">
                    <div className="w-[30%] bg-red-500" title="Dull /sh/"></div>
                    <div className="w-[20%] bg-yellow-500" title="Androgynous"></div>
                    <div className="w-[50%] bg-green-500" title="Sharp /s/"></div>
                </div>

                {/* Labels */}
                <div className="absolute inset-0 flex justify-between px-4 items-center text-xs font-bold text-white/50 pointer-events-none">
                    <span>/sh/ (Dull)</span>
                    <span>/s/ (Sharp)</span>
                </div>

                {/* Indicator */}
                <div
                    className={`absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-100 ease-out ${isSibilant ? 'opacity-100' : 'opacity-30'}`}
                    style={{ left: `${currentPercent}%` }}
                ></div>
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-500 font-mono">
                <span>3kHz</span>
                <span>{centroid.toFixed(0)} Hz</span>
                <span>9kHz</span>
            </div>

            <p className="mt-4 text-xs text-slate-400">
                Aim for the <span className="text-green-400">Green Zone</span> for a brighter, more feminine "S" sound.
                The <span className="text-red-400">Red Zone</span> is typical for "SH" sounds.
            </p>
        </div>
    );
};

export default SibilantGauge;

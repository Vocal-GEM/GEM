import React from 'react';

const SagittalDiagram = ({ target = 'neutral' }) => {
    // Simplified SVG paths for vocal tract parts
    const paths = {
        headOutline: "M 50 250 Q 50 50 200 50 Q 350 50 350 250",
        palate: "M 150 150 Q 200 100 250 150",
        tongueNeutral: "M 180 220 Q 220 200 260 220",
        tongueHighFront: "M 180 220 Q 200 120 260 220", // /i/
        tongueHighBack: "M 180 220 Q 240 120 260 220", // /u/
        tongueLow: "M 180 220 Q 220 240 260 220", // /a/
        tongueSibilant: "M 180 220 Q 210 140 260 220", // /s/ - Tip up near alveolar ridge
        lipsNeutral: "M 280 180 Q 290 180 280 200",
        lipsRounded: "M 290 180 Q 310 190 290 200"
    };

    const getTonguePath = () => {
        switch (target) {
            case 'i': return paths.tongueHighFront;
            case 'u': return paths.tongueHighBack;
            case 'a': return paths.tongueLow;
            case 's':
            case 'sh': return paths.tongueSibilant;
            default: return paths.tongueNeutral;
        }
    };

    const getLipsPath = () => {
        switch (target) {
            case 'u':
            case 'sh': return paths.lipsRounded;
            default: return paths.lipsNeutral;
        }
    };

    return (
        <div className="w-full h-64 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-4">
            <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Head Outline */}
                <path d={paths.headOutline} fill="none" stroke="#475569" strokeWidth="2" />

                {/* Palate (Static) */}
                <path d={paths.palate} fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

                {/* Tongue (Dynamic) */}
                <path
                    d={getTonguePath()}
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-in-out"
                />

                {/* Lips (Dynamic) */}
                <path
                    d={getLipsPath()}
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-in-out"
                />

                {/* Target Label */}
                <text x="50" y="280" fill="#94a3b8" className="text-sm font-mono">
                    Target: {target !== 'neutral' ? `/${target}/` : 'Neutral'}
                </text>
            </svg>
        </div>
    );
};

export default SagittalDiagram;

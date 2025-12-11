import { useEffect, useState } from 'react';

const BreathPacer = () => {
    const [phase, setPhase] = useState('Inhale');
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const cycle = () => {
            setPhase('Inhale'); setScale(1.5);
            setTimeout(() => {
                setPhase('Hold');
                setTimeout(() => {
                    setPhase('Exhale'); setScale(1);
                    setTimeout(() => {
                        setPhase('Hold');
                    }, 4000);
                }, 2000);
            }, 4000);
        };
        cycle();
        const interval = setInterval(cycle, 12000); // 4-2-4-2 box breathing
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center mb-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div
                    className="w-20 h-20 bg-blue-500 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                    style={{ transform: `scale(${scale})` }}
                >
                    <span className="text-white font-bold text-xs uppercase tracking-widest">{phase}</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-white">Box Breathing</h3>
                <p className="text-sm text-slate-400">Inhale 4s • Hold 2s • Exhale 4s • Hold 2s</p>
            </div>
        </div>
    );
};

export default BreathPacer;

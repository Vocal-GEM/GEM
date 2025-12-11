

const CompassWizard = ({ onComplete }) => {
    const handleSelect = (type) => {
        let range = { min: 170, max: 220 };
        if (type === 'masc') range = { min: 85, max: 135 };
        if (type === 'androg') range = { min: 135, max: 175 };
        if (type === 'fem') range = { min: 170, max: 220 };
        onComplete(range, { mode: type });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="max-w-lg w-full space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white">Set Your Compass 🧭</h1>
                    <p className="text-slate-400">Choose a target range to guide your exercises. You can change this anytime.</p>
                </div>

                <div className="grid gap-4">
                    <button onClick={() => handleSelect('masc')} className="group relative overflow-hidden p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all text-left">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-xl font-bold text-white mb-1">Masculine</h3>
                        <p className="text-sm text-slate-400">Focus on chest resonance and lower pitch (85-135 Hz).</p>
                    </button>

                    <button onClick={() => handleSelect('androg')} className="group relative overflow-hidden p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-purple-500 hover:bg-slate-700 transition-all text-left">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-xl font-bold text-white mb-1">Androgynous</h3>
                        <p className="text-sm text-slate-400">A balanced mix of resonance and pitch (135-175 Hz).</p>
                    </button>

                    <button onClick={() => handleSelect('fem')} className="group relative overflow-hidden p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-pink-500 hover:bg-slate-700 transition-all text-left">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-xl font-bold text-white mb-1">Feminine</h3>
                        <p className="text-sm text-slate-400">Focus on head resonance and higher pitch (170-220 Hz).</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompassWizard;

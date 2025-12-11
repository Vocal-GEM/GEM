import { Sliders, Volume1, Volume2 } from 'lucide-react';

const RegisterBlend = ({ onComplete }) => {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Register Blending</h2>
                <p className="text-slate-400">
                    Avoiding the &quot;Break&quot; or &quot;Yodel&quot;. The goal is a seamless slide from Chest to Head.
                </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 min-h-[300px] flex flex-col justify-center gap-8">

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sliders className="text-indigo-400" />
                        Messa di Voce (The Swell)
                    </h3>
                    <p className="text-slate-300 text-sm">
                        This Italian term means &quot;Placing the voice&quot;. It&apos;s the master exercise for control.
                    </p>
                </div>

                <div className="relative h-24 bg-slate-900 rounded-xl flex items-center px-4 overflow-hidden">
                    {/* Visual Wave */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500"
                            style={{ clipPath: 'polygon(0 45%, 50% 10%, 100% 45%, 100% 55%, 50% 90%, 0 55%)' }}>
                        </div>
                    </div>

                    <div className="w-full flex justify-between relative z-10 text-xs font-bold uppercase tracking-widest">
                        <div className="text-blue-400 text-center">
                            <Volume1 size={24} className="mx-auto mb-1" />
                            Soft
                        </div>
                        <div className="text-pink-400 text-center">
                            <Volume2 size={32} className="mx-auto mb-1" />
                            Loud
                        </div>
                        <div className="text-blue-400 text-center">
                            <Volume1 size={24} className="mx-auto mb-1" />
                            Soft
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <ol className="list-decimal list-inside text-slate-400 space-y-2 text-sm">
                        <li>Pick a comfortable note.</li>
                        <li>Start <strong>Very Soft</strong> (Thin/Head).</li>
                        <li>Gradually swell to <strong>Loud</strong> (Thick/Chest-Mix).</li>
                        <li>Gradually fade back to <strong>Very Soft</strong>.</li>
                    </ol>
                    <p className="text-xs text-slate-500 mt-2 italic">
                        *If you crack, you added weight too fast.
                    </p>
                </div>

                <button
                    onClick={onComplete}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg transition-all"
                >
                    I&apos;ve Tried The Swell
                </button>
            </div>
        </div>
    );
};

export default RegisterBlend;

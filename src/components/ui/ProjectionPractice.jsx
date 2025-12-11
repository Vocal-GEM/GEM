import { Megaphone } from 'lucide-react';

const ProjectionPractice = ({ onComplete }) => {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Safe Projection</h2>
                <p className="text-slate-400">
                    &quot;Yelling&quot; usually drops us into a masculine chest voice.
                    We need to learn to project using <strong>Resonance</strong> and <strong>Twang</strong> instead of Grunt.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* The Wrong Way */}
                <div className="bg-red-900/10 border border-red-500/30 p-6 rounded-2xl">
                    <h3 className="font-bold text-red-400 mb-2">The Wrong Way (Grunt)</h3>
                    <p className="text-sm text-slate-300 mb-4">
                        Pushing from the throat. Thickens vocal folds. Lowers the larynx.
                        <br />Result: &quot;MAN YELLING&quot;.
                    </p>
                    <div className="bg-slate-900 p-3 rounded-lg text-center text-xs text-red-300 font-mono">
                        &quot;HEY YOU!&quot; (Deep/Barky)
                    </div>
                </div>

                {/* The Right Way */}
                <div className="bg-green-900/10 border border-green-500/30 p-6 rounded-2xl">
                    <h3 className="font-bold text-green-400 mb-2">The Right Way (Call)</h3>
                    <p className="text-sm text-slate-300 mb-4">
                        Using the diaphragm (Air) + High Larynx + Twang (Laser).
                        <br />Result: &quot;Piercing Call&quot;.
                    </p>
                    <div className="bg-slate-900 p-3 rounded-lg text-center text-xs text-green-300 font-mono">
                        &quot;HEY YOU!&quot; (Bright/Sharp)
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <Megaphone className="text-indigo-400" />
                    <h3 className="font-bold text-white">The &quot;Hey You!&quot; Test</h3>
                </div>

                <p className="text-slate-300 text-sm mb-4">
                    Imagine your dog is running into traffic. You need to call them back.
                    <strong>Don&apos;t drop your pitch.</strong> Use the &quot;Witch Cackle&quot; muscles to call out.
                </p>

                <div className="flex gap-2">
                    <div className="flex-1 bg-slate-900 p-4 rounded-xl text-center text-white font-bold">
                        1. Prep &quot;Witch&quot; feeling
                    </div>
                    <div className="flex-1 bg-slate-900 p-4 rounded-xl text-center text-white font-bold">
                        2. Deep Breath
                    </div>
                    <div className="flex-1 bg-slate-900 p-4 rounded-xl text-center text-white font-bold">
                        3. CALL!
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Understand Projection
                </button>
            </div>
        </div>
    );
};

export default ProjectionPractice;

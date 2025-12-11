import { Clock, Zap } from 'lucide-react';

const QUICK_ITEMS = [
    { title: '1. Light Body Stretch', desc: 'Shoulders, neck, whatever feels tight.' },
    { title: '2. Yawn Stretch', desc: 'Open the back of the throat.' },
    { title: '3. Conscious Breathing', desc: 'A few breaths into the belly.' },
    { title: '4. Posture Check-in', desc: 'Proudly elevated chest.' },
    { title: '5. Doggy Breath', desc: 'Pant for a few seconds to wake up abs.' },
    { title: '6. Vocal Glisses', desc: 'A few gentle slides up and down.' }
];

const QuickWarmUp = ({ onComplete }) => {
    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                    <Zap className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">The &quot;I&apos;m In A Rush&quot; Routine</h3>
                <p className="text-slate-300 max-w-lg mx-auto">
                    No time? No problem. Just do these 6 things to get your &quot;vote&quot; in for being a voice practitioner today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_ITEMS.map((item, i) => (
                    <div key={i} className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl flex items-start gap-4 hover:border-orange-500/50 transition-colors">
                        <div className="p-2 bg-slate-800 rounded text-orange-400 font-bold font-mono">
                            {i + 1}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">{item.title.split('. ')[1]}</h4>
                            <p className="text-slate-400 text-sm">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 border border-slate-600 hover:border-white transition-all"
                >
                    <Clock size={20} /> Done (That was fast!)
                </button>
            </div>
        </div>
    );
};

export default QuickWarmUp;

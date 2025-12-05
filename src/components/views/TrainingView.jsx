import IntonationTrainingModule from '../training/IntonationTrainingModule';
import { Dumbbell, Music, Activity, ArrowLeft, Mic2, TrendingUp, TrendingDown, Waves } from 'lucide-react';

const TrainingView = () => {
    const [activeModule, setActiveModule] = useState(null);

    const modules = [
        {
            id: 'pitch-a3',
            title: 'Sustain A3',
            description: 'Practice holding a steady A3 note (220Hz). Good for lower range stability.',
            icon: <Music size={24} className="text-teal-400" />,
            component: <PitchTrainingModule targetNote="A3" targetFreq={220} tolerance={5} />
        },
        {
            id: 'pitch-c4',
            title: 'Sustain C4',
            description: 'Practice holding a steady Middle C (261Hz). A central target for many voices.',
            icon: <Music size={24} className="text-purple-400" />,
            component: <PitchTrainingModule targetNote="C4" targetFreq={261.6} tolerance={5} />
        },
        {
            id: 'resonance-i',
            title: 'Bright /i/ Target',
            description: 'Practice the /i/ (heed) vowel to maximize oral resonance and brightness.',
            icon: <Mic2 size={24} className="text-amber-400" />,
            component: <ResonanceTrainingModule targetVowel="i" />
        },
        {
            id: 'intonation-rising',
            title: 'Rising Intonation',
            description: 'Practice the upward pitch slide used in questions.',
            icon: <TrendingUp size={24} className="text-teal-400" />,
            component: <IntonationTrainingModule patternType="rising" />
        },
        {
            id: 'intonation-falling',
            title: 'Falling Intonation',
            description: 'Practice the downward pitch slide used in statements.',
            icon: <TrendingDown size={24} className="text-rose-400" />,
            component: <IntonationTrainingModule patternType="falling" />
        },
        {
            id: 'intonation-hill',
            title: 'Hill Pattern',
            description: 'Practice the rise-and-fall pattern used for emphasis.',
            icon: <Waves size={24} className="text-blue-400" />,
            component: <IntonationTrainingModule patternType="hill" />
        }
    ];

    return (
        <div className="w-full min-h-screen bg-slate-950 p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 pt-12">
                {activeModule ? (
                    <button
                        onClick={() => setActiveModule(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} /> Back to Modules
                    </button>
                ) : (
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-teal-500/20 rounded-xl">
                            <Dumbbell size={32} className="text-teal-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Training Gym</h1>
                            <p className="text-slate-400">Targeted biofeedback exercises to build muscle memory.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
                {activeModule ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeModule.component}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map(module => (
                            <button
                                key={module.id}
                                onClick={() => setActiveModule(module)}
                                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left hover:border-teal-500/50 hover:bg-slate-800 transition-all group"
                            >
                                <div className="mb-4 p-3 bg-slate-950 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                    {module.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {module.description}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingView;

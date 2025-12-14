import { useMemo } from 'react';
import { Play, Sparkles, Target, Calendar } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';

const SmartCoachWidget = ({ onStartSession }) => {
    const { activeProfile: activeProfileId, voiceProfiles, goals } = useProfile();
    const { user } = useAuth();
    const activeProfile = voiceProfiles?.find(p => p.id === activeProfileId);

    // Determine greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    // Determine daily focus based on goals or random
    const dailyFocus = useMemo(() => {
        if (goals && goals.length > 0) {
            // Pick a random goal from user's goals
            const goalMap = {
                'pitch': 'Pitch Stability',
                'resonance': 'Resonance Tuning',
                'breath': 'Breath Control',
                'intonation': 'Intonation Patterns'
            };
            const randomGoal = goals[Math.floor(Math.random() * goals.length)];
            return goalMap[randomGoal] || 'Vocal Consistency';
        }
        return 'Vocal Foundations';
    }, [goals]);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-2xl mb-8 text-white">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 !text-indigo-200 mb-2 font-medium">
                        <Sparkles size={18} className="text-yellow-300" />
                        <span>Smart Coach</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold !text-white mb-2">
                        {greeting}{user?.username ? `, ${user.username}` : ''}
                    </h2>
                    <p className="!text-indigo-100 text-lg max-w-xl">
                        Ready to level up? Your daily focus is <strong className="!text-white">{dailyFocus}</strong>.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={onStartSession}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white !text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                            <Play size={16} className="ml-1 !text-indigo-600" fill="currentColor" />
                        </div>
                        Start Guided Session
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-6 md:gap-12">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10">
                        <Target size={20} className="!text-indigo-200" />
                    </div>
                    <div>
                        <div className="text-xs !text-indigo-200 uppercase font-bold tracking-wider">Goal</div>
                        <div className="!text-white font-bold">15 mins</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10">
                        <Calendar size={20} className="!text-indigo-200" />
                    </div>
                    <div>
                        <div className="text-xs !text-indigo-200 uppercase font-bold tracking-wider">Streak</div>
                        <div className="!text-white font-bold">3 Days</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartCoachWidget;


import { useState } from 'react';

import { BookOpen, Trophy, Target, ArrowRight, Play, Star, Heart, Edit3, Music, Book, X } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useProgram } from '../../hooks/useProgram';
import { SelfCareService, SELF_CARE_PROMPTS } from '../../services/SelfCareService';
import SelfCareOnboarding from '../ui/SelfCareOnboarding';
import SoundJournal from '../ui/SoundJournal';
import AchievementsPanel from '../ui/AchievementsPanel';
import CustomCardEditor from '../ui/CustomCardEditor';

const CoachView = () => {

    const { navigate } = useNavigation();
    const { activeProgram, enroll, progress, programs } = useProgram();
    const [selfCarePlan, setSelfCarePlan] = useState(() => SelfCareService.getSelfCarePlan());
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showSoundJournal, setShowSoundJournal] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showCustomCards, setShowCustomCards] = useState(false);

    const handleOnboardingComplete = (plan) => {
        setSelfCarePlan(plan);
        setShowOnboarding(false);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Self-Care Onboarding Modal */}
            {showOnboarding && (
                <SelfCareOnboarding
                    onComplete={handleOnboardingComplete}
                    onSkip={() => setShowOnboarding(false)}
                />
            )}

            {showSoundJournal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl p-6 border border-slate-700">
                        <div className="flex justify-end mb-2">
                            <button onClick={() => setShowSoundJournal(false)} className="text-slate-400 hover:text-white">Close</button>
                        </div>
                        <SoundJournal onComplete={() => setShowSoundJournal(false)} />
                    </div>
                </div>
            )}

            {showAchievements && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl p-6 border border-slate-700">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setShowAchievements(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <AchievementsPanel />
                    </div>
                </div>
            )}

            {showCustomCards && (
                <CustomCardEditor onClose={() => setShowCustomCards(false)} />
            )}

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Voice Coach</h1>
                <p className="text-slate-400">Structured courses and personalized guidance.</p>
            </header>

            {/* Active Program Card */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="text-blue-400" /> Current Program
                </h2>

                {activeProgram ? (
                    <div className="bg-gradient-to-br from-blue-900/50 to-slate-900 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">In Progress</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{activeProgram.title}</h3>
                                    <p className="text-slate-400 max-w-xl">{activeProgram.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{Math.round((progress.completedTasks.length / 50) * 100)}%</div>
                                    <div className="text-xs text-slate-500 uppercase">Commplete</div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => navigate('program')}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                >
                                    <Play size={18} fill="currentColor" /> Continue Program
                                </button>
                                <button
                                    onClick={() => navigate('learn')}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <BookOpen size={18} /> Library
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Choose Your Path</h3>
                            <p className="text-slate-400 max-w-md mx-auto">Select a structured course to guide your voice transition journey.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {programs.map(program => (
                                <div key={program.id} className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all group flex flex-col">
                                    <div className="mb-4">
                                        <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                            {program.id.includes('singing') ? <Music className="text-blue-400" size={24} /> : <BookOpen className="text-pink-400" size={24} />}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                                        <p className="text-slate-400 text-sm mb-4">{program.description}</p>
                                    </div>
                                    <div className="mt-auto">
                                        <button
                                            onClick={() => enroll(program.id)}
                                            className="w-full py-3 bg-slate-700 hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            Start Course <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions / Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div onClick={() => navigate('assessment')} className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 cursor-pointer transition-all group">
                    <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Target className="text-purple-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">Assessment</h3>
                    <p className="text-sm text-slate-400">Check your baseline pitch and resonance.</p>
                </div>

                <div onClick={() => navigate('training')} className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 cursor-pointer transition-all group">
                    <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Trophy className="text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">Training Gym</h3>
                    <p className="text-sm text-slate-400">Practice specific skills with targeted exercises.</p>
                </div>

                <div onClick={() => setShowAchievements(true)} className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-amber-500/30 rounded-2xl p-6 cursor-pointer transition-all group">
                    <div className="p-3 bg-amber-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Star className="text-amber-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">Achievements</h3>
                    <p className="text-sm text-slate-400">Track your milestones and streaks.</p>
                </div>

                <div onClick={() => navigate('glossary')} className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 cursor-pointer transition-all group">
                    <div className="p-3 bg-cyan-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Book className="text-cyan-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">Glossary</h3>
                    <p className="text-sm text-slate-400">Definitions for all course terms.</p>
                </div>

                <div onClick={() => setShowCustomCards(true)} className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-pink-500/30 rounded-2xl p-6 cursor-pointer transition-all group">
                    <div className="p-3 bg-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Edit3 className="text-pink-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">My Practice Cards</h3>
                    <p className="text-sm text-slate-400">Create custom sentences to practice.</p>
                </div>
            </div>

            {/* Self-Care Plan Section */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Heart className="text-pink-400" /> Self-Care Plan
                </h2>

                {selfCarePlan && SelfCareService.hasCompletedPlan() ? (
                    <div className="bg-gradient-to-br from-pink-900/30 to-slate-900 border border-pink-500/20 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">Your Foundation</div>
                                <p className="text-slate-400 text-sm max-w-lg">
                                    You&apos;ve set up your self-care plan. These answers will remind you how to take care of yourself during challenging practice sessions.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowOnboarding(true)}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-pink-400 transition-colors"
                            >
                                <Edit3 size={14} /> Edit
                            </button>
                        </div>

                        <div className="grid gap-3">
                            {SELF_CARE_PROMPTS.slice(0, 3).map(prompt => (
                                <div key={prompt.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                        <span>{prompt.icon}</span>
                                        <span className="truncate">{prompt.question.substring(0, 50)}...</span>
                                    </div>
                                    <p className="text-sm text-white">
                                        {selfCarePlan[prompt.id] || <span className="text-slate-500 italic">Not set</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-pink-900/20 to-slate-900 border border-pink-500/20 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-pink-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Set Up Your Self-Care Plan</h3>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">
                            Voice work can be emotionally challenging. Create a personal self-care plan to prepare for tough moments before they happen.
                        </p>
                        <button
                            onClick={() => setShowOnboarding(true)}
                            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/20"
                        >
                            Create Self-Care Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Voice Exploration Section */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="text-purple-400" /> Voice Exploration
                </h2>
                <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Sound Journal</h3>
                            <p className="text-slate-400 text-sm max-w-lg mb-4">
                                Explore the full range of your voice by logging unique sounds, textures, and noises.
                                Great for expanding your comfort zone and overcoming vocal embarrassment.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">🐶 Dog Barks</span>
                                <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">🏎️ Car Revs</span>
                                <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">🌬️ Nature Sounds</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSoundJournal(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 flex-shrink-0"
                        >
                            <Music size={18} /> Open Journal
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CoachView;

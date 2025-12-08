
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Trophy, Target, ArrowRight, Play, Star } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useProgram } from '../../hooks/useProgram';

const CoachView = () => {
    const { t } = useTranslation();
    const { navigate } = useNavigation();
    const { activeProgram, enroll, progress } = useProgram();

    return (
        <div className="max-w-6xl mx-auto pb-20">
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
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Active Program</h3>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">Start a structured course to guide your voice transition journey day by day.</p>
                        <button
                            onClick={() => enroll('fem_basic')}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
                        >
                            Browse Courses
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Actions / Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

                <div className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-amber-500/30 rounded-2xl p-6 cursor-pointer transition-all group">
                    <div className="p-3 bg-amber-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Star className="text-amber-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">Achievements</h3>
                    <p className="text-sm text-slate-400">Track your milestones and streaks.</p>
                </div>
            </div>

        </div>
    );
};

export default CoachView;

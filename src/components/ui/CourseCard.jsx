import React from 'react';
import { PlayCircle, CheckCircle, Trophy } from 'lucide-react';
import { useProgram } from '../../hooks/useProgram';

const CourseCard = ({ onOpenCourse }) => {
    const { activeProgram, progress, currentDay } = useProgram();

    if (!activeProgram) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Start Your Journey</h3>
                    <p className="text-slate-400 text-sm mb-4">Enroll in a structured program to focus your training.</p>
                    <button
                        onClick={onOpenCourse}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all"
                    >
                        Browse Programs
                    </button>
                </div>
            </div>
        );
    }

    // Calculate rough progress percentage based on weeks
    const totalWeeks = activeProgram.weeks.length;
    const progressPercent = Math.round(((progress.currentWeek + (progress.currentDay / 7)) / totalWeeks) * 100);

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-pink-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-1">Current Program</h3>
                        <h2 className="text-xl font-bold text-white">
                            {activeProgram.title}
                        </h2>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{progressPercent}%</span>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-slate-400 text-xs mb-2">Week {progress.currentWeek + 1}, Day {progress.currentDay + 1}</p>
                    <h4 className="text-lg font-bold text-white mb-1">{currentDay?.title || "Rest Day"}</h4>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <PlayCircle className="w-3 h-3" />
                        <span>{currentDay?.tasks.length || 0} Tasks</span>
                    </div>
                </div>

                <button
                    onClick={onOpenCourse}
                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                    <PlayCircle className="w-4 h-4" /> Continue Program
                </button>

                {/* Progress Bar */}
                <div className="mt-6 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;

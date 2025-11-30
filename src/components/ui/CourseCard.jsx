import React from 'react';
import { PlayCircle, CheckCircle, Trophy } from 'lucide-react';
import { useCourseProgress } from '../../hooks/useCourseProgress';

const CourseCard = ({ onOpenCourse }) => {
    const { getNextLesson, getProgressPercentage } = useCourseProgress();
    const nextLesson = getNextLesson();
    const progress = getProgressPercentage();

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-pink-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-1">Your Journey</h3>
                        <h2 className="text-xl font-bold text-white">
                            {nextLesson ? 'Next Lesson' : 'Course Complete!'}
                        </h2>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{progress}%</span>
                    </div>
                </div>

                {nextLesson ? (
                    <>
                        <div className="mb-6">
                            <p className="text-slate-400 text-xs mb-2">{nextLesson.moduleTitle}</p>
                            <h4 className="text-lg font-bold text-white mb-1">{nextLesson.title}</h4>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <PlayCircle className="w-3 h-3" />
                                <span>{nextLesson.duration}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                <span>{nextLesson.type === 'interactive' ? 'Interactive' : 'Theory'}</span>
                            </div>
                        </div>

                        <button
                            onClick={onOpenCourse}
                            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                        >
                            <PlayCircle className="w-4 h-4" /> Continue Learning
                        </button>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <p className="text-slate-300 mb-4">You've completed all available lessons!</p>
                        <button
                            onClick={onOpenCourse}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-all"
                        >
                            Review Course
                        </button>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mt-6 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;

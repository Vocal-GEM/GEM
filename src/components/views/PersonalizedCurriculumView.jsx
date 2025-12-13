import React, { useState, useEffect } from 'react';
import { Calendar, Target, Zap, ChevronRight, RefreshCw, Brain } from 'lucide-react';
import { generateWeeklyCurriculum, getTodayRecommendation } from '../../services/AICoachService';
import { useNavigation } from '../../context/NavigationContext';

const PersonalizedCurriculumView = () => {
    const [curriculum, setCurriculum] = useState(null);
    const [todayRec, setTodayRec] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);
    const { navigate } = useNavigation();

    useEffect(() => {
        loadCurriculum();
    }, []);

    const loadCurriculum = () => {
        setCurriculum(generateWeeklyCurriculum());
        setTodayRec(getTodayRecommendation());

        // Set selected day based on current day
        const today = new Date().getDay();
        setSelectedDay(today === 0 ? 6 : today - 1); // Convert Sunday=0 to Monday=0
    };

    if (!curriculum) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    const currentDay = curriculum.days[selectedDay];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Your Training Plan</h1>
                    <p className="text-slate-400">AI-generated weekly curriculum based on your progress</p>
                </div>
                <button
                    onClick={loadCurriculum}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Today's Recommendation */}
            {todayRec && (
                <div
                    className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-2xl p-6 mb-8 cursor-pointer hover:border-blue-400/50 transition-all"
                    onClick={() => navigate('training')}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Brain className="text-blue-400" size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-blue-400 uppercase font-bold mb-1">AI Recommendation for Today</div>
                            <h3 className="text-xl font-bold text-white mb-1">{todayRec.title}</h3>
                            <p className="text-slate-400">{todayRec.message}</p>
                        </div>
                        <ChevronRight className="text-blue-400" size={24} />
                    </div>
                </div>
            )}

            {/* Day Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {curriculum.days.map((day, idx) => {
                    const isToday = idx === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                    return (
                        <button
                            key={idx}
                            onClick={() => setSelectedDay(idx)}
                            className={`px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${selectedDay === idx
                                    ? 'bg-blue-600 text-white'
                                    : isToday
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            {day.day.slice(0, 3)}
                            {isToday && <span className="ml-1 text-xs">(Today)</span>}
                        </button>
                    );
                })}
            </div>

            {/* Selected Day Plan */}
            {currentDay && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">{currentDay.day}</h2>
                            <p className="text-slate-400">{currentDay.focus}</p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Target size={18} />
                            <span className="font-bold">{currentDay.targetMinutes} min</span>
                        </div>
                    </div>

                    {/* Exercises */}
                    <div className="space-y-3">
                        {currentDay.exercises.length > 0 ? (
                            currentDay.exercises.map((exercise, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors cursor-pointer"
                                    onClick={() => navigate('training')}
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white">{exercise.title}</h3>
                                        <p className="text-sm text-slate-400">~{exercise.duration} minutes</p>
                                    </div>
                                    <ChevronRight className="text-slate-500" size={18} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Rest day - light practice only</p>
                            </div>
                        )}
                    </div>

                    {/* Start Practice Button */}
                    <button
                        onClick={() => navigate('training')}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        <Zap size={20} />
                        Start Today's Practice
                    </button>
                </div>
            )}

            {/* Week Overview */}
            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Week Overview</h3>
                <div className="grid grid-cols-7 gap-2">
                    {curriculum.days.map((day, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg text-center transition-all cursor-pointer ${selectedDay === idx
                                    ? 'bg-blue-600'
                                    : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                            onClick={() => setSelectedDay(idx)}
                        >
                            <div className="text-xs text-slate-400">{day.day.slice(0, 2)}</div>
                            <div className="text-sm font-bold text-white mt-1">{day.targetMinutes}m</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PersonalizedCurriculumView;

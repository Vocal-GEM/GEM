import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const WeeklyDigest = ({ data }) => {
    const {
        totalPracticeTime = 0,
        averagePitch = 0,
        pitchStability = 0,
        dailyActivity = [],
        streak = 0
    } = data || {};

    const trend = useMemo(() => {
        // Mock trend calculation
        if (totalPracticeTime > 60) return 'up';
        if (totalPracticeTime < 30) return 'down';
        return 'neutral';
    }, [totalPracticeTime]);

    return (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Weekly Digest</h3>
                    <p className="text-sm text-slate-400">Your voice journey this week</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                    trend === 'down' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-500/20 text-slate-400'
                }`}>
                    {trend === 'up' && <TrendingUp size={14} />}
                    {trend === 'down' && <TrendingDown size={14} />}
                    {trend === 'neutral' && <Minus size={14} />}
                    {trend === 'up' ? 'Great Progress' : trend === 'down' ? 'Needs Focus' : 'Steady'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">Practice Time</div>
                    <div className="text-xl font-bold text-white">{Math.round(totalPracticeTime)}m</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">Current Streak</div>
                    <div className="text-xl font-bold text-white flex items-center gap-1">
                        {streak} <span className="text-sm font-normal text-slate-500">days</span>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">Avg Pitch</div>
                    <div className="text-xl font-bold text-white">{Math.round(averagePitch)} Hz</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">Stability</div>
                    <div className="text-xl font-bold text-white">{Math.round(pitchStability * 100)}%</div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activity</div>
                <div className="flex justify-between items-end h-16 gap-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                        const active = dailyActivity[i] || 0;
                        const height = Math.min(100, active * 20) + '%';
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-1 group">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height }}
                                    className={`w-full rounded-t-sm transition-colors ${
                                        active > 0 ? 'bg-purple-500 group-hover:bg-purple-400' : 'bg-slate-800'
                                    }`}
                                />
                                <div className="text-[10px] text-center text-slate-600">{day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors border-t border-slate-700/50">
                View Full Report <ArrowRight size={14} />
            </button>
        </div>
    );
};

export default WeeklyDigest;

// React removed
import { Info } from 'lucide-react';

const MetricCard = ({ label, value, unit, status = 'neutral', description, details }) => {
    const statusColors = {
        good: 'bg-green-500/10 border-green-500/50 text-green-400',
        warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
        bad: 'bg-red-500/10 border-red-500/50 text-red-400',
        neutral: 'bg-slate-800/50 border-slate-700 text-slate-300'
    };

    const statusDots = {
        good: 'bg-green-500',
        warning: 'bg-yellow-500',
        bad: 'bg-red-500',
        neutral: 'bg-slate-500'
    };

    return (
        <div className={`rounded-xl p-4 border transition-colors ${statusColors[status]}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusDots[status]}`}></div>
                    <h4 className="text-sm font-medium text-slate-400">{label}</h4>
                </div>
                {description && (
                    <div className="group relative">
                        <Info className="w-4 h-4 text-slate-500 cursor-help" />
                        <div className="absolute right-0 top-6 w-64 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <p className="text-xs text-slate-300">{description}</p>
                            {details && (
                                <p className="text-xs text-slate-500 mt-2">{details}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
                {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>
        </div>
    );
};

export default MetricCard;

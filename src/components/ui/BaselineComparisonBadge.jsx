import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * BaselineComparisonBadge
 * Displays the difference between current and baseline values with visual indicators.
 * 
 * @param {number} current - Current value
 * @param {number} baseline - Baseline value
 * @param {string} unit - Unit label (e.g., "Hz", "dB")
 * @param {string} label - Optional label for the metric
 * @param {boolean} higherIsBetter - If true, positive delta is green; if false, negative is green
 * @param {boolean} compact - If true, shows minimal UI
 */
const BaselineComparisonBadge = ({
    current,
    baseline,
    unit = '',
    label = '',
    higherIsBetter = true,
    compact = false
}) => {
    if (baseline === null || baseline === undefined || current === null || current === undefined) {
        return null;
    }

    const delta = current - baseline;
    const percentChange = baseline !== 0 ? (delta / baseline) * 100 : 0;
    const isPositive = delta > 0;
    const isNeutral = Math.abs(delta) < 0.5;

    // Determine color based on direction preference
    const getColor = () => {
        if (isNeutral) return 'text-slate-400';
        if (higherIsBetter) {
            return isPositive ? 'text-emerald-400' : 'text-rose-400';
        } else {
            return isPositive ? 'text-rose-400' : 'text-emerald-400';
        }
    };

    const getBgColor = () => {
        if (isNeutral) return 'bg-slate-500/10';
        if (higherIsBetter) {
            return isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10';
        } else {
            return isPositive ? 'bg-rose-500/10' : 'bg-emerald-500/10';
        }
    };

    const Icon = isNeutral ? Minus : (isPositive ? TrendingUp : TrendingDown);

    const formatDelta = (value) => {
        const absValue = Math.abs(value);
        if (absValue >= 100) return Math.round(absValue);
        if (absValue >= 10) return absValue.toFixed(1);
        return absValue.toFixed(2);
    };

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-0.5 text-xs ${getColor()}`}>
                <Icon size={10} />
                <span>{isPositive ? '+' : ''}{formatDelta(delta)}{unit}</span>
            </span>
        );
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${getBgColor()}`}>
            <Icon size={14} className={getColor()} />
            <span className={`text-xs font-medium ${getColor()}`}>
                {isPositive ? '+' : ''}{formatDelta(delta)} {unit}
            </span>
            {label && (
                <span className="text-xs text-slate-500">
                    vs baseline
                </span>
            )}
            {Math.abs(percentChange) >= 1 && (
                <span className={`text-xs ${getColor()} opacity-70`}>
                    ({isPositive ? '+' : ''}{percentChange.toFixed(1)}%)
                </span>
            )}
        </div>
    );
};

/**
 * BaselineRangeIndicator
 * Shows a visual indicator of where current value falls relative to baseline range
 */
export const BaselineRangeIndicator = ({
    current,
    baselineMin,
    baselineMax,
    baselineMean,
    label = 'Pitch'
}) => {
    if (!baselineMin || !baselineMax || !current) return null;

    const range = baselineMax - baselineMin;
    const isAbove = current > baselineMax;
    const isBelow = current < baselineMin;
    const isInRange = !isAbove && !isBelow;

    // Calculate position percentage (clamped to visible range with padding)
    const paddedMin = baselineMin - range * 0.2;
    const paddedMax = baselineMax + range * 0.2;
    const paddedRange = paddedMax - paddedMin;
    const position = Math.max(0, Math.min(100, ((current - paddedMin) / paddedRange) * 100));

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{label}</span>
                <span className={isInRange ? 'text-emerald-400' : 'text-amber-400'}>
                    {Math.round(current)} Hz
                </span>
            </div>
            <div className="relative h-2 bg-slate-700 rounded-full overflow-visible">
                {/* Baseline range */}
                <div 
                    className="absolute h-full bg-purple-500/30 rounded-full"
                    style={{
                        left: `${((baselineMin - paddedMin) / paddedRange) * 100}%`,
                        width: `${(range / paddedRange) * 100}%`
                    }}
                />
                {/* Baseline mean marker */}
                <div 
                    className="absolute w-0.5 h-3 bg-purple-400 -top-0.5 rounded-full"
                    style={{
                        left: `${((baselineMean - paddedMin) / paddedRange) * 100}%`
                    }}
                />
                {/* Current value marker */}
                <div 
                    className={`absolute w-2 h-2 rounded-full top-0 -translate-x-1 ${
                        isInRange ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{
                        left: `${position}%`
                    }}
                />
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                <span>{Math.round(baselineMin)}</span>
                <span className="text-purple-400/70">baseline</span>
                <span>{Math.round(baselineMax)}</span>
            </div>
        </div>
    );
};

export default BaselineComparisonBadge;

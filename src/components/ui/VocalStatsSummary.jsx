import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, X, BarChart3, Volume2, Music, Target } from 'lucide-react';

/**
 * VocalStatsSummary - Displays min/max/avg/range for pitch & volume after a session
 * Inspired by Voice Analyst's detailed metrics display
 */
const VocalStatsSummary = ({ sessionData, onClose, previousSession }) => {
    if (!sessionData) return null;

    const {
        pitchMin,
        pitchMax,
        pitchAvg,
        volumeMin,
        volumeMax,
        volumeAvg,
        duration,
        sampleCount
    } = sessionData;

    const pitchRange = pitchMax - pitchMin;
    const volumeRange = volumeMax - volumeMin;

    // Compare with previous session
    const getPitchTrend = () => {
        if (!previousSession?.pitchAvg) return null;
        const diff = pitchAvg - previousSession.pitchAvg;
        if (Math.abs(diff) < 5) return { direction: 'stable', value: diff };
        return { direction: diff > 0 ? 'up' : 'down', value: diff };
    };

    const pitchTrend = getPitchTrend();

    // Gender range classification
    const getGenderRange = (pitch) => {
        if (pitch >= 180) return { label: 'Feminine', color: 'text-pink-400', bg: 'bg-pink-500/20' };
        if (pitch >= 135) return { label: 'Androgynous', color: 'text-purple-400', bg: 'bg-purple-500/20' };
        return { label: 'Masculine', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    };

    const genderRange = getGenderRange(pitchAvg);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const StatCard = ({ icon: Icon, label, value, unit, subValue, color = 'text-white' }) => (
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                <span className="text-sm text-slate-500">{unit}</span>
            </div>
            {subValue && (
                <div className="text-xs text-slate-500 mt-1">{subValue}</div>
            )}
        </div>
    );

    const RangeBar = ({ min, max, avg, label, unit, minLabel = 'Min', maxLabel = 'Max' }) => {
        const range = max - min;
        const avgPosition = range > 0 ? ((avg - min) / range) * 100 : 50;

        return (
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>{minLabel}: {min.toFixed(0)} {unit}</span>
                    <span className="font-bold text-white">Avg: {avg.toFixed(1)} {unit}</span>
                    <span>{maxLabel}: {max.toFixed(0)} {unit}</span>
                </div>
                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"
                        style={{ width: '100%' }}
                    />
                    <div
                        className="absolute top-0 w-1 h-full bg-white shadow-lg"
                        style={{ left: `${avgPosition}%`, transform: 'translateX(-50%)' }}
                    />
                </div>
                <div className="text-center text-xs text-slate-500">
                    Range: {range.toFixed(0)} {unit}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                            <BarChart3 className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Session Summary</h2>
                            <p className="text-xs text-slate-400">
                                {formatDuration(duration)} • {sampleCount} samples
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Gender Range Badge */}
                <div className="px-4 pt-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${genderRange.bg}`}>
                        <Target className={`w-4 h-4 ${genderRange.color}`} />
                        <span className={`text-sm font-bold ${genderRange.color}`}>
                            {genderRange.label} Range
                        </span>
                        {pitchTrend && (
                            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-600">
                                {pitchTrend.direction === 'up' && (
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                )}
                                {pitchTrend.direction === 'down' && (
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                )}
                                {pitchTrend.direction === 'stable' && (
                                    <Minus className="w-4 h-4 text-slate-400" />
                                )}
                                <span className={`text-xs ${pitchTrend.direction === 'up' ? 'text-green-400' :
                                    pitchTrend.direction === 'down' ? 'text-red-400' : 'text-slate-400'
                                    }`}>
                                    {pitchTrend.value > 0 ? '+' : ''}{pitchTrend.value.toFixed(0)} Hz
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-4 grid grid-cols-2 gap-3">
                    <StatCard
                        icon={Music}
                        label="Avg Pitch"
                        value={pitchAvg.toFixed(0)}
                        unit="Hz"
                        color="text-pink-400"
                    />
                    <StatCard
                        icon={Volume2}
                        label="Avg Volume"
                        value={volumeAvg.toFixed(0)}
                        unit="dB"
                        color="text-purple-400"
                    />
                </div>

                {/* Pitch Range */}
                <div className="px-4 pb-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 space-y-4">
                        <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-bold text-white">Pitch Range</span>
                        </div>
                        <RangeBar
                            min={pitchMin}
                            max={pitchMax}
                            avg={pitchAvg}
                            label="Pitch"
                            unit="Hz"
                        />
                    </div>
                </div>

                {/* Volume Range */}
                <div className="px-4 pb-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 space-y-4">
                        <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold text-white">Volume Range</span>
                        </div>
                        <RangeBar
                            min={volumeMin}
                            max={volumeMax}
                            avg={volumeAvg}
                            label="Volume"
                            unit="dB"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VocalStatsSummary;

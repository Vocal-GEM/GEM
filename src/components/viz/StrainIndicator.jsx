import React from 'react';
import { AlertTriangle, CheckCircle, Wind } from 'lucide-react';

/**
 * StrainIndicator Component
 * Displays a visual warning when the user's voice shows signs of strain (pressed phonation)
 * or excessive breathiness.
 * 
 * @param {number} tilt - Spectral tilt value from AudioEngine (-24 to 0 dB/octave typical)
 * @param {boolean} isSilent - Whether the audio is currently silent
 */
const StrainIndicator = ({ tilt = -12, isSilent = false }) => {
    // Determine strain level based on tilt
    // Typical ranges:
    // < -18 dB/octave: Very Breathy (high frequency energy loss)
    // -18 to -8 dB/octave: Healthy/Normal
    // > -8 dB/octave: Pressed/Strained (too much high frequency energy)

    let status = 'healthy';
    let icon = CheckCircle;
    let color = 'emerald';
    let label = 'Healthy';
    let tip = 'Your voice sounds clear and relaxed.';

    if (isSilent) {
        return null; // Don't show anything during silence
    }

    if (tilt > -6) {
        status = 'pressed';
        icon = AlertTriangle;
        color = 'red';
        label = 'Pressed';
        tip = 'Try relaxing your throat. You may be straining.';
    } else if (tilt > -8) {
        status = 'slight-strain';
        icon = AlertTriangle;
        color = 'amber';
        label = 'Slight Strain';
        tip = 'Ease up a bit. Light tension detected.';
    } else if (tilt < -20) {
        status = 'breathy';
        icon = Wind;
        color = 'cyan';
        label = 'Breathy';
        tip = 'A bit of air escape. Close your folds slightly more.';
    }

    const IconComponent = icon;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${status === 'healthy'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : status === 'pressed' || status === 'slight-strain'
                    ? `bg-${color}-500/10 border-${color}-500/30`
                    : 'bg-cyan-500/10 border-cyan-500/30'
            }`}>
            <div className={`p-2 rounded-lg ${status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                    status === 'pressed' ? 'bg-red-500/20 text-red-400' :
                        status === 'slight-strain' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-cyan-500/20 text-cyan-400'
                }`}>
                <IconComponent size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${status === 'healthy' ? 'text-emerald-300' :
                            status === 'pressed' ? 'text-red-300' :
                                status === 'slight-strain' ? 'text-amber-300' :
                                    'text-cyan-300'
                        }`}>{label}</span>
                    <span className="text-xs text-slate-500">({tilt.toFixed(1)} dB/oct)</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{tip}</p>
            </div>
        </div>
    );
};

export default StrainIndicator;

import { useEffect, useRef, useState } from 'react';
import { Activity, Info, Mic, MicOff, Wind, Heart, Sun, Layers, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { QuadCoreAnalysisService } from '../../services/QuadCoreAnalysisService';

const QuadCoreCard = ({ icon: Icon, title, score, label, value, color, unit }) => (
    <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 relative overflow-hidden group hover:bg-slate-800/80 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Icon size={12} className={color} />
            {title}
        </div>
        <div className="flex items-end gap-2">
            <div className={`text-2xl font-mono font-bold ${color}`}>
                {label}
            </div>
            {value !== undefined && (
                <div className="text-xs text-slate-500 font-mono mb-1">
                    {typeof value === 'number' ? value.toFixed(1) : value}{unit}
                </div>
            )}
        </div>

        {/* Progress/State Bar */}
        <div className="mt-3 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            {typeof score === 'number' ? (
                // Linear Progress (0-100 or 0-2)
                <div
                    className={`h-full rounded-full transition-all duration-300 ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(100, (score > 2 ? score : score * 50))}%` }}
                />
            ) : (
                // State Indicator
                <div className={`h-full w-full rounded-full ${score === 'Flow' ? 'bg-emerald-500' :
                    score === 'Pressed' ? 'bg-red-500' :
                        'bg-blue-400'
                    }`} />
            )}
        </div>
    </div>
);

const FeedbackBanner = ({ feedback }) => {
    if (!feedback || feedback.type === 'neutral') return (
        <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 flex items-center gap-3 text-slate-400 text-xs text-center justify-center">
            <Activity size={14} className="animate-pulse" />
            Listening... Speak to get analysis
        </div>
    );

    const colors = {
        success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300',
        warning: 'bg-amber-500/10 border-amber-500/50 text-amber-300',
        info: 'bg-blue-500/10 border-blue-500/50 text-blue-300'
    };

    const Icons = {
        success: CheckCircle,
        warning: AlertTriangle,
        info: HelpCircle
    };

    const Icon = Icons[feedback.type] || Info;

    return (
        <div className={`mt-4 p-4 rounded-xl border flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 ${colors[feedback.type]}`}>
            <div className="mt-0.5"><Icon size={18} /></div>
            <div>
                {feedback.title && <div className="font-bold text-sm mb-1">{feedback.title}</div>}
                <div className="text-xs leading-relaxed opacity-90">{feedback.message}</div>
            </div>
        </div>
    );
};

const VoiceQualityAnalysis = ({ dataRef, colorBlindMode, toggleAudio, isAudioActive }) => {
    const { targetRange } = useProfile();
    const serviceRef = useRef(new QuadCoreAnalysisService());
    const [analysis, setAnalysis] = useState(null);
    const frameRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (dataRef.current && isAudioActive) {
                const results = serviceRef.current.analyze(dataRef.current, {
                    targetF2: 2000 // Default to neutral/chem until calibration is fuller
                    // TODO: pull from calibration context if available
                });

                if (results) {
                    setAnalysis(results);
                }
            }
            frameRef.current = requestAnimationFrame(loop);
        };

        if (isAudioActive) loop();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isAudioActive, dataRef]);

    return (
        <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-6 border border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <Activity size={14} className="text-purple-400" />
                    Quad-Core Analyzer
                </div>
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full ${isAudioActive ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {/* Module A: Texture */}
                <QuadCoreCard
                    icon={Wind}
                    title="Texture"
                    color={colorBlindMode ? 'text-blue-400' : 'text-cyan-400'}
                    score={analysis?.scores.texture.score || 0}
                    label={analysis?.scores.texture.label || '--'}
                    value={analysis?.scores.texture.value}
                    unit="dB"
                />

                {/* Module B: Health */}
                <QuadCoreCard
                    icon={Heart}
                    title="Health" // Flow
                    color={colorBlindMode ? 'text-teal-400' : 'text-emerald-400'}
                    score={analysis?.scores.health.status || 'Flow'}
                    label={analysis?.scores.health.label || '--'}
                    value={analysis?.scores.health.value}
                    unit=" tilt"
                />

                {/* Module C: Color */}
                <QuadCoreCard
                    icon={Sun}
                    title="Color" // Resonance
                    color={colorBlindMode ? 'text-yellow-400' : 'text-amber-400'}
                    score={analysis?.scores.color.percentage || 0}
                    label={analysis?.scores.color.label || '--'}
                    value={analysis?.scores.color.value}
                    unit="Hz"
                />

                {/* Module D: Mix */}
                <QuadCoreCard
                    icon={Layers}
                    title="Registration" // Mix
                    color={colorBlindMode ? 'text-purple-400' : 'text-fuchsia-400'}
                    score={analysis?.scores.mix.percentage || 0}
                    label={analysis?.scores.mix.label || '--'}
                    value={analysis?.scores.mix.value}
                    unit=" ratio"
                />
            </div>

            {/* Feedback Section */}
            <FeedbackBanner feedback={analysis?.feedback} />

            {/* Controls */}
            <button
                onClick={toggleAudio}
                className={`w-full mt-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${isAudioActive
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/20'
                    }`}
            >
                {isAudioActive ? <><MicOff size={16} /> Stop Analysis</> : <><Mic size={16} /> Start Analysis</>}
            </button>
        </div>
    );
};

export default VoiceQualityAnalysis;

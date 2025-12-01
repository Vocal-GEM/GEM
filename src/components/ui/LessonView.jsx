import React from 'react';
import { ArrowLeft, CheckCircle, ChevronRight, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Tools
import PitchVisualizer from '../viz/PitchVisualizer';
import ResonanceOrb from '../viz/ResonanceOrb';
import VoiceQualityMeter from '../viz/VoiceQualityMeter';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import ArticulationView from '../views/ArticulationView';
import ContourVisualizer from '../viz/ContourVisualizer';
import QualityVisualizer from '../viz/QualityVisualizer';
import HighResSpectrogram from '../viz/HighResSpectrogram';
import VocalFoldsView from '../views/VocalFoldsView';
import ComparisonTool from './ComparisonTool';
import ForwardFocusDrill from './ForwardFocusDrill';
import BreathPacer from './BreathPacer';
import TwisterCard from './TwisterCard';
import TargetVoicePlayer from './TargetVoicePlayer';
import IntonationTrainer from '../viz/IntonationTrainer';

import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';

const LessonView = ({ lesson, onComplete, onNext, onPrevious, hasNext, hasPrevious }) => {
    const { dataRef, audioEngineRef } = useAudio();
    const { targetRange, calibration, activeProfile } = useProfile();
    const { settings } = useSettings();
    const [isLowConfidence, setIsLowConfidence] = React.useState(false);

    // Monitor confidence
    React.useEffect(() => {
        if (lesson.type !== 'interactive') return;

        const checkConfidence = () => {
            if (dataRef.current) {
                const { clarity, isSilent } = dataRef.current;
                // If speaking (not silent) and clarity is low (< 0.5)
                if (!isSilent && clarity !== undefined && clarity < 0.5) {
                    setIsLowConfidence(true);
                } else {
                    setIsLowConfidence(false);
                }
            }
        };

        const interval = setInterval(checkConfidence, 500); // Check every 500ms
        return () => clearInterval(interval);
    }, [lesson.type, dataRef]);

    const renderTool = () => {
        switch (lesson.toolId) {
            case 'pitch-visualizer':
                return (
                    <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                        <PitchVisualizer
                            dataRef={dataRef}
                            targetRange={targetRange}
                            userMode="user"
                            settings={settings}
                        />
                    </div>
                );
            case 'resonance-orb':
                return (
                    <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                        <ResonanceOrb
                            dataRef={dataRef}
                            calibration={calibration}
                            showDebug={true}
                        />
                    </div>
                );
            case 'voice-quality':
                return (
                    <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-4">
                        <VoiceQualityMeter
                            dataRef={dataRef}
                            userMode="user"
                        />
                    </div>
                );
            case 'vowel-plot':
                return (
                    <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/10 p-4">
                        <VowelSpacePlot
                            dataRef={dataRef}
                            userMode="user"
                        />
                    </div>
                );
            case 'articulation-view':
                return (
                    <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative p-4">
                        <ArticulationView />
                    </div>
                );
            case 'contour-visualizer':
                return (
                    <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                        <ContourVisualizer dataRef={dataRef} />
                    </div>
                );
            case 'intonation-exercise':
                return (
                    <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                        <IntonationTrainer dataRef={dataRef} />
                    </div>
                );
            case 'spectrogram':
                return (
                    <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                        <HighResSpectrogram dataRef={dataRef} />
                    </div>
                );
            case 'quality-visualizer':
                return (
                    <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                        <QualityVisualizer dataRef={dataRef} />
                    </div>
                );
            case 'vocal-folds':
                return (
                    <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                        <VocalFoldsView onClose={() => { }} />
                    </div>
                );
            case 'breath-pacer':
                return (
                    <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-4">
                        <BreathPacer />
                    </div>
                );
            case 'comparison-tool':
                return (
                    <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-4">
                        <ComparisonTool />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Lesson Header */}
            <div className="mb-6">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 block">
                    {lesson.type === 'interactive' ? 'Interactive Lesson' : 'Theory Lesson'}
                </span>
                <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <PlayCircle className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                {/* Markdown Content */}
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white max-w-none">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>

                {/* Interactive Tool Area */}
                {lesson.type === 'interactive' && (
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Microphone Input</span>
                            </div>
                            {isLowConfidence && (
                                <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Low Signal Confidence</span>
                                </div>
                            )}
                        </div>

                        {/* Target Phrase Player */}
                        {lesson.targetPhrase && (
                            <TargetVoicePlayer text={lesson.targetPhrase} gender={activeProfile} />
                        )}

                        {renderTool()}
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                <button
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors font-bold text-sm flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                <button
                    onClick={() => {
                        onComplete();
                        if (hasNext) onNext();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all flex items-center gap-2"
                >
                    {hasNext ? (
                        <>Complete & Next <ChevronRight className="w-4 h-4" /></>
                    ) : (
                        <>Finish Module <CheckCircle className="w-4 h-4" /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default LessonView;

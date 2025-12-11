import { useState, useEffect, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, Clock, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import LoadingSpinner from './LoadingSpinner';

// Lazy load visualization components
const PitchVisualizer = lazy(() => import('../viz/PitchVisualizer'));
const ResonanceOrb = lazy(() => import('../viz/ResonanceOrb'));
const VoiceQualityMeter = lazy(() => import('../viz/VoiceQualityMeter'));
const VowelSpacePlot = lazy(() => import('../viz/VowelSpacePlot'));
const ContourVisualizer = lazy(() => import('../viz/ContourVisualizer'));
const SelfCareOnboarding = lazy(() => import('./SelfCareOnboarding'));
const VoiceAudit = lazy(() => import('./VoiceAudit'));
const SoundJournal = lazy(() => import('./SoundJournal'));
const InspirationBoard = lazy(() => import('./InspirationBoard'));
const TranscriptionPractice = lazy(() => import('./TranscriptionPractice'));
const NameVisualizer = lazy(() => import('./NameVisualizer'));
const ModuleWrapUp = lazy(() => import('./ModuleWrapUp'));
const WarmUpRoutine = lazy(() => import('./WarmupRoutine'));
const QuickWarmUp = lazy(() => import('./QuickWarmUp'));
const FollowAlongWarmup = lazy(() => import('./FollowAlongWarmup'));
const VocalAnatomyLesson = lazy(() => import('./VocalAnatomyLesson'));
const VoiceAlterationLesson = lazy(() => import('./VoiceAlterationLesson'));
const BigPictureAssessment = lazy(() => import('./BigPictureAssessment'));
const Module2WrapUp = lazy(() => import('./Module2WrapUp'));
const LarynxControl = lazy(() => import('./LarynxControl'));
const ResonanceApplication = lazy(() => import('./ResonanceApplication'));
const MWordChallenge = lazy(() => import('./MWordChallenge'));
const DailyPhrases = lazy(() => import('./DailyPhrases'));
const Module3WrapUp = lazy(() => import('./Module3WrapUp'));
const PianoLesson = lazy(() => import('./PianoLesson'));
const PitchExploration = lazy(() => import('./PitchExploration'));
const PitchExercises = lazy(() => import('./PitchExercises'));
const PitchMemorizer = lazy(() => import('./PitchMemorizer'));
const Module4WrapUp = lazy(() => import('./Module4WrapUp'));
const VocalWeightTheory = lazy(() => import('./VocalWeightTheory'));
const WeightToolbox = lazy(() => import('./WeightToolbox'));
const TwangTechnique = lazy(() => import('./TwangTechnique'));
const Module5WrapUp = lazy(() => import('./Module5WrapUp'));
const InflectionLesson = lazy(() => import('./InflectionLesson'));
const InflectionExercises = lazy(() => import('./InflectionExercises'));
const HabitBuilder = lazy(() => import('./HabitBuilder'));
const CognitiveLoadGames = lazy(() => import('./CognitiveLoadGames'));
const Module6WrapUp = lazy(() => import('./Module6WrapUp'));
const BaselineRecorder = lazy(() => import('./BaselineRecorder'));
const PracticePhilosophy = lazy(() => import('./PracticePhilosophy'));
const BreathSupport = lazy(() => import('./BreathSupport'));
const StudentSelfEvaluation = lazy(() => import('./StudentSelfEvaluation'));
const VocalHygiene = lazy(() => import('./VocalHygiene'));
const RelaxationRoutine = lazy(() => import('./RelaxationRoutine'));
const TonalConsistency = lazy(() => import('./TonalConsistency'));
const VowelGlides = lazy(() => import('./VowelGlides'));
const ResonanceBreathBalance = lazy(() => import('./ResonanceBreathBalance'));
const ReadingPractice = lazy(() => import('./ReadingPractice'));
const TwangDojo = lazy(() => import('./TwangDojo'));
const RegisterBlend = lazy(() => import('./RegisterBlend'));
const ProjectionPractice = lazy(() => import('./ProjectionPractice'));
const ProsodyTheory = lazy(() => import('./ProsodyTheory'));
const SyllableStacker = lazy(() => import('./SyllableStacker'));
const InflectionMap = lazy(() => import('./InflectionMap'));
const RecoveryStrategy = lazy(() => import('./RecoveryStrategy'));
const TexturePlay = lazy(() => import('./TexturePlay'));
const StyleMixer = lazy(() => import('./StyleMixer'));
const VoiceNeutrality = lazy(() => import('./VoiceNeutrality'));
const GraduationReflection = lazy(() => import('./GraduationReflection'));

/**
 * JourneyStep - Renders individual journey steps based on their type
 */
const JourneyStep = ({
    step,
    onComplete
}) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const { calibration, targetRange } = useProfile();
    const { settings } = useSettings();
    const [exerciseTimer, setExerciseTimer] = useState(0);
    const [isExerciseActive, setIsExerciseActive] = useState(false);
    const [showCoachTip, setShowCoachTip] = useState(true);

    // Timer for exercises
    useEffect(() => {
        let interval;
        if (isExerciseActive && step.exercise?.duration) {
            interval = setInterval(() => {
                setExerciseTimer(prev => {
                    if (prev >= step.exercise.duration) {
                        setIsExerciseActive(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isExerciseActive, step.exercise?.duration]);

    // Reset timer when step changes
    useEffect(() => {
        setExerciseTimer(0);
        setIsExerciseActive(false);
    }, [step.id]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Render the tool/visualizer based on step.tool
    const renderTool = () => {
        if (!step.tool) return null;

        // Ensure audio is active for interactive steps
        if (!isAudioActive) {
            return (
                <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <Play className="w-8 h-8 text-pink-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Microphone Required</h4>
                    <p className="text-slate-400 text-sm mb-4">
                        This exercise needs access to your microphone to provide real-time feedback.
                    </p>
                    <button
                        onClick={toggleAudio}
                        className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
                    >
                        Enable Microphone
                    </button>
                </div>
            );
        }

        const toolComponents = {
            'pitch-visualizer': (
                <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                    <PitchVisualizer
                        dataRef={dataRef}
                        targetRange={targetRange}
                        userMode="user"
                        settings={settings}
                    />
                </div>
            ),
            'resonance-orb': (
                <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                    <ResonanceOrb
                        dataRef={dataRef}
                        calibration={calibration}
                        showDebug={false}
                    />
                </div>
            ),
            'voice-quality': (
                <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-4">
                    <VoiceQualityMeter
                        dataRef={dataRef}
                        userMode="user"
                    />
                </div>
            ),
            'vowel-plot': (
                <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/10 p-4">
                    <VowelSpacePlot
                        dataRef={dataRef}
                        userMode="user"
                    />
                </div>
            ),
            'contour-visualizer': (
                <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative">
                    <ContourVisualizer dataRef={dataRef} />
                </div>
            )
        };

        return (
            <Suspense fallback={<LoadingSpinner />}>
                {toolComponents[step.tool] || null}
            </Suspense>
        );
    };

    // Render exercise instructions and timer
    const renderExercise = () => {
        if (!step.exercise) return null;

        return (
            <div className="bg-slate-800/50 rounded-xl border border-white/5 p-4 space-y-4">
                {/* Exercise goals */}
                {step.exercise.goals && (
                    <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goals</h5>
                        <ul className="space-y-2">
                            {step.exercise.goals.map((goal, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                                    {goal}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Practice timer */}
                {step.exercise.duration && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-400">
                                Practice time: <span className="font-mono text-white">{formatTime(exerciseTimer)}</span>
                                <span className="text-slate-500"> / {formatTime(step.exercise.duration)}</span>
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsExerciseActive(!isExerciseActive)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isExerciseActive
                                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    }`}
                            >
                                {isExerciseActive ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <button
                                onClick={() => { setExerciseTimer(0); setIsExerciseActive(false); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                            >
                                <RotateCcw size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render coach tip
    const renderCoachTip = () => {
        if (!step.coachTip || !showCoachTip) return null;

        return (
            <div className="relative bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20 p-4">
                <button
                    onClick={() => setShowCoachTip(false)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-xs"
                >
                    ×
                </button>
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                        <h5 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">Coach Tip</h5>
                        <p className="text-sm text-slate-300">{step.coachTip}</p>
                    </div>
                </div>
            </div>
        );
    };

    // Render based on step type
    const renderIntroStep = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Main content */}
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-pink-300 max-w-none">
                    <ReactMarkdown>{step.content}</ReactMarkdown>
                </div>

                {/* Special intro exercise (baseline recording prompt) */}
                {step.exercise?.type === 'baseline-recording' && (
                    <Suspense fallback={<LoadingSpinner />}>
                        <BaselineRecorder
                            instruction={step.exercise.instruction}
                            promptText={step.exercise.prompt}
                            onRecordingComplete={() => { }}
                        />
                    </Suspense>
                )}

                {renderCoachTip()}
            </div>
        </div>
    );

    const renderTheoryStep = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Main content with markdown */}
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-pink-300 prose-table:text-slate-300 max-w-none">
                    <ReactMarkdown>{step.content}</ReactMarkdown>
                </div>

                {renderCoachTip()}
            </div>
        </div>
    );

    const renderInteractiveStep = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Instruction content */}
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-pink-300 max-w-none prose-sm">
                    <ReactMarkdown>{step.content}</ReactMarkdown>
                </div>

                {/* Live indicator */}
                {isAudioActive && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full w-fit border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Microphone</span>
                    </div>
                )}

                {/* Tool/visualizer */}
                {renderTool()}

                {/* Exercise instructions */}
                {renderExercise()}

                {renderCoachTip()}
            </div>
        </div>
    );

    const renderExerciseStep = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Main content */}
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-pink-300 max-w-none">
                    <ReactMarkdown>{step.content}</ReactMarkdown>
                </div>

                {/* Practice phrases */}
                {step.exercise?.phrases && (
                    <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Phrases</h5>
                        {step.exercise.phrases.map((phrase, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-xl border border-white/5 p-4">
                                <span className="text-pink-400 font-bold mr-2">{i + 1}.</span>
                                <span className="text-slate-200 text-lg font-serif italic">&ldquo;{phrase}&rdquo;</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tool */}
                {renderTool()}

                {renderCoachTip()}
            </div>
        </div>
    );

    const renderCustomExercise = () => {
        if (!step.exercise) return null;

        const type = step.exercise.type;

        switch (type) {
            case 'self-care-checklist':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <SelfCareOnboarding
                            onComplete={() => onComplete?.()}
                            embedded={true} // specific prop to make it fit in the flow if needed
                        />
                    </Suspense>
                );
            case 'voice-audit':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VoiceAudit onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'sound-journal':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <SoundJournal onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'name-visualizer':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <NameVisualizer onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'inspiration-board':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <InspirationBoard onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'transcription-practice':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TranscriptionPractice onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'module-wrap-up':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ModuleWrapUp onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'warm-up-routine':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <WarmUpRoutine onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'quick-warm-up':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <QuickWarmUp onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'follow-along-warmup':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <FollowAlongWarmup onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'vocal-anatomy':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VocalAnatomyLesson onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'voice-alteration':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VoiceAlterationLesson onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'big-picture':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <BigPictureAssessment onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'module-2-wrap-up':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Module2WrapUp onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'larynx-control':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <LarynxControl onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'resonance-app':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ResonanceApplication onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'm-words':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <MWordChallenge onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'daily-phrases':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <DailyPhrases onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'module-3-wrap-up':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Module3WrapUp onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'piano-theory':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <PianoLesson onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'pitch-exploration':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <PitchExploration onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'target-pitch':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <PitchExercises onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'pitch-memorizer':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <PitchMemorizer onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'module-4-wrap-up':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Module4WrapUp onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'weight-theory':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VocalWeightTheory onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'weight-toolbox':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <WeightToolbox onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'twang-technique':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TwangTechnique onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'module-5-wrap-up':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Module5WrapUp onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'inflection-lesson':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <InflectionLesson onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'inflection-exercises':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <InflectionExercises onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'habit-builder':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <HabitBuilder onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'cognitive-load':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <CognitiveLoadGames onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'module-6-wrap-up':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Module6WrapUp onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'practice-philosophy':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <PracticePhilosophy onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'breath-support':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <BreathSupport onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'student-self-eval':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <StudentSelfEvaluation onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'vocal-hygiene':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VocalHygiene onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'relaxation-routine':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <RelaxationRoutine onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'tonal-consistency':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TonalConsistency onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'vowel-glides':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VowelGlides onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'resonance-breath-balance':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ResonanceBreathBalance onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'reading-practice':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ReadingPractice onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'twang-dojo':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TwangDojo onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'register-blend':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <RegisterBlend onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'projection-practice':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ProjectionPractice onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'prosody-theory':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ProsodyTheory onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'syllable-stacker':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <SyllableStacker onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'inflection-map':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <InflectionMap onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'recovery-strategy':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <RecoveryStrategy onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'texture-play':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TexturePlay onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'style-mixer':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <StyleMixer onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'voice-neutrality':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VoiceNeutrality onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            case 'graduation-reflection':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <GraduationReflection onComplete={() => onComplete?.()} />
                    </Suspense>
                );
            default:
                return null;
        }
    };

    const renderCheckpointStep = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Celebration header for checkpoints */}
                {step.celebration && (
                    <div className="text-center py-4">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    </div>
                )}

                {/* Main content */}
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-pink-300 max-w-none">
                    <ReactMarkdown>{step.content}</ReactMarkdown>
                </div>

                {/* Custom Exercises (Self-Care, Voice Audit, etc) */}
                {renderCustomExercise()}

                {/* Progress recording prompt */}
                {step.exercise?.type === 'progress-recording' && (
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 p-6 text-center">
                        <div className="text-4xl mb-4">✨</div>
                        <p className="text-slate-300 mb-2">{step.exercise.instruction}</p>
                        <p className="text-xs text-slate-500">
                            (Recording comparison feature coming soon)
                        </p>
                    </div>
                )}

                {renderCoachTip()}
            </div>
        </div>
    );

    // Main render switch
    const renderContent = () => {
        switch (step.type) {
            case 'intro':
                return renderIntroStep();
            case 'theory':
                return renderTheoryStep();
            case 'interactive':
                return renderInteractiveStep();
            case 'exercise':
                return renderExerciseStep();
            case 'checkpoint':
            case 'self-care':
            case 'discovery':
                return renderCheckpointStep();
            default:
                return renderTheoryStep();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Step header */}
            <div className="mb-6 flex-shrink-0">
                <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${step.type === 'theory' ? 'bg-blue-500/20 text-blue-400' :
                    step.type === 'interactive' ? 'bg-pink-500/20 text-pink-400' :
                        step.type === 'exercise' ? 'bg-orange-500/20 text-orange-400' :
                            step.type === 'checkpoint' ? 'bg-green-500/20 text-green-400' :
                                'bg-purple-500/20 text-purple-400'
                    }`}>
                    {step.type}
                </span>
                <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                {step.subtitle && (
                    <p className="text-slate-400 text-sm mt-1">{step.subtitle}</p>
                )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};

export default JourneyStep;

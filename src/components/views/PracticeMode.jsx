import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import DynamicOrb from '../viz/DynamicOrb';
import WarmUpModule from '../ui/WarmUpModule';
import { CURRICULUM } from '../../data/Curriculum';
import { KNOWLEDGE_BASE } from '../../data/knowledgeBase';
import { generateRoutine, getRoutineSummary } from '../../services/RoutineBuilder';
import { analysisEngine } from '../../services/AnalysisEngine';
import { coachMemory } from '../../services/CoachMemory';
import { feedbackService } from '../../services/FeedbackService';
import AnalysisReportView from '../ui/AnalysisReportView';

import { textToSpeechService } from '../../services/TextToSpeechService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

// Enhanced hook for Speech Synthesis with Voice Selection
const useSpeechSynthesis = (onEnd) => {
    const [speaking, setSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const speak = useCallback((text) => {
        textToSpeechService.speak(text, {
            onStartLoading: () => setIsLoading(true),
            onEndLoading: () => setIsLoading(false),
            onStart: () => setSpeaking(true),
            onEnd: () => {
                setSpeaking(false);
                if (onEnd) onEnd();
            }
        });
    }, [onEnd]);

    const stop = useCallback(() => {
        textToSpeechService.stop();
        setSpeaking(false);
        setIsLoading(false);
    }, []);

    return { speak, stop, speaking, isLoading };
};



const PracticeMode = ({
    onClose,
    dataRef,
    calibration,
    targetRange,

    activeTab,
    onOpenSettings,
    onOpenJournal,
    onOpenStats,
    onNavigate,
    onUpdateRange,
    onSwitchProfile,
    settings
}) => {
    // Initialize TTS with settings
    useEffect(() => {
        if (settings) {
            console.log("Initializing TTS with settings:", settings);
            textToSpeechService.updateSettings({
                // Force ElevenLabs if key is present, otherwise fallback to browser
                ttsProvider: settings.elevenLabsKey ? 'elevenlabs' : 'browser',
                elevenLabsKey: settings.elevenLabsKey,
                voiceId: settings.voiceId
            });
        }
    }, [settings]);

    // State Machine
    const [state, setState] = useState('INIT');
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [aiState, setAiState] = useState('IDLE');
    const [showSettings, setShowSettings] = useState(false);
    const [readingText, setReadingText] = useState('');

    // External data ref for the Orb
    const externalDataRef = useRef({ volume: 0 });

    // Feedback loop refs
    const lastFeedbackTime = useRef(0);
    const pitchHistory = useRef([]);
    const sessionStartTime = useRef(Date.now());
    const exercisesCompleted = useRef([]);

    // Proactive State Refs
    const lastFatigueWarning = useRef(0);
    const volumeHistory = useRef([]);
    const offTargetTimer = useRef(0);
    const silenceTimer = useRef(0);

    // Phase 4: Emotional Intelligence & Style
    const [coachingStyle, setCoachingStyle] = useState('gentle'); // gentle, strict, technical
    const [userGoal, setUserGoal] = useState('exploration'); // feminization, masculinization, androgyny, exploration

    const frustrationCounter = useRef(0);

    // Phase 5: Routine State
    const [routineActive, setRoutineActive] = useState(false);
    const [routinePlan, setRoutinePlan] = useState([]);
    const [currentRoutineStep, setCurrentRoutineStep] = useState(0);
    const routineTimer = useRef(0);

    // Phase 6: Analysis State
    const [analysisMode, setAnalysisMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [analysisReport, setAnalysisReport] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    // Exercise Refs
    const exerciseState = useRef({
        startTime: 0,
        stage: 'start',
        target: null,
        maxPitch: 0,
        minPitch: 1000,
        startResonance: 0,
        pattern: [],
        userPattern: [],
        variance: []
    });

    // Animation loop
    const animationRef = useRef();
    const { speak, stop: stopSpeak, speaking } = useSpeechSynthesis(() => {
        setAiState('IDLE');
        if (state === 'GREETING') {
            setState('LISTENING_CHOICE');
        } else if (state === 'WARMUP_INTRO') {
            setState('WARMUP_EXERCISE');
        } else if (state === 'CLOSING') {
            onClose();
        }
    });

    // Helper to style the output
    const styleSpeak = useCallback((baseText, type = 'feedback') => {
        let text = baseText;

        // Phase 8: Goal-Aware Affirmations
        if (type === 'affirmation') {
            text = feedbackService.getAffirmation(userGoal);
        }

        if (coachingStyle === 'strict') {
            if (type === 'feedback') {
                if (text.includes('Try')) text = text.replace('Try to', 'Do').replace('Try', 'Do');
                if (text.includes('bit')) text = text.replace('a bit', '');
                if (text.includes('slightly')) text = text.replace('slightly', '');
                text += " Focus.";
            }
        } else if (coachingStyle === 'technical') {
            // Technical style is handled by specific data readouts, but we can strip "fluff"
            if (text.includes('Great job')) text = "Target achieved.";
            if (text.includes('Try')) text = "Correction needed: " + text.replace('Try to', '');
        }
        speak(text);
    }, [coachingStyle, speak, userGoal]);

    // Routine Manager
    const startRoutine = useCallback((duration, focus) => {
        const plan = generateRoutine(duration, focus);
        setRoutinePlan(plan);
        setRoutineActive(true);
        setCurrentRoutineStep(0);
        routineTimer.current = Date.now();

        const summary = getRoutineSummary(plan);
        speak(`Starting a ${summary} First up: ${plan[0].name}. ${plan[0].instruction}`);

        // Initialize first exercise
        const firstEx = plan[0];
        if (firstEx.type === 'siren') {
            setState('EXERCISE_SIREN');
            exerciseState.current = { startTime: Date.now(), stage: 'start', maxPitch: 0, minPitch: 1000 };
        } else if (firstEx.type === 'hold') {
            setState('EXERCISE_HOLD');
            exerciseState.current = { startTime: Date.now(), stage: 'start', target: null };
        } else if (firstEx.type === 'resonance') {
            setState('EXERCISE_RESONANCE');
            exerciseState.current = { startTime: Date.now(), stage: firstEx.subtype || 'bright' };
        } else if (firstEx.type === 'mimic') {
            setState('EXERCISE_MIMIC');
            exerciseState.current = { startTime: Date.now(), stage: 'listen', pattern: ['Low', 'High', 'Low'], userPattern: [] };
        } else if (firstEx.type === 'reading') {
            setState('EXERCISE_READING');
            setReadingText("The quick brown fox jumps over the lazy dog.");
            exerciseState.current = { startTime: Date.now(), stage: 'reading', variance: [] };
        } else if (firstEx.type === 'rest') {
            setState('PRACTICE_ACTIVE');
        }

    }, [speak]);

    // Analysis Manager
    const startAnalysis = useCallback(async () => {
        const success = await analysisEngine.startRecording();
        if (success) {
            setIsRecording(true);
            setAnalysisMode(true);
            setAnalysisReport(null);
            setAudioBlob(null);
            speak("I'm listening. Read a sentence or speak naturally for a few seconds.");
        } else {
            speak("I couldn't access the microphone for recording.");
        }
    }, [speak]);

    const stopAnalysis = useCallback(async (transcriptText) => {
        setIsRecording(false);
        const data = await analysisEngine.stopRecording();
        if (data) {
            setAudioBlob(data.blob);
            const report = analysisEngine.analyze(data, transcriptText || "speech", targetRange || { min: 100, max: 200 });
            setAnalysisReport(report);

            speak(report.summary);

            // Playback feedback
            if (report.issues.length > 0) {
                setTimeout(() => {
                    const firstIssue = report.issues[0];
                    speak(`For example, ${firstIssue.feedback} Let's listen to that part.`);

                    setTimeout(() => {
                        const audioUrl = URL.createObjectURL(data.blob);
                        const audio = new Audio(audioUrl);
                        // Play only the segment
                        audio.currentTime = firstIssue.start / 1000;
                        audio.play();
                        setTimeout(() => {
                            audio.pause();
                            speak("Try to say that part again, but keep your pitch steady.");
                        }, (firstIssue.end - firstIssue.start) + 1500); // Play segment + buffer
                    }, 4000);
                }, 3000);
            }
        }
    }, [speak, targetRange]);

    const advanceRoutine = useCallback(() => {
        const nextStep = currentRoutineStep + 1;
        if (nextStep >= routinePlan.length) {
            setRoutineActive(false);
            setRoutinePlan([]);
            setState('PRACTICE_ACTIVE');
            speak("Routine complete! Great work.");
            return;
        }

        setCurrentRoutineStep(nextStep);
        const nextEx = routinePlan[nextStep];
        routineTimer.current = Date.now();

        speak(`Next: ${nextEx.name}. ${nextEx.instruction}`);

        if (nextEx.type === 'siren') {
            setState('EXERCISE_SIREN');
            exerciseState.current = { startTime: Date.now(), stage: 'start', maxPitch: 0, minPitch: 1000 };
        } else if (nextEx.type === 'hold') {
            setState('EXERCISE_HOLD');
            exerciseState.current = { startTime: Date.now(), stage: 'start', target: null };
        } else if (nextEx.type === 'resonance') {
            setState('EXERCISE_RESONANCE');
            exerciseState.current = { startTime: Date.now(), stage: nextEx.subtype || 'bright' };
        } else if (nextEx.type === 'mimic') {
            setState('EXERCISE_MIMIC');
            exerciseState.current = { startTime: Date.now(), stage: 'listen', pattern: ['Low', 'High', 'Low'], userPattern: [] };
        } else if (nextEx.type === 'reading') {
            setState('EXERCISE_READING');
            setReadingText("To be or not to be, that is the question.");
            exerciseState.current = { startTime: Date.now(), stage: 'reading', variance: [] };
        } else if (nextEx.type === 'rest') {
            setState('PRACTICE_ACTIVE');
        }
    }, [currentRoutineStep, routinePlan, speak]);

    useEffect(() => {
        if (speaking) setAiState('SPEAKING');
        else if (aiState === 'SPEAKING') setAiState('IDLE');
    }, [speaking, aiState]);

    const handleClose = useCallback(() => {
        const duration = Math.floor((Date.now() - sessionStartTime.current) / 60000);
        const count = exercisesCompleted.current.length;

        // Save Session to Memory
        const milestones = coachMemory.saveSession({
            duration: duration,
            exercises: exercisesCompleted.current,
            // In a real app, we'd calculate actual avg pitch/stability here
            avgPitch: 0,
            stability: 100
        });

        let summary = `Good practice. You worked for ${duration} minutes${count > 0 ? ` and completed ${count} exercises` : ''}.`;

        if (milestones.length > 0) {
            summary += ` And congratulations! ${milestones[0]}`;
        }

        summary += " See you next time!";

        setState('CLOSING');
        speak(summary);
    }, [speak]);

    const handleSpeechResult = useCallback((text) => {
        setTranscript(text);
        const lowerText = text.toLowerCase();

        // SENTIMENT ANALYSIS (Frustration Detection)
        if (lowerText.includes("can't") || lowerText.includes("hard") || lowerText.includes("stupid") || lowerText.includes("fail") || lowerText.includes("hate")) {
            frustrationCounter.current += 1;
            if (frustrationCounter.current >= 1) {
                speak("I sense some frustration. Let's take a pause. Breathe in... and breathe out. Reset.");
                frustrationCounter.current = 0;
                return; // Skip other processing
            }
        }

        if (state === 'LISTENING_CHOICE') {
            if (lowerText.includes('warm') || lowerText.includes('up') || lowerText.includes('yes') || lowerText.includes('sure')) {
                setState('WARMUP_INTRO');
            } else if (lowerText.includes('jump') || lowerText.includes('right') || lowerText.includes('practice') || lowerText.includes('no')) {
                setState('PRACTICE_ACTIVE');
                styleSpeak("Alright, let's jump right in. Go ahead and start practicing.");
            } else {
                speak("I didn't quite catch that. Do you want to warm up first?");
            }
        } else if (state === 'PRACTICE_ACTIVE') {
            // Interactive Exercises
            if (lowerText.includes('siren')) {
                setState('EXERCISE_SIREN');
                exerciseState.current = { startTime: Date.now(), stage: 'start', maxPitch: 0, minPitch: 1000 };
                styleSpeak("Let's do a siren. Start low, slide up to your highest comfortable note, and then slide back down.");
                return;
            }
            if (lowerText.includes('hold') || lowerText.includes('stability')) {
                setState('EXERCISE_HOLD');
                exerciseState.current = { startTime: Date.now(), stage: 'start', target: null };
                styleSpeak("Let's practice stability. Pick a comfortable note and hold it steady.");
                return;
            }
            if (lowerText.includes('resonance') || lowerText.includes('bright') || lowerText.includes('dark')) {
                setState('EXERCISE_RESONANCE');
                exerciseState.current = { startTime: Date.now(), stage: 'bright' };
                styleSpeak("Let's work on resonance. Say 'Eeee' and try to make it very bright and small.");
                return;
            }
            if (lowerText.includes('mimic') || lowerText.includes('copy')) {
                setState('EXERCISE_MIMIC');
                exerciseState.current = { startTime: Date.now(), stage: 'listen', pattern: ['Low', 'High', 'Low'], userPattern: [] };
                styleSpeak("I'm going to set a pitch pattern. Listen closely, then copy me. Low, High, Low.");
                return;
            }
            if (lowerText.includes('read') || lowerText.includes('passage')) {
                setState('EXERCISE_READING');
                const passages = [
                    "The quick brown fox jumps over the lazy dog.",
                    "To be or not to be, that is the question.",
                    "Sunlight streams through the open window, warming the room."
                ];
                const text = passages[Math.floor(Math.random() * passages.length)];
                setReadingText(text);
                exerciseState.current = { startTime: Date.now(), stage: 'reading', variance: [] };
                styleSpeak("Read this passage aloud. Try to vary your pitch and be expressive.");
                return;
            }

            // ROUTINE GENERATION
            if (lowerText.includes('build') || lowerText.includes('create') || lowerText.includes('start a routine')) {
                let duration = 5;
                if (lowerText.includes('minute')) {
                    const match = lowerText.match(/(\d+)\s*minute/);
                    if (match) duration = parseInt(match[1]);
                }

                let focus = 'any';
                if (lowerText.includes('warm') || lowerText.includes('warmup')) focus = 'warmup';
                else if (lowerText.includes('range')) focus = 'range';
                else if (lowerText.includes('resonance')) focus = 'resonance';
                else if (lowerText.includes('relax')) focus = 'rest';

                startRoutine(duration, focus);
                return;
            }

            // ANALYSIS COMMANDS
            if (lowerText.includes('analyze') || lowerText.includes('sample') || lowerText.includes('check my voice')) {
                startAnalysis();
                return;
            }

            if (isRecording) {
                if (lowerText.includes('stop') || lowerText.includes('done') || lowerText.includes('finished')) {
                    stopAnalysis(transcript);
                    return;
                }
            }

            if (routineActive) {
                if (lowerText.includes('skip') || lowerText.includes('next')) {
                    advanceRoutine();
                    return;
                }
                if (lowerText.includes('stop routine') || lowerText.includes('end routine')) {
                    setRoutineActive(false);
                    setRoutinePlan([]);
                    setState('PRACTICE_ACTIVE');
                    speak("Routine stopped.");
                    return;
                }
            }

            // Voice Control
            if (lowerText.includes('set') && lowerText.includes('range')) {
                const numbers = lowerText.match(/\d+/g);
                if (numbers && numbers.length >= 2) {
                    const min = parseInt(numbers[0]);
                    const max = parseInt(numbers[1]);
                    if (min < max) {
                        onUpdateRange({ min, max });
                        styleSpeak(`Setting pitch range to ${min} to ${max} Hertz.`);
                    } else {
                        speak("I couldn't understand the range. Please say something like 'Set range to 150 and 220'.");
                    }
                }
                return;
            }
            if (lowerText.includes('switch') && lowerText.includes('profile')) {
                if (lowerText.includes('fem')) {
                    onSwitchProfile('fem');
                    styleSpeak("Switched to Feminine profile.");
                } else if (lowerText.includes('masc')) {
                    onSwitchProfile('masc');
                    styleSpeak("Switched to Masculine profile.");
                } else if (lowerText.includes('neutral') || lowerText.includes('androg')) {
                    onSwitchProfile('neutral');
                    styleSpeak("Switched to Neutral profile.");
                }
                return;
            }

            // Style Control
            if (lowerText.includes('style') || lowerText.includes('coach')) {
                if (lowerText.includes('strict')) {
                    setCoachingStyle('strict');
                    speak("Understood. I will be strict and direct.");
                } else if (lowerText.includes('gentle') || lowerText.includes('soft')) {
                    setCoachingStyle('gentle');
                    speak("Okay, I'll keep it gentle and encouraging.");
                } else if (lowerText.includes('tech')) {
                    setCoachingStyle('technical');
                    speak("Acknowledged. Switching to technical feedback mode.");
                }
                return;
            }

            // Navigation
            if (lowerText.includes('settings') && (lowerText.includes('go') || lowerText.includes('open'))) {
                speak("Opening settings.");
                onClose();
                onOpenSettings();
                return;
            }
            if (lowerText.includes('journal') && (lowerText.includes('go') || lowerText.includes('open'))) {
                speak("Opening your journal.");
                onClose();
                onOpenJournal();
                return;
            }
            if ((lowerText.includes('stats') || lowerText.includes('progress')) && (lowerText.includes('show') || lowerText.includes('go'))) {
                speak("Showing your progress.");
                onClose();
                onOpenStats();
                return;
            }
            if (lowerText.includes('arcade') || lowerText.includes('games')) {
                speak("Going to the arcade.");
                onClose();
                onNavigate('games');
                return;
            }

            // Knowledge Base
            if (lowerText.includes('how') || lowerText.includes('what') || lowerText.includes('why')) {
                const match = KNOWLEDGE_BASE.find(item => {
                    const questionMatch = item.question.toLowerCase().includes(lowerText);
                    const tagMatch = item.tags.some(tag => lowerText.includes(tag));
                    return questionMatch || (tagMatch && lowerText.includes(item.category.toLowerCase()));
                });

                if (match) {
                    const spokenAnswer = match.answer.split('\n')[0];
                    speak(spokenAnswer);
                    return;
                }
            }



            // Existing Commands
            if (lowerText.includes('stop') || lowerText.includes('pause')) {
                speak("Pausing feedback.");
            } else if (lowerText.includes('pitch') && lowerText.includes('what')) {
                const currentPitch = dataRef.current?.pitch?.toFixed(0);
                speak(currentPitch ? `Your pitch is ${currentPitch} Hertz.` : "I can't hear your pitch right now.");
            } else if (lowerText.includes('range') || lowerText.includes('target')) {
                if (targetRange) {
                    speak(`Your target range is ${targetRange.min} to ${targetRange.max} Hertz.`);
                } else {
                    speak("No target range is set.");
                }
            } else if (lowerText.includes('help')) {
                speak("You can ask me questions, change settings, or say 'Start a siren'.");

            }
        } else if (state.startsWith('EXERCISE_')) {
            if (lowerText.includes('stop') || lowerText.includes('cancel') || lowerText.includes('done')) {
                if (routineActive) {
                    advanceRoutine(); // Skip to next in routine
                } else {
                    setState('PRACTICE_ACTIVE');
                    speak("Stopping exercise.");
                }
            }
        }
    }, [state, speak, styleSpeak, dataRef, targetRange, onClose, onOpenSettings, onOpenJournal, onOpenStats, onNavigate, onUpdateRange, onSwitchProfile, routineActive, startRoutine, advanceRoutine, isRecording, startAnalysis, stopAnalysis, transcript]);

    const { start: startListen, stop: stopListen, listening, error: speechError, pushToTalkActive, startPushToTalk, stopPushToTalk, isSupported } = useSpeechRecognition(handleSpeechResult);

    useEffect(() => {
        if (listening && !speaking) setAiState('LISTENING');
        else if (!listening && !speaking) setAiState('IDLE');
    }, [listening, speaking]);
    useEffect(() => {
        if (state === 'INIT') {
            const timer = setTimeout(() => {
                setState('GREETING');

                // Adaptive Greeting
                const lastSummary = coachMemory.getLastSessionSummary();
                const suggestion = coachMemory.getSuggestion();

                let greeting = "Hi! ";
                if (lastSummary) {
                    greeting += lastSummary + " ";
                }

                if (suggestion.focus !== 'any') {
                    greeting += suggestion.reason + " Shall we start with that?";
                } else {
                    greeting += "Shall we begin practice with a warmup, or jump right into it?";
                }

                speak(greeting);
            }, 1000);
            return () => clearTimeout(timer);
        }

        if (state === 'LISTENING_CHOICE' || state === 'PRACTICE_ACTIVE' || state.startsWith('EXERCISE_')) {
            if (isSupported && !speaking) {
                startListen();
            } else {
                stopListen();
            }
        }

        if (state === 'WARMUP_INTRO') {
            speak("Great, let's get those vocal cords ready. We'll start with a randomized routine.");
        }

    }, [state, speak, startListen, stopListen, isSupported, speaking]);

    // Real-time Feedback Loop
    useEffect(() => {
        // Log metrics for analysis if recording
        if (isRecording && dataRef.current) {
            const { pitch, resonance, volume } = dataRef.current;
            analysisEngine.logMetric(pitch, resonance, volume);
        }

        if (speaking) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const { pitch, resonance, volume } = dataRef.current || {};

            // PROACTIVE: FATIGUE MONITOR
            if (now - sessionStartTime.current > 1200000 && now - lastFatigueWarning.current > 1200000) {
                speak("You've been practicing for over 20 minutes. Remember to take a water break to keep your voice healthy.");
                lastFatigueWarning.current = now;
            }

            // PROACTIVE: VOLUME CHECK
            if (volume !== undefined) {
                volumeHistory.current.push(volume);
                if (volumeHistory.current.length > 20) volumeHistory.current.shift();
                const avgVol = volumeHistory.current.reduce((a, b) => a + b, 0) / volumeHistory.current.length;

                if (avgVol > 0.95 && now - lastFeedbackTime.current > 10000) {
                    speak("You're coming in a bit loud. Try backing away from the microphone slightly.");
                    setFeedback("Too Loud 🔊");
                    lastFeedbackTime.current = now;
                }
                else if (pitch > 0 && avgVol < 0.008 && now - lastFeedbackTime.current > 10000) {
                    speak("I can barely hear you. Please move closer to the microphone.");
                    setFeedback("Too Quiet 🔈");
                    lastFeedbackTime.current = now;
                }
            }

            // PROACTIVE: SILENCE CHECK
            if (state === 'PRACTICE_ACTIVE' && !routineActive) {
                if (!pitch || pitch <= 0) {
                    silenceTimer.current += 100;
                    if (silenceTimer.current > 120000) {
                        speak("Are you still there? We can pause if you like.");
                        silenceTimer.current = 0;
                    }
                } else {
                    silenceTimer.current = 0;
                }
            }

            // ROUTINE TIMER CHECK
            if (routineActive && !speaking) {
                const currentStep = routinePlan[currentRoutineStep];
                if (currentStep) {
                    const elapsed = (now - routineTimer.current) / 1000;
                    if (elapsed > currentStep.duration) {
                        advanceRoutine();
                        return; // Skip other checks to avoid conflicts
                    }
                }
            }

            // EXERCISE: SIREN
            if (state === 'EXERCISE_SIREN') {
                if (!pitch || pitch < 50) return;

                const ex = exerciseState.current;

                if (pitch > ex.maxPitch) ex.maxPitch = pitch;
                if (pitch < ex.minPitch) ex.minPitch = pitch;

                if (ex.stage === 'start') {
                    if (pitch > 0) {
                        ex.stage = 'ascending';
                        setFeedback("Slide Up! ↗️");
                    }
                } else if (ex.stage === 'ascending') {
                    if (ex.maxPitch > 200 && pitch < ex.maxPitch - 20) {
                        ex.stage = 'descending';
                        setFeedback("Now Slide Down! ↘️");
                        speak("Good, now smooth all the way down.");
                    }
                } else if (ex.stage === 'descending') {
                    if (pitch < ex.minPitch + 20 || pitch < 150) {
                        if (routineActive) {
                            speak("Great siren.");
                            advanceRoutine();
                        } else {
                            setState('PRACTICE_ACTIVE');
                            styleSpeak("Great siren! That was a nice range.");
                            setFeedback("Great Job! ✨");
                            exercisesCompleted.current.push('siren');
                        }
                    }
                }
                return;
            }

            // EXERCISE: HOLD
            if (state === 'EXERCISE_HOLD') {
                if (!pitch || pitch < 50) return;
                const ex = exerciseState.current;

                if (ex.stage === 'start') {
                    if (!ex.target) {
                        ex.target = pitch;
                        ex.startTime = now;
                        setFeedback(`Hold ${pitch.toFixed(0)} Hz`);
                    } else {
                        const diff = Math.abs(pitch - ex.target);
                        if (diff > 15) {
                            setFeedback("Steady...");
                            if (now - ex.startTime > 2000) {
                                styleSpeak("Try to keep it steady.");
                                ex.startTime = now;
                            }
                        } else {
                            const heldTime = (now - ex.startTime) / 1000;
                            setFeedback(`Holding... ${heldTime.toFixed(1)}s`);
                            if (heldTime > 5) {
                                if (routineActive) {
                                    speak("Good stability.");
                                    advanceRoutine();
                                } else {
                                    setState('PRACTICE_ACTIVE');
                                    styleSpeak("Excellent stability.");
                                    setFeedback("Perfect! ✨");
                                    exercisesCompleted.current.push('hold');
                                }
                            }
                        }
                    }
                }
                return;
            }

            // EXERCISE: RESONANCE
            if (state === 'EXERCISE_RESONANCE') {
                if (!pitch || pitch < 50) return;
                const ex = exerciseState.current;

                if (ex.stage === 'bright') {
                    setFeedback("Make it Bright! (Eeee)");
                    if (resonance > 70) {
                        ex.stage = 'dark';
                        // Use FeedbackService
                        const msg = feedbackService.getFeedback('resonance', 80, userGoal);
                        speak(`${msg} Now switch to a dark 'Oooo' sound.`);
                    }
                } else if (ex.stage === 'dark') {
                    setFeedback("Make it Dark! (Oooo)");
                    if (resonance < 30) {
                        if (routineActive) {
                            speak("Nice resonance control.");
                            advanceRoutine();
                        } else {
                            setState('PRACTICE_ACTIVE');
                            styleSpeak("Excellent control over your resonance.", 'affirmation');
                            setFeedback("Resonance Master! ✨");
                            exercisesCompleted.current.push('resonance');
                        }
                    }
                }
                return;
            }

            // EXERCISE: MIMIC ME
            if (state === 'EXERCISE_MIMIC') {
                if (!pitch || pitch < 50) return;
                const ex = exerciseState.current;

                if (ex.stage === 'listen') {
                    if (pitch > 0) {
                        ex.stage = 'recording';
                        ex.startTime = now;
                        ex.userPattern = [pitch];
                        setFeedback("Listening...");
                    }
                } else if (ex.stage === 'recording') {
                    ex.userPattern.push(pitch);

                    if (now - ex.startTime > 4000) {
                        const p = ex.userPattern;
                        const min = Math.min(...p);
                        const max = Math.max(...p);
                        const range = max - min;

                        const midIndex = Math.floor(p.length / 2);
                        const startPitch = p[0];
                        const endPitch = p[p.length - 1];
                        const midPitch = p[midIndex];

                        if (range > 30 && midPitch > startPitch + 20 && midPitch > endPitch + 20) {
                            if (routineActive) {
                                speak("Matched.");
                                advanceRoutine();
                            } else {
                                setState('PRACTICE_ACTIVE');
                                styleSpeak("Good intonation! You matched the pattern.");
                                setFeedback("Matched! ✨");
                                exercisesCompleted.current.push('mimic');
                            }
                        } else {
                            if (routineActive) {
                                speak("A bit flat, moving on.");
                                advanceRoutine();
                            } else {
                                setState('PRACTICE_ACTIVE');
                                styleSpeak("That was a bit flat. Try to exaggerate the high note next time.");
                                setFeedback("Try again!");
                            }
                        }
                    }
                }
                return;
            }

            // EXERCISE: READING BUDDY
            if (state === 'EXERCISE_READING') {
                if (!pitch || pitch < 50) return;
                const ex = exerciseState.current;

                ex.variance.push(pitch);

                if (ex.variance.length > 100) {
                    const mean = ex.variance.reduce((a, b) => a + b) / ex.variance.length;
                    const variance = ex.variance.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / ex.variance.length;
                    const stdDev = Math.sqrt(variance);

                    if (stdDev > 15) {
                        if (routineActive) {
                            speak("Good expression.");
                            advanceRoutine();
                        } else {
                            setState('PRACTICE_ACTIVE');
                            styleSpeak("Great expression! Your voice is very dynamic.");
                            setFeedback("Dynamic Voice! ✨");
                            exercisesCompleted.current.push('reading');
                            setStreak(s => s + 1);
                        }
                    } else {
                        if (routineActive) {
                            speak("Try more variation next time.");
                            advanceRoutine();
                        } else {
                            setState('PRACTICE_ACTIVE');
                            styleSpeak("Your pitch is a bit steady. Try to vary your intonation more.");
                            setFeedback("Vary your pitch ↑↓");
                            setStreak(0);
                        }
                    }
                } else {
                    setFeedback("Reading...");
                }
                return;
            }

            // STANDARD PRACTICE FEEDBACK
            if (state === 'PRACTICE_ACTIVE') {
                if (now - lastFeedbackTime.current < 5000) return;
                if (!pitch || pitch < 50) return;

                pitchHistory.current.push(pitch);
                if (pitchHistory.current.length > 10) pitchHistory.current.shift();

                const avgPitch = pitchHistory.current.reduce((a, b) => a + b, 0) / pitchHistory.current.length;

                if (targetRange) {
                    // Smart Intervention
                    if (avgPitch < targetRange.min - 10) {
                        offTargetTimer.current += 100;
                        if (offTargetTimer.current > 10000) {
                            styleSpeak("You've been consistently low for a while. Try to reset your breath and lift your pitch.");
                            offTargetTimer.current = 0;
                            lastFeedbackTime.current = now;
                        } else if (offTargetTimer.current % 3000 === 0) {
                            setFeedback("Try raising your pitch ↑");
                        }
                    } else if (avgPitch > targetRange.max + 10) {
                        offTargetTimer.current += 100;
                        if (offTargetTimer.current > 10000) {
                            styleSpeak("You're staying quite high. Make sure you're not straining.");
                            offTargetTimer.current = 0;
                            lastFeedbackTime.current = now;
                        } else if (offTargetTimer.current % 3000 === 0) {
                            setFeedback("Relax down ↓");
                        }
                    } else {
                        offTargetTimer.current = 0;
                        if (Math.random() > 0.95) {
                            styleSpeak("Great job, holding steady!");
                            setFeedback("Great job! ✨");
                            lastFeedbackTime.current = now;
                        }
                    }
                }
            }

        }, 100);

        return () => clearInterval(interval);
    }, [state, speaking, targetRange, speak, styleSpeak, dataRef, calibration, streak, routineActive, advanceRoutine, isRecording]);

    useEffect(() => {
        const animate = () => {
            if (speaking) {
                // AI Speaking: Simulate volume
                const target = 0.3 + Math.random() * 0.4;
                externalDataRef.current.volume += (target - externalDataRef.current.volume) * 0.2;
            } else {
                // User Speaking: Use actual mic volume
                const userVolume = dataRef.current?.volume || 0;
                // Amplify slightly for better visual feedback
                const target = userVolume * 3;
                externalDataRef.current.volume += (target - externalDataRef.current.volume) * 0.2;
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [speaking]);

    useEffect(() => {
        return () => {
            stopSpeak();
            stopListen();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [stopSpeak, stopListen]);

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-500">
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    {/* Microphone Status Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${listening ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-500'}`} />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {listening ? '🎤 Listening' : aiState === 'SPEAKING' ? '🔊 Speaking' : '⏸️ Idle'}
                        </span>
                    </div>

                    {/* Error Message */}
                    {speechError && (
                        <div className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold animate-in fade-in">
                            {speechError === 'microphone-denied' && '🚫 Microphone access denied'}
                            {speechError === 'network-error' && '📡 Network error'}
                            {speechError === 'start-failed' && '⚠️ Failed to start'}
                            {!['microphone-denied', 'network-error', 'start-failed'].includes(speechError) && `⚠️ ${speechError}`}
                        </div>
                    )}

                    {/* Browser Support Warning */}
                    {!isSupported && (
                        <div className="px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                            ⚠️ Browser not supported (Use Chrome/Edge)
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Push-to-Talk Button */}
                    <button
                        disabled={!isSupported}
                        onMouseDown={startPushToTalk}
                        onMouseUp={stopPushToTalk}
                        onMouseLeave={stopPushToTalk}
                        onTouchStart={startPushToTalk}
                        onTouchEnd={stopPushToTalk}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${!isSupported
                            ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5'
                            : pushToTalkActive
                                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-105'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/10'
                            }`}
                        title={isSupported ? "Hold to talk" : "Not supported in this browser"}
                    >
                        {pushToTalkActive ? '🎙️ Release to stop' : '🎙️ Push to Talk'}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <Settings size={24} />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="absolute top-20 right-6 z-40 w-64 bg-slate-900 border border-white/10 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-white mb-3">Voice Settings</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">AI Voice</label>
                            <select
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={selectedVoice?.name || ''}
                                onChange={(e) => {
                                    const voice = voices.find(v => v.name === e.target.value);
                                    if (voice) {
                                        selectVoice(voice);
                                        speak("Hello! This is my new voice.");
                                    }
                                }}
                            >
                                {voices.map(v => (
                                    <option key={v.name} value={v.name}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">Your Goal</label>
                            <select
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={userGoal}
                                onChange={(e) => {
                                    setUserGoal(e.target.value);
                                    speak(`Goal set to ${e.target.value}. I'll adjust my feedback.`);
                                }}
                            >
                                <option value="exploration">Exploration</option>
                                <option value="feminization">Feminization</option>
                                <option value="masculinization">Masculinization</option>
                                <option value="androgyny">Androgyny</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">Coaching Style</label>
                            <div className="flex gap-2">
                                {['gentle', 'strict', 'technical'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setCoachingStyle(s);
                                            speak(`Switched to ${s} coaching.`);
                                        }}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${coachingStyle === s ? 'bg-teal-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 relative">
                <DynamicOrb dataRef={dataRef} calibration={calibration} externalDataRef={externalDataRef} />

                <div className="absolute bottom-32 left-0 right-0 text-center px-8 pointer-events-none">
                    {transcript && (
                        <div className="inline-block bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl text-xl font-medium text-white/90 mb-4 animate-in slide-in-from-bottom-2">
                            "{transcript}"
                        </div>
                    )}
                    {feedback && (
                        <div className="text-lg font-bold text-teal-400 mt-2 animate-pulse">{feedback}</div>
                    )}
                    {state === 'EXERCISE_READING' && readingText && (
                        <div className="max-w-md mx-auto bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 mt-4 animate-in slide-in-from-bottom-4">
                            <p className="text-lg font-serif leading-relaxed text-white/90">{readingText}</p>
                        </div>
                    )}
                </div>
            </div>

            {state === 'WARMUP_EXERCISE' && (
                <div className="absolute inset-0 z-30">
                    <WarmUpModule
                        onComplete={() => {
                            setState('PRACTICE_ACTIVE');
                            speak("You're all warmed up! Let's start practicing.");
                        }}
                        onSkip={() => {
                            setState('PRACTICE_ACTIVE');
                            speak("Skipping warmup. Let's practice.");
                        }}
                    />
                </div>
            )}

            <div className="h-24 bg-slate-900/50 backdrop-blur-lg border-t border-white/5 flex items-center justify-center gap-4 px-6 z-20">
                {state === 'LISTENING_CHOICE' && !listening && (
                    <>
                        <button
                            onClick={() => setState('WARMUP_INTRO')}
                            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
                        >
                            Start Warmup
                        </button>
                        <button
                            onClick={() => {
                                setState('PRACTICE_ACTIVE');
                                speak("Alright, go ahead.");
                            }}
                            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
                        >
                            Skip Warmup
                        </button>
                    </>
                )}

                {state === 'PRACTICE_ACTIVE' && !routineActive && !isRecording && (
                    <div className="text-slate-400 text-sm">
                        Practice active. I'm listening to your pitch and resonance.
                    </div>
                )}

                {routineActive && (
                    <div className="text-teal-400 text-sm font-bold animate-pulse flex items-center gap-2">
                        <span>Routine Active: {routinePlan[currentRoutineStep]?.name}</span>
                        <span className="text-xs text-slate-400">({currentRoutineStep + 1}/{routinePlan.length})</span>
                    </div>
                )}

                {isRecording && (
                    <div className="text-red-400 text-sm font-bold animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Recording for Analysis...
                    </div>
                )}

                {state.startsWith('EXERCISE_') && !routineActive && (
                    <div className="text-teal-400 text-sm font-bold animate-pulse">
                        Exercise in progress...
                    </div>
                )}
            </div>

            {analysisReport && (
                <AnalysisReportView
                    report={analysisReport}
                    audioBlob={audioBlob}
                    onClose={() => {
                        setAnalysisReport(null);
                        setAnalysisMode(false);
                        speak("Analysis closed.");
                    }}
                />
            )}
        </div>
    );
};

export default PracticeMode;

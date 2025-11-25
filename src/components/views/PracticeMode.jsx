import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import DynamicOrb from '../viz/DynamicOrb';
import WarmUpModule from '../ui/WarmUpModule';
import { CURRICULUM } from '../../data/Curriculum';
import { KNOWLEDGE_BASE } from '../../data/knowledgeBase';
import { generateRoutine, getRoutineSummary } from '../../services/RoutineBuilder';

// Enhanced hook for Speech Synthesis with Voice Selection
const useSpeechSynthesis = (onEnd) => {
    const [speaking, setSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);

    useEffect(() => {
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            const englishVoices = available.filter(v => v.lang.startsWith('en'));
            setVoices(englishVoices);

            const savedVoiceName = localStorage.getItem('gem_voice_name');
            if (savedVoiceName) {
                const saved = englishVoices.find(v => v.name === savedVoiceName);
                if (saved) {
                    setSelectedVoice(saved);
                    return;
                }
            }

            const preferred = englishVoices.find(v => v.name.includes('Google US English')) ||
                englishVoices.find(v => v.name.includes('Zira')) ||
                englishVoices.find(v => v.name.includes('Samantha')) ||
                englishVoices[0];

            if (preferred) setSelectedVoice(preferred);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const selectVoice = (voice) => {
        setSelectedVoice(voice);
        localStorage.setItem('gem_voice_name', voice.name);
    };

    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.rate = 1.1;
        utterance.pitch = 1.0;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => {
            setSpeaking(false);
            if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(utterance);
    }, [onEnd, selectedVoice]);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setSpeaking(false);
    }, []);

    return { speak, stop, speaking, voices, selectedVoice, selectVoice };
};

// Simple hook for Speech Recognition
const useSpeechRecognition = (onResult) => {
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onstart = () => setListening(true);
            recognition.onend = () => setListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript);
            };
            recognitionRef.current = recognition;
        }
    }, [onResult]);

    const start = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Recognition already started", e);
            }
        }
    }, []);

    const stop = useCallback(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
    }, []);

    return { start, stop, listening, isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition) };
};

const PracticeMode = ({
    onClose,
    dataRef,
    calibration,
    targetRange,
    goals,
    onSelectGame,
    activeTab,
    userMode,
    onOpenSettings,
    onOpenJournal,
    onOpenStats,
    onNavigate,
    onUpdateRange,
    onSwitchProfile,
    onUpdateUserMode
}) => {
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
    );
};

export default PracticeMode;

import { useState, useEffect, useRef, useCallback } from 'react';

export const useTTS = () => {
    const [voices, setVoices] = useState([]);
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);
    const synth = useRef(window.speechSynthesis);

    useEffect(() => {
        if (!synth.current) {
            setSupported(false);
            return;
        }

        const loadVoices = () => {
            const availableVoices = synth.current.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();

        // Chrome loads voices asynchronously
        if (synth.current.onvoiceschanged !== undefined) {
            synth.current.onvoiceschanged = loadVoices;
        }
    }, []);

    const getBestVoice = useCallback((gender) => {
        if (voices.length === 0) return null;

        // Keywords to look for based on gender
        const keywords = {
            fem: ['female', 'woman', 'zira', 'samantha', 'google us english'],
            masc: ['male', 'man', 'david', 'daniel', 'google uk english male'],
            neutral: ['google', 'microsoft']
        };

        const targetKeywords = keywords[gender] || keywords.fem;

        // 1. Try to find a voice matching keywords and current language
        const lang = navigator.language || 'en-US';
        let bestVoice = voices.find(v =>
            v.lang.startsWith(lang.split('-')[0]) &&
            targetKeywords.some(k => v.name.toLowerCase().includes(k))
        );

        // 2. Fallback to any voice matching keywords
        if (!bestVoice) {
            bestVoice = voices.find(v =>
                targetKeywords.some(k => v.name.toLowerCase().includes(k))
            );
        }

        // 3. Fallback to default voice
        if (!bestVoice) {
            bestVoice = voices.find(v => v.default) || voices[0];
        }

        return bestVoice;
    }, [voices]);

    const speak = useCallback((text, options = {}) => {
        if (!supported || !synth.current) return;

        // Cancel current speech
        synth.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Voice selection
        if (options.voice) {
            utterance.voice = options.voice;
        } else if (options.gender) {
            utterance.voice = getBestVoice(options.gender);
        }

        // Other options
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setSpeaking(false);
        };

        synth.current.speak(utterance);
    }, [supported, getBestVoice]);

    const cancel = useCallback(() => {
        if (synth.current) {
            synth.current.cancel();
            setSpeaking(false);
        }
    }, []);

    return {
        voices,
        speaking,
        supported,
        speak,
        cancel,
        getBestVoice
    };
};

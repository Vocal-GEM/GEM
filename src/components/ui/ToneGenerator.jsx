import { useState, useRef, useEffect, useCallback } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

/**
 * ToneGenerator - A visual piano keyboard for generating reference tones
 * Helps users learn to recognize and hold specific pitches
 */
const ToneGenerator = ({ onNotePlay, compact = false }) => {
    const [activeNote, setActiveNote] = useState(null);
    const [volume, setVolume] = useState(0.3);
    const [isMuted, setIsMuted] = useState(false);

    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);

    // Note frequencies (C3 to C5 - 2 octaves covering typical voice ranges)
    const notes = [
        // Octave 3 (Male range)
        { note: 'C3', freq: 130.81, isBlack: false },
        { note: 'C#3', freq: 138.59, isBlack: true },
        { note: 'D3', freq: 146.83, isBlack: false },
        { note: 'D#3', freq: 155.56, isBlack: true },
        { note: 'E3', freq: 164.81, isBlack: false },
        { note: 'F3', freq: 174.61, isBlack: false },
        { note: 'F#3', freq: 185.00, isBlack: true },
        { note: 'G3', freq: 196.00, isBlack: false },
        { note: 'G#3', freq: 207.65, isBlack: true },
        { note: 'A3', freq: 220.00, isBlack: false },
        { note: 'A#3', freq: 233.08, isBlack: true },
        { note: 'B3', freq: 246.94, isBlack: false },
        // Octave 4 (Androgynous/Female range)
        { note: 'C4', freq: 261.63, isBlack: false, label: 'Middle C' },
        { note: 'C#4', freq: 277.18, isBlack: true },
        { note: 'D4', freq: 293.66, isBlack: false },
        { note: 'D#4', freq: 311.13, isBlack: true },
        { note: 'E4', freq: 329.63, isBlack: false },
        { note: 'F4', freq: 349.23, isBlack: false },
        { note: 'F#4', freq: 369.99, isBlack: true },
        { note: 'G4', freq: 392.00, isBlack: false },
        { note: 'G#4', freq: 415.30, isBlack: true },
        { note: 'A4', freq: 440.00, isBlack: false, label: 'A440' },
        { note: 'A#4', freq: 466.16, isBlack: true },
        { note: 'B4', freq: 493.88, isBlack: false },
        // C5 (Female range upper)
        { note: 'C5', freq: 523.25, isBlack: false },
    ];

    // Gender range indicators
    const genderRanges = {
        male: { min: 85, max: 180, color: 'from-blue-500 to-cyan-500' },
        androgynous: { min: 135, max: 220, color: 'from-purple-500 to-pink-500' },
        female: { min: 180, max: 300, color: 'from-pink-500 to-rose-500' }
    };

    // Initialize audio context
    useEffect(() => {
        return () => {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const getAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    };

    const startNote = useCallback((noteData) => {
        if (isMuted) return;

        const ctx = getAudioContext();

        // Stop any existing oscillator
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
        }

        // Create oscillator
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(noteData.freq, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;

        setActiveNote(noteData.note);
        onNotePlay?.(noteData);
    }, [volume, isMuted, onNotePlay]);

    const stopNote = useCallback(() => {
        if (oscillatorRef.current && gainNodeRef.current) {
            const ctx = audioContextRef.current;
            if (ctx) {
                gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
                setTimeout(() => {
                    if (oscillatorRef.current) {
                        oscillatorRef.current.stop();
                        oscillatorRef.current = null;
                    }
                }, 100);
            }
        }
        setActiveNote(null);
    }, []);

    const getGenderIndicator = (freq) => {
        if (freq >= genderRanges.female.min) return 'female';
        if (freq >= genderRanges.androgynous.min) return 'androgynous';
        return 'male';
    };

    const whiteKeys = notes.filter(n => !n.isBlack);
    const blackKeys = notes.filter(n => n.isBlack);

    // Get black key position based on its index in the scale
    const getBlackKeyPosition = (blackNote) => {
        const noteIndex = notes.findIndex(n => n.note === blackNote.note);
        const whiteKeysBefore = notes.slice(0, noteIndex).filter(n => !n.isBlack).length;
        const keyWidth = compact ? 24 : 32;
        return (whiteKeysBefore * keyWidth) - (compact ? 8 : 10);
    };

    if (compact) {
        return (
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-pink-400" />
                        <span className="text-xs font-bold text-white">Tone Generator</span>
                    </div>
                    {activeNote && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-pink-400">{activeNote}</span>
                            <span className="text-xs text-slate-400">
                                {notes.find(n => n.note === activeNote)?.freq.toFixed(0)} Hz
                            </span>
                        </div>
                    )}
                </div>

                {/* Compact piano keyboard */}
                <div className="relative h-12 overflow-hidden rounded">
                    {/* White keys */}
                    <div className="flex h-full">
                        {whiteKeys.map((noteData) => (
                            <button
                                key={noteData.note}
                                onMouseDown={() => startNote(noteData)}
                                onMouseUp={stopNote}
                                onMouseLeave={stopNote}
                                onTouchStart={(e) => { e.preventDefault(); startNote(noteData); }}
                                onTouchEnd={stopNote}
                                className={`w-6 h-full border-r border-slate-600 transition-all ${activeNote === noteData.note
                                    ? 'bg-gradient-to-b from-pink-400 to-pink-500'
                                    : 'bg-slate-200 hover:bg-slate-100'
                                    }`}
                            />
                        ))}
                    </div>
                    {/* Black keys */}
                    <div className="absolute top-0 left-0 h-7">
                        {blackKeys.map((noteData) => (
                            <button
                                key={noteData.note}
                                onMouseDown={() => startNote(noteData)}
                                onMouseUp={stopNote}
                                onMouseLeave={stopNote}
                                onTouchStart={(e) => { e.preventDefault(); startNote(noteData); }}
                                onTouchEnd={stopNote}
                                className={`absolute w-4 h-full rounded-b transition-all ${activeNote === noteData.note
                                    ? 'bg-gradient-to-b from-pink-600 to-pink-700'
                                    : 'bg-slate-900 hover:bg-slate-800'
                                    }`}
                                style={{ left: getBlackKeyPosition(noteData) }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                        <Music className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Tone Generator</h3>
                        <p className="text-xs text-slate-400">Tap keys to play reference tones</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Volume control */}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        {isMuted ? (
                            <VolumeX className="w-4 h-4 text-slate-400" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-slate-300" />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 accent-pink-500"
                    />
                </div>
            </div>

            {/* Active note display */}
            {activeNote && (
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-white">{activeNote}</span>
                            {notes.find(n => n.note === activeNote)?.label && (
                                <span className="text-xs text-slate-400">
                                    ({notes.find(n => n.note === activeNote)?.label})
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-mono text-pink-400">
                                {notes.find(n => n.note === activeNote)?.freq.toFixed(1)} Hz
                            </div>
                            <div className={`text-xs font-bold capitalize ${getGenderIndicator(notes.find(n => n.note === activeNote)?.freq) === 'female' ? 'text-pink-400' :
                                getGenderIndicator(notes.find(n => n.note === activeNote)?.freq) === 'androgynous' ? 'text-purple-400' :
                                    'text-blue-400'
                                }`}>
                                {getGenderIndicator(notes.find(n => n.note === activeNote)?.freq)} range
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Piano keyboard */}
            <div className="relative h-24 overflow-x-auto overflow-y-hidden rounded-lg">
                {/* White keys */}
                <div className="flex h-full min-w-max">
                    {whiteKeys.map((noteData, _idx) => {
                        const gender = getGenderIndicator(noteData.freq);
                        return (
                            <button
                                key={noteData.note}
                                onMouseDown={() => startNote(noteData)}
                                onMouseUp={stopNote}
                                onMouseLeave={stopNote}
                                onTouchStart={(e) => { e.preventDefault(); startNote(noteData); }}
                                onTouchEnd={stopNote}
                                className={`w-8 h-full border-r border-slate-300 transition-all relative group ${activeNote === noteData.note
                                    ? `bg-gradient-to-b ${genderRanges[gender].color}`
                                    : 'bg-slate-100 hover:bg-slate-50'
                                    }`}
                            >
                                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold ${activeNote === noteData.note ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    {noteData.note}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {/* Black keys */}
                <div className="absolute top-0 left-0 h-14">
                    {blackKeys.map((noteData) => {
                        const gender = getGenderIndicator(noteData.freq);
                        return (
                            <button
                                key={noteData.note}
                                onMouseDown={() => startNote(noteData)}
                                onMouseUp={stopNote}
                                onMouseLeave={stopNote}
                                onTouchStart={(e) => { e.preventDefault(); startNote(noteData); }}
                                onTouchEnd={stopNote}
                                className={`absolute w-5 h-full rounded-b-md transition-all shadow-lg ${activeNote === noteData.note
                                    ? `bg-gradient-to-b ${genderRanges[gender].color}`
                                    : 'bg-slate-900 hover:bg-slate-800'
                                    }`}
                                style={{ left: getBlackKeyPosition(noteData) }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Gender range legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span className="text-slate-400">Masculine (85-180 Hz)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span className="text-slate-400">Androgynous (145-220 Hz)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                    <span className="text-slate-400">Feminine (180+ Hz)</span>
                </div>
            </div>
        </div>
    );
};

export default ToneGenerator;

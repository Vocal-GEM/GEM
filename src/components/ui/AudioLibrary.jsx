import React, { useState } from 'react';

const AudioLibrary = ({ audioEngine }) => {
    const [playingNote, setPlayingNote] = useState(null);

    const playNote = (hz, label) => {
        if (audioEngine.current) {
            audioEngine.current.playFeedbackTone(hz, 1.0); // Play for 1 second
            setPlayingNote(label);
            setTimeout(() => setPlayingNote(null), 1000);
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const PITCH_TARGETS = [
        { label: "G2 (Masc Low)", hz: 98 },
        { label: "C3 (Masc Avg)", hz: 130 },
        { label: "E3 (Androg)", hz: 165 },
        { label: "A3 (Fem Low)", hz: 220 },
        { label: "C4 (Fem Avg)", hz: 261 },
        { label: "E4 (Fem High)", hz: 329 }
    ];

    const CONCEPTS = [
        { title: "Bright Resonance", desc: "Making the vocal tract smaller (like a trumpet). Think of smiling or making an 'Eeee' sound.", speech: "Bright resonance sounds sharp, buzzy, and forward. Eeeeeee." },
        { title: "Dark Resonance", desc: "Making the vocal tract larger (like a cello). Think of yawning or making an 'Oooo' sound.", speech: "Dark resonance sounds hollow, deep, and warm. Oooooooo." },
        { title: "Thin Weight", desc: "Light vocal fold contact. Sounds soft, gentle, or breathy.", speech: "Thin weight is soft and light, like a whisper." },
        { title: "Thick Weight", desc: "Heavy vocal fold contact. Sounds buzzy, loud, or strained.", speech: "Thick weight is heavy and buzzy, like a shout." }
    ];

    return (
        <div className="p-4 space-y-6 pb-20">
            {/* Pitch References */}
            <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <i data-lucide="music" className="text-blue-400"></i> Pitch Targets
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {PITCH_TARGETS.map((note) => (
                        <button
                            key={note.label}
                            onClick={() => playNote(note.hz, note.label)}
                            className={`p-4 rounded-xl border transition-all text-left ${playingNote === note.label ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                        >
                            <div className="text-xs font-bold uppercase tracking-wider opacity-70">Reference</div>
                            <div className="text-lg font-bold">{note.label.split(' ')[0]} <span className="text-xs font-normal text-slate-400">{note.hz} Hz</span></div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Vocal Concepts */}
            <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <i data-lucide="book-open" className="text-purple-400"></i> Vocal Concepts
                </h2>
                <div className="space-y-3">
                    {CONCEPTS.map((c, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-200">{c.title}</h3>
                                <button onClick={() => speak(c.speech)} className="p-2 bg-slate-700/50 hover:bg-blue-600 rounded-full transition-colors text-slate-300 hover:text-white">
                                    <i data-lucide="volume-2" className="w-4 h-4"></i>
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AudioLibrary;

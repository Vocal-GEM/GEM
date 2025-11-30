import React, { useState } from 'react';
import { BookOpen, Music, Volume2 } from 'lucide-react';

const AudioLibrary = ({ audioEngine }) => {


    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };



    const CONCEPTS = [
        { title: "Bright Resonance", desc: "Making the vocal tract smaller (like a trumpet). Think of smiling or making an 'Eeee' sound.", speech: "Bright resonance sounds sharp, buzzy, and forward. Eeeeeee." },
        { title: "Dark Resonance", desc: "Making the vocal tract larger (like a cello). Think of yawning or making an 'Oooo' sound.", speech: "Dark resonance sounds hollow, deep, and warm. Oooooooo." },
        { title: "Thin Weight", desc: "Light vocal fold contact. Sounds soft, gentle, or breathy.", speech: "Thin weight is soft and light, like a whisper." },
        { title: "Thick Weight", desc: "Heavy vocal fold contact. Sounds buzzy, loud, or strained.", speech: "Thick weight is heavy and buzzy, like a shout." }
    ];

    return (
        <div className="p-4 space-y-6 pb-20">
            {/* Pitch References */}


            {/* Vocal Concepts */}
            <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="text-purple-400" /> Vocal Concepts
                </h2>
                <div className="space-y-3">
                    {CONCEPTS.map((c, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-200">{c.title}</h3>
                                <button onClick={() => speak(c.speech)} className="p-2 bg-slate-700/50 hover:bg-blue-600 rounded-full transition-colors text-slate-300 hover:text-white">
                                    <Volume2 className="w-4 h-4" />
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

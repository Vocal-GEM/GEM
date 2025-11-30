import React, { useState } from 'react';
import { Music } from 'lucide-react';

const PitchTargets = ({ audioEngine }) => {
    const [playingNote, setPlayingNote] = useState(null);

    const playNote = (hz, label) => {
        if (audioEngine.current) {
            audioEngine.current.playFeedbackTone(hz, 1.0); // Play for 1 second
            setPlayingNote(label);
            setTimeout(() => setPlayingNote(null), 1000);
        }
    };

    const PITCH_TARGETS = [
        { label: "G2 (Masc Low)", hz: 98 },
        { label: "C3 (Masc Avg)", hz: 130 },
        { label: "E3 (Androg)", hz: 165 },
        { label: "A3 (Fem Low)", hz: 220 },
        { label: "C4 (Fem Avg)", hz: 261 },
        { label: "E4 (Fem High)", hz: 329 }
    ];

    return (
        <div className="glass-panel p-4 rounded-xl mb-4">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Music className="text-blue-400" /> Pitch Targets
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
        </div>
    );
};

export default PitchTargets;

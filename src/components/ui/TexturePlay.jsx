import React, { useState } from 'react';
import { Palette, Play } from 'lucide-react';

const TexturePlay = ({ onComplete }) => {
    const [texture, setTexture] = useState('neutral');

    const textures = {
        neutral: { label: 'Neutral', desc: 'Just your standard voice.', color: 'text-slate-400' },
        breathy: { label: 'Breathy', desc: 'Marilyn Monroe style. Lots of air.', color: 'text-blue-400' },
        fry: { label: 'Vocal Fry', desc: 'The Kardashian creak. Relaxed & low.', color: 'text-yellow-600' },
        sharp: { label: 'Sharp/Twangy', desc: 'The Nanny / Anime. Piercing.', color: 'text-pink-400' },
        warm: { label: 'Warm/Dark', desc: 'NPR Host. Lower larynx, open space.', color: 'text-indigo-400' },
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Texture Laboratory</h2>
                <p className="text-slate-400">
                    Your voice has "Color". You can paint with different brushes.
                    Don't be stuck with one brush.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(textures).map(([key, data]) => (
                    <button
                        key={key}
                        onClick={() => setTexture(key)}
                        className={`p-3 rounded-xl text-sm font-bold transition-all ${texture === key
                                ? 'bg-white text-slate-900 shadow-lg scale-105'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {data.label}
                    </button>
                ))}
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center min-h-[300px] flex flex-col justify-center">
                <h3 className={`text-4xl font-serif mb-6 transition-colors ${textures[texture].color}`}>
                    "I can't believe <br /> you said that."
                </h3>

                <p className="text-white text-lg font-bold mb-2">
                    Try it: {textures[texture].label}
                </p>
                <p className="text-slate-400 text-sm">
                    {textures[texture].desc}
                </p>

                <div className="mt-8 p-4 bg-slate-900 rounded-xl max-w-md mx-auto">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Improvisation Prompt</p>
                    <p className="text-slate-200">
                        "Tell me about your favorite breakfast... but make it <strong>{textures[texture].label}</strong>."
                    </p>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I've Explored My Textures
                </button>
            </div>
        </div>
    );
};

export default TexturePlay;

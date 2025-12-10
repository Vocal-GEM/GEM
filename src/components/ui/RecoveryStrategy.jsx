import React, { useState } from 'react';
import { AlertTriangle, Anchor, RefreshCw, Languages } from 'lucide-react';

const RecoveryStrategy = ({ onComplete }) => {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Recovery & Code Switching</h2>
                <p className="text-slate-400">
                    Your voice will "break" or "dip" back into old habits. This is normal.
                    The skill isn't "Never Failing", it's "Fast Recovery".
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" />
                        The "Pitch Dip"
                    </h3>
                    <p className="text-slate-300 text-sm mb-4">
                        <strong>What it is:</strong> Unconsciously dropping pitch/resonance at the end of sentences or when tired.
                    </p>
                    <div className="bg-slate-900 p-4 rounded-xl space-y-2 text-sm">
                        <div className="font-bold text-white">Quick Fixes:</div>
                        <ul className="list-disc list-inside text-slate-400">
                            <li>The "Mini-Cough" (Resets the Larynx)</li>
                            <li>The "Swallow" (Resets the throat)</li>
                            <li>The "H" Breath (Resets airflow)</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Languages className="text-pink-500" />
                        Code Switching
                    </h3>
                    <p className="text-slate-300 text-sm mb-4">
                        <strong>Translanguaging:</strong> It is OK (and safe!) to have different voices for different people.
                    </p>
                    <div className="bg-slate-900 p-4 rounded-xl space-y-2 text-sm">
                        <div className="font-bold text-white">Common "Modes":</div>
                        <ul className="list-disc list-inside text-slate-400">
                            <li><strong>Work Voice:</strong> Lower pitch, authoritative.</li>
                            <li><strong>Customer Service:</strong> Higher pitch, polite.</li>
                            <li><strong>Friend Voice:</strong> Relaxed, fry, slang.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-indigo-400 text-lg flex items-center gap-2">
                            <Anchor className="text-indigo-400" />
                            The Anchor Word Strategy
                        </h3>
                        <p className="text-slate-300 text-sm mt-1">
                            When you get lost, don't panic. Use your Anchor.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                    {['"So..."', '"Right..."', '"Okay..."', '"Well..."', '"Like..."', '"Umm..."'].map(word => (
                        <div key={word} className="bg-slate-900 p-3 rounded-lg text-white font-mono text-sm hover:bg-slate-800 cursor-pointer transition-colors">
                            {word}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    I Know How To Reset
                </button>
            </div>
        </div>
    );
};

export default RecoveryStrategy;

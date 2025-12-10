import React, { useState } from 'react';
import { Gamepad2, Timer, RefreshCw, ExternalLink } from 'lucide-react';

const CognitiveLoadGames = ({ onComplete }) => {
    const [letter, setLetter] = useState('?');
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);

    const generateLetter = () => {
        const letters = "ABCDEFGHIJKLMNOPRSTW";
        setLetter(letters[Math.floor(Math.random() * letters.length)]);
    };

    const toggleTimer = () => {
        if (timerRunning) {
            setTimerRunning(false);
            setTimer(0);
        } else {
            setTimerRunning(true);
            setTimer(60);
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const games = [
        {
            title: "Scattergories",
            desc: "Pick a letter. Name 10 items in a category (e.g. 'Fruits', 'Cities') starting with that letter.",
            tool: true
        },
        {
            title: "Subtract 7s",
            desc: "Start at 100. Count backwards by 7 while maintaining your voice. (100, 93, 86...)",
            tool: false
        },
        {
            title: "Animal Alphabet",
            desc: "Find an animal for every letter A-Z. (Aardvark, Bear, Cat...).",
            tool: false
        },
        {
            title: "Memory Story",
            desc: "Pick 3 random objects in the room. Tell a story connecting them.",
            tool: false
        },
        {
            title: "MadGab",
            desc: "Use a MadGab generator to read nonsense phrases until you hear the real phrase.",
            link: "https://madgab.org/"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Cognitive Load Games</h2>
                <p className="text-slate-400">
                    Your voice needs to be automatic. We train this by distracting your brain with difficult tasks while you speak.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tools Panel */}
                <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-2xl text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-sm">
                        <Gamepad2 size={18} /> Game Tools
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={generateLetter}
                            className="w-32 h-32 mx-auto bg-slate-800 rounded-2xl border-4 border-slate-700 flex items-center justify-center text-6xl font-black text-white hover:border-purple-500 hover:scale-105 transition-all shadow-xl"
                        >
                            {letter}
                        </button>
                        <div className="text-xs text-slate-500">Click for Random Letter</div>
                    </div>

                    <button
                        onClick={toggleTimer}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${timerRunning ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {timerRunning ? `${timer}s` : 'Start 60s Timer'}
                    </button>
                </div>

                {/* Games List */}
                <div className="space-y-4">
                    {games.map((game, i) => (
                        <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-white">{game.title}</h4>
                                {game.link && (
                                    <a href={game.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                            <p className="text-sm text-slate-400">{game.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I'm Ready for Real Life
                </button>
            </div>
        </div>
    );
};

export default CognitiveLoadGames;

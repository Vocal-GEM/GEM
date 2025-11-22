import React from 'react';
import { useGem } from '../../context/GemContext';

const GameHub = ({ onSelectGame }) => {
    const { stats, highScores } = useGem();

    // Level Calculation
    const totalPoints = stats.totalPoints || 0;
    const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;
    const nextLevelPoints = Math.pow(level, 2) * 100;
    const prevLevelPoints = Math.pow(level - 1, 2) * 100;
    const progress = ((totalPoints - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100;

    const games = [
        { id: 'flappy', name: 'Balloon Adventure', icon: '🎈', desc: 'Control altitude with pitch', color: 'bg-blue-500' },
        { id: 'river', name: 'Resonance River', icon: '🛶', desc: 'Steer with vocal resonance', color: 'bg-emerald-500' },
        { id: 'hopper', name: 'Cloud Hopper', icon: '🐸', desc: 'Jump with volume bursts', color: 'bg-purple-500' },
        { id: 'stairs', name: 'Pitch Staircase', icon: '🎹', desc: 'Hold steady notes to climb', color: 'bg-orange-500' }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* User Stats Header */}
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="flex justify-between items-end mb-2">
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Level</div>
                        <div className="text-4xl font-black text-white">Lvl {level}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Points</div>
                        <div className="text-xl font-mono text-blue-400">{totalPoints.toLocaleString()}</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
                    ></div>
                </div>
                <div className="text-right text-[10px] text-slate-500 mt-1">
                    {Math.floor(nextLevelPoints - totalPoints)} pts to next level
                </div>
            </div>

            {/* Game Grid */}
            <h3 className="text-lg font-bold mb-4 px-1">Arcade</h3>
            <div className="grid grid-cols-1 gap-4">
                {games.map(game => (
                    <button
                        key={game.id}
                        onClick={() => onSelectGame(game.id)}
                        className="group relative overflow-hidden bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 p-4 rounded-2xl transition-all text-left flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-xl ${game.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                            {game.icon}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-white text-lg">{game.name}</div>
                            <div className="text-xs text-slate-400">{game.desc}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">High Score</div>
                            <div className="text-xl font-mono text-white">{highScores[game.id] || 0}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameHub;

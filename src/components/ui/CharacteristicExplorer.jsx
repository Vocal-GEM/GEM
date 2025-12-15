import React, { useState } from 'react';
import { ArrowLeft, Play, ChevronRight, Sparkles, Target, MessageCircle, Dumbbell } from 'lucide-react';
import { VOICE_CHARACTERISTICS, getCharacteristic } from '../../data/VoiceCharacteristics';

const CharacteristicExplorer = ({ onClose, onStartExercise }) => {
    const [selectedChar, setSelectedChar] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, exercises, practice

    const characteristic = selectedChar ? getCharacteristic(selectedChar) : null;

    // Character Selection Grid
    if (!selectedChar) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900/50 backdrop-blur-md">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Voice Characteristics
                        </h1>
                        <p className="text-xs text-slate-400">Explore different voice styles and personalities</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-300 mb-6">
                            Your voice can wear many hats! Explore these different characteristics to expand your vocal range and find styles that feel authentic to you.
                        </p>

                        {/* Character Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {VOICE_CHARACTERISTICS.map((char) => (
                                <button
                                    key={char.id}
                                    onClick={() => setSelectedChar(char.id)}
                                    className={`
                                        relative p-6 rounded-2xl border border-white/10 text-left
                                        bg-gradient-to-br ${char.color} bg-opacity-10 
                                        hover:border-white/30 hover:scale-[1.02]
                                        transition-all duration-300 group overflow-hidden
                                    `}
                                >
                                    {/* Background glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${char.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                                    <div className="relative z-10">
                                        <div className="text-4xl mb-3">{char.emoji}</div>
                                        <h3 className="text-xl font-bold text-white mb-2">{char.name}</h3>
                                        <p className="text-sm text-white/70 line-clamp-2">{char.description}</p>

                                        <div className="mt-4 flex items-center text-xs text-white/50 group-hover:text-white/80 transition-colors">
                                            Explore <ChevronRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Info Card */}
                        <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-white mb-2">💡 Why explore different characteristics?</h3>
                            <ul className="text-sm text-slate-400 space-y-2">
                                <li>• <strong className="text-white">Flexibility</strong>: Develop control to shift between styles naturally</li>
                                <li>• <strong className="text-white">Authenticity</strong>: Find what feels most "you" in different contexts</li>
                                <li>• <strong className="text-white">Confidence</strong>: Have the right voice for every situation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Character Detail View
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className={`p-4 border-b border-white/10 bg-gradient-to-r ${characteristic.color} bg-opacity-20`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedChar(null)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white/80" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{characteristic.emoji}</span>
                            <h1 className="text-xl font-bold text-white">{characteristic.name} Voice</h1>
                        </div>
                        <p className="text-xs text-white/60">{characteristic.description}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                    {[
                        { id: 'overview', label: 'Overview', icon: Target },
                        { id: 'phrases', label: 'Phrases', icon: MessageCircle },
                        { id: 'exercises', label: 'Exercises', icon: Dumbbell }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2
                                ${activeTab === tab.id
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/60 hover:text-white/80 hover:bg-white/10'}
                                transition-colors
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Key Traits */}
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-400" />
                                    Key Traits
                                </h3>
                                <div className="grid gap-3">
                                    {characteristic.keyTraits.map((trait, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                                        >
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${characteristic.color}`}></div>
                                            <span className="text-slate-300">{trait}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Acoustic Targets */}
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold text-white mb-4">🎯 Acoustic Targets</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl">
                                        <div className="text-xs text-slate-400 uppercase mb-1">Resonance</div>
                                        <div className="text-white font-bold">{characteristic.acousticTargets.resonanceBrightness.label}</div>
                                        <div className="text-xs text-slate-500">{characteristic.acousticTargets.resonanceBrightness.min}-{characteristic.acousticTargets.resonanceBrightness.max}%</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl">
                                        <div className="text-xs text-slate-400 uppercase mb-1">Pitch Variation</div>
                                        <div className="text-white font-bold">{characteristic.acousticTargets.pitchVariation.label}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl">
                                        <div className="text-xs text-slate-400 uppercase mb-1">Onset Type</div>
                                        <div className="text-white font-bold capitalize">{characteristic.acousticTargets.onsetType}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl">
                                        <div className="text-xs text-slate-400 uppercase mb-1">Weight</div>
                                        <div className="text-white font-bold">{characteristic.acousticTargets.weight.label}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Phrases Tab */}
                    {activeTab === 'phrases' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-400 text-sm mb-4">
                                Try reading these phrases in the {characteristic.name.toLowerCase()} style:
                            </p>
                            {characteristic.examplePhrases.map((phrase, i) => (
                                <div
                                    key={i}
                                    className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-white/20 transition-colors"
                                >
                                    <p className="text-lg text-white font-medium">"{phrase}"</p>
                                    <button
                                        className="mt-3 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                                        onClick={() => {
                                            // Could trigger TTS or recording here
                                        }}
                                    >
                                        <Play className="w-3 h-3" /> Try this phrase
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Exercises Tab */}
                    {activeTab === 'exercises' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-400 text-sm mb-4">
                                Practice exercises to develop your {characteristic.name.toLowerCase()} voice:
                            </p>
                            {characteristic.exercises.map((exercise, i) => (
                                <div
                                    key={exercise.id}
                                    className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{exercise.title}</h4>
                                        <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                                            {exercise.duration}s
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-4">{exercise.instructions}</p>
                                    <button
                                        onClick={() => onStartExercise && onStartExercise(exercise)}
                                        className={`
                                            w-full py-3 rounded-xl font-bold
                                            bg-gradient-to-r ${characteristic.color} 
                                            text-white hover:opacity-90 transition-opacity
                                            flex items-center justify-center gap-2
                                        `}
                                    >
                                        <Play className="w-4 h-4" />
                                        Start Exercise
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacteristicExplorer;

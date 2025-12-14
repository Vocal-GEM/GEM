import { useState, useCallback } from 'react';
import { Mic, Search, Sparkles, PlayCircle, Info, X } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { processUserInput, getAllTensionAreas } from '../../utils/tensionReliefEngine';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';

const TensionReliefPanel = () => {
    const [input, setInput] = useState('');
    const [recommendations, setRecommendations] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const { navigate } = useNavigation();
    const languageContext = useLanguage();
    const t = languageContext?.t || ((k) => k);

    // Handle speech recognition result
    const handleSpeechResult = useCallback((transcript) => {
        setInput(transcript);
        // Auto-process when voice input completes
        setTimeout(() => {
            handleAnalyze(transcript);
        }, 300);
    }, []);

    const {
        startPushToTalk,
        stopPushToTalk,
        pushToTalkActive,
        isSupported: speechSupported
    } = useSpeechRecognition(handleSpeechResult);

    const handleAnalyze = (textInput = input) => {
        if (!textInput.trim()) return;

        const result = processUserInput(textInput);
        setRecommendations(result);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    };

    const handleStartExercise = (exercise) => {
        // Navigate to practice mode with the specific exercise
        // For now, just show details
        setSelectedExercise(exercise);
    };

    const tensionAreas = getAllTensionAreas().filter(area => area.key !== 'whole');

    return (
        <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Tension Relief</h2>
                        <p className="text-sm text-slate-400">Tell me where you feel tense</p>
                    </div>
                </div>

                {/* Input Section */}
                <div className="relative">
                    <div className="glass-panel rounded-2xl flex items-center gap-2 p-2">
                        <Search className="w-5 h-5 text-slate-500 ml-2" />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., 'my jaw feels tight' or 'neck and shoulders'"
                            className="flex-1 bg-transparent border-none outline-none px-2 text-white placeholder-slate-500 h-10"
                        />

                        {speechSupported && (
                            <button
                                onMouseDown={startPushToTalk}
                                onMouseUp={stopPushToTalk}
                                onTouchStart={startPushToTalk}
                                onTouchEnd={stopPushToTalk}
                                className={`p-3 rounded-xl transition-all ${pushToTalkActive
                                    ? 'bg-red-500 text-white scale-110'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                title="Hold to speak"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        )}

                        <button
                            onClick={() => handleAnalyze()}
                            disabled={!input.trim()}
                            className="px-6 py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Find Exercises
                        </button>
                    </div>

                    {speechSupported && (
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Type or hold the mic button to speak
                        </p>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!recommendations ? (
                    // Quick suggestions
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Common Tension Areas</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {tensionAreas.map((area) => (
                                <button
                                    key={area.key}
                                    onClick={() => {
                                        setInput(area.name);
                                        handleAnalyze(area.name);
                                    }}
                                    className="glass-panel p-4 rounded-xl text-left hover:bg-white/10 transition-all group"
                                >
                                    <div className="font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                                        {area.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {area.keywords.slice(0, 2).join(', ')}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Info Box */}
                        <div className="mt-8 glass-panel rounded-2xl p-6 border border-blue-500/20">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-blue-300 mb-2">How it works</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        Describe where you feel tension in your body, and I&apos;ll recommend specific exercises and stretches
                                        to help release it. Addressing physical tension is crucial for healthy, sustainable voice work.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : recommendations.success ? (
                    // Show recommendations
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                    {recommendations.detectedAreas.join(' • ')}
                                </div>
                                <h3 className="text-2xl font-bold">{recommendations.message}</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setRecommendations(null);
                                    setInput('');
                                }}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Recommendations */}
                        {recommendations.recommendations.map((rec, idx) => (
                            <div key={idx} className="space-y-4">
                                {/* Area Description */}
                                <div className="glass-panel rounded-xl p-4 border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">{rec.area}</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed italic">
                                        {rec.description}
                                    </p>
                                </div>

                                {/* Exercises */}
                                <div className="grid grid-cols-1 gap-3">
                                    {rec.exercises.map((exercise) => (
                                        <div
                                            key={exercise.id}
                                            className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h5 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                            {exercise.title}
                                                        </h5>
                                                        <span className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-400">
                                                            {exercise.difficulty}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {exercise.duration}s
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 leading-relaxed">
                                                        {exercise.instructions}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleStartExercise(exercise)}
                                                        className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 transition-colors"
                                                        title="View details"
                                                    >
                                                        <Info className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('practice')}
                                                        className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
                                                        title="Go to practice mode"
                                                    >
                                                        <PlayCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Exercise Name Search Results */}
                        {recommendations.exerciseMatches && recommendations.exerciseMatches.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                                        {recommendations.searchType === 'exercise' ? 'Matching Exercises' : 'Related Exercises'}
                                    </h4>
                                    <span className="text-xs text-slate-500">
                                        {recommendations.exerciseMatches.length} result{recommendations.exerciseMatches.length > 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {recommendations.exerciseMatches.map((match, idx) => (
                                        <div
                                            key={idx}
                                            className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h5 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                            {match.exercise.title}
                                                        </h5>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${match.matchType === 'exact' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            match.matchType === 'relevant' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-slate-700 text-slate-400'
                                                            }`}>
                                                            {match.matchType}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-400">
                                                            {match.exercise.difficulty}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {match.exercise.duration}s
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mb-1">
                                                        {match.exercise.category}
                                                    </p>
                                                    <p className="text-sm text-slate-400 leading-relaxed">
                                                        {match.exercise.instructions}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleStartExercise(match.exercise)}
                                                        className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
                                                        title="View details"
                                                    >
                                                        <Info className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('practice')}
                                                        className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 transition-colors"
                                                        title="Go to practice mode"
                                                    >
                                                        <PlayCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // No results
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="glass-panel rounded-2xl p-8 max-w-md text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No matches found</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                {recommendations.message}
                            </p>
                            {recommendations.suggestions && (
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {recommendations.suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setInput(suggestion);
                                                handleAnalyze(suggestion);
                                            }}
                                            className="px-4 py-2 bg-slate-800 rounded-full text-sm hover:bg-slate-700 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm p-6 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-1 bg-emerald-500/20 rounded-full text-emerald-400 font-bold uppercase tracking-wider">
                                        {selectedExercise.category}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-400">
                                        {selectedExercise.difficulty}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold">{selectedExercise.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</h4>
                                <p className="text-slate-300 leading-relaxed">{selectedExercise.instructions}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Duration</h4>
                                <p className="text-slate-300">{selectedExercise.duration} seconds</p>
                            </div>

                            {selectedExercise.goals && selectedExercise.goals.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Goals</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedExercise.goals.map((goal, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">
                                                {goal}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedExercise(null);
                                    navigate('practice');
                                }}
                                className="w-full py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 mt-6"
                            >
                                <PlayCircle className="w-5 h-5" />
                                Go to Practice Mode
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TensionReliefPanel;

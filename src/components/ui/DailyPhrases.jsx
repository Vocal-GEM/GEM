import React, { useState } from 'react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

const SUGGESTIONS = [
    "How are you doing today?",
    "Can I get a coffee, please?",
    "Did you walk the dog?",
    "I'm going for a run.",
    "Can everyone see my screen?",
    "Good morning!",
    "Where is the bathroom?"
];

const DailyPhrases = ({ onComplete }) => {
    const [phrases, setPhrases] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const addPhrase = (text) => {
        if (text && !phrases.includes(text)) {
            setPhrases([...phrases, text]);
            setInputValue("");
        }
    };

    const removePhrase = (text) => {
        setPhrases(phrases.filter(p => p !== text));
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">My Daily Phrases</h2>
                <p className="text-slate-400">
                    Practice with the words YOU actually say. Create a list of 5-10 phrases you use every day.
                </p>
            </div>

            <div className="flex gap-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a phrase (e.g. 'One latte please')..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addPhrase(inputValue)}
                />
                <button
                    onClick={() => addPhrase(inputValue)}
                    disabled={!inputValue}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl disabled:opacity-50"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Suggestions */}
            {phrases.length === 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => addPhrase(s)}
                                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors"
                            >
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {phrases.length > 0 && <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your List</h4>}
                {phrases.map((phrase, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-800 rounded-xl border border-slate-700 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="text-purple-400" size={20} />
                            <span className="text-lg text-white font-medium">{phrase}</span>
                        </div>
                        <button
                            onClick={() => removePhrase(phrase)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {phrases.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                    Your list is empty. Add phrases above to start building your custom practice routine.
                </div>
            )}

            <div className="flex justify-center pt-8">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    Save List & Complete
                </button>
            </div>
        </div>
    );
};

export default DailyPhrases;

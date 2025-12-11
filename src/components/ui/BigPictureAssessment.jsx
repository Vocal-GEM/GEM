import { useState } from 'react';
import { Edit3, Save } from 'lucide-react';

const LIST_TYPES = [
    { id: 'audit', label: 'Voice Audit List', desc: 'Your recorded "Normal", "Angry", "Sleepy" voices.' },
    { id: 'journal', label: 'Sound Journal', desc: 'The experimental sounds you made.' },
    { id: 'inspiration', label: 'Inspiration Board', desc: 'The list of familiar voices you admire.' }
];

const BigPictureAssessment = ({ onComplete }) => {
    const [selectedList, setSelectedList] = useState('audit');
    const [observations, setObservations] = useState([]);
    const [currentObservation, setCurrentObservation] = useState({ item: '', analysis: '' });

    const handleAdd = () => {
        if (!currentObservation.item) return;
        setObservations([...observations, { ...currentObservation, listType: selectedList }]);
        setCurrentObservation({ item: '', analysis: '' });
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">The Big Picture Assessment</h2>
                <p className="text-slate-400">
                    Now that you understand Pitch, Weight, and Resonance, let&apos;s revisit your lists from Week 1.
                    Update your descriptions using this new vocabulary.
                </p>
            </div>

            {/* List Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {LIST_TYPES.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedList(type.id)}
                        className={`flex flex-col items-start p-4 rounded-xl border min-w-[200px] transition-all ${selectedList === type.id
                            ? 'bg-purple-900/30 border-purple-500 ring-1 ring-purple-500'
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                            }`}
                    >
                        <span className={`font-bold ${selectedList === type.id ? 'text-purple-300' : 'text-white'}`}>
                            {type.label}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">{type.desc}</span>
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Edit3 size={18} /> New Observation ({LIST_TYPES.find(t => t.id === selectedList).label})
                </h3>

                <div>
                    <label className="block text-slate-400 text-sm mb-1">Item Name (e.g. &quot;My Angry Voice&quot; or &quot;Beyoncé&quot;)</label>
                    <input
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        value={currentObservation.item}
                        onChange={(e) => setCurrentObservation({ ...currentObservation, item: e.target.value })}
                        placeholder="Name of the voice/sound..."
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-sm mb-1">Analysis (Pitch / Weight / Resonance)</label>
                    <textarea
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none h-24"
                        value={currentObservation.analysis}
                        onChange={(e) => setCurrentObservation({ ...currentObservation, analysis: e.target.value })}
                        placeholder={`E.g. "Technically high pitch, but very heavy weight. Dark resonance."`}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleAdd}
                        disabled={!currentObservation.item}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-2"
                    >
                        <Save size={18} /> Save Observation
                    </button>
                </div>
            </div>

            {/* Reflection List */}
            {observations.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-slate-400 font-bold uppercase text-xs tracking-wider">Your Updated Observations</h4>
                    {observations.map((obs, idx) => (
                        <div key={idx} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                                        {LIST_TYPES.find(t => t.id === obs.listType).label}
                                    </span>
                                    <span className="text-white font-bold">{obs.item}</span>
                                </div>
                                <p className="text-slate-400 text-sm">{obs.analysis}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center pt-6">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center gap-2"
                >
                    Complete Exercise
                </button>
            </div>
        </div>
    );
};

export default BigPictureAssessment;

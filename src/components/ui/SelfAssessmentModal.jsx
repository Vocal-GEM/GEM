import { useState } from 'react';
import { Save, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { historyService } from '../../utils/historyService';

const SelfAssessmentModal = ({ onClose, sessionData }) => {

    // const { t } = useTranslation(); // t is unused, removing line
    const [effort, setEffort] = useState(null); // 1 (Easy) to 5 (Hard)
    const [satisfaction, setSatisfaction] = useState(null); // 1 (Bad) to 3 (Good)
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save to history service
            await historyService.addSession({
                ...sessionData,
                userRating: satisfaction,
                effortLevel: effort,
                notes: notes,
                timestamp: new Date().toISOString()
            });
            onClose();
        } catch (error) {
            console.error("Failed to save session:", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-1">Session Complete!</h2>
                    <p className="text-white/80 text-sm">Great job putting in the work.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Q1: How did it feel? (Effort) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            How much effort did it take?
                        </label>
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setEffort(level)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${effort === level
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase font-bold">
                            <span>Effortless</span>
                            <span>Strained</span>
                        </div>
                    </div>

                    {/* Q2: Are you happy with the sound? */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            How did you sound?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setSatisfaction(1)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${satisfaction === 1 ? 'bg-red-500/20 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <ThumbsDown className={satisfaction === 1 ? 'text-red-400' : 'text-slate-500'} />
                                <span className="text-xs">Off</span>
                            </button>
                            <button
                                onClick={() => setSatisfaction(2)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${satisfaction === 2 ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <Meh className={satisfaction === 2 ? 'text-amber-400' : 'text-slate-500'} />
                                <span className="text-xs">Okay</span>
                            </button>
                            <button
                                onClick={() => setSatisfaction(3)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${satisfaction === 3 ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <ThumbsUp className={satisfaction === 3 ? 'text-emerald-400' : 'text-slate-500'} />
                                <span className="text-xs">Great</span>
                            </button>
                        </div>
                    </div>

                    {/* Notes (Optional) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Quick Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-violet-500 custom-scrollbar"
                            placeholder="What went well? What needs work?"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-950/50 border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !effort || !satisfaction}
                        className="flex-2 w-2/3 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? 'Saving...' : <><Save size={18} /> Save Session</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelfAssessmentModal;

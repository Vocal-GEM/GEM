import { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY_LEVELS, FOCUS_AREAS } from '../../data/PracticeCardsData';
import { usePracticeCards } from '../../context/PracticeCardsContext';

const CardSetEditor = ({ existingSet, onClose, onSave }) => {
    const { createCardSet, updateCardSet } = usePracticeCards();
    const { t } = useTranslation();
    const isEditing = !!existingSet;

    // Form State
    const [name, setName] = useState(existingSet?.name || '');
    const [description, setDescription] = useState(existingSet?.description || '');
    const [difficulty, setDifficulty] = useState(existingSet?.difficulty || 'beginner');
    const [cards, setCards] = useState(
        existingSet?.cards?.map(c => ({ ...c })) || [{ id: `new-1`, text: '', focus: 'general' }]
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Add new card
    const addCard = () => {
        setCards([...cards, { id: `new-${Date.now()}`, text: '', focus: 'general' }]);
    };

    // Remove card
    const removeCard = (index) => {
        if (cards.length <= 1) return;
        setCards(cards.filter((_, i) => i !== index));
    };

    // Update card
    const updateCard = (index, field, value) => {
        const newCards = [...cards];
        newCards[index] = { ...newCards[index], [field]: value };
        setCards(newCards);
    };

    // Validate
    const isValid = () => {
        if (!name.trim()) return false;
        if (cards.length === 0) return false;
        if (cards.every(c => !c.text.trim())) return false;
        return true;
    };

    // Save
    const handleSave = async () => {
        if (!isValid()) {
            setError('Please fill in the set name and at least one card');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const setData = {
                name: name.trim(),
                description: description.trim(),
                difficulty,
                cards: cards.filter(c => c.text.trim())
            };

            if (isEditing) {
                await updateCardSet(existingSet.id, setData);
            } else {
                await createCardSet(setData);
            }

            onSave();
        } catch (err) {
            console.error('Error saving card set:', err);
            setError('Failed to save card set. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">
                        {isEditing ? t('practiceCards.editSet') : t('practiceCards.createSet')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {t('practiceCards.editor.setName')} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Practice Set"
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {t('practiceCards.editor.description')}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description for this set"
                            rows={2}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                        />
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {t('practiceCards.editor.difficultyLevel')}
                        </label>
                        <div className="flex gap-2">
                            {Object.entries(DIFFICULTY_LEVELS).map(([key, { label, icon, color }]) => (
                                <button
                                    key={key}
                                    onClick={() => setDifficulty(key)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${difficulty === key
                                        ? 'text-white'
                                        : 'bg-slate-800/50 text-slate-400 hover:text-white'
                                        }`}
                                    style={{
                                        backgroundColor: difficulty === key ? color : undefined
                                    }}
                                >
                                    {icon} {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cards */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Cards *
                        </label>
                        <div className="space-y-2">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id || index}
                                    className="flex gap-2 items-start bg-slate-800/30 rounded-lg p-2"
                                >
                                    <div className="p-2 text-slate-600">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <textarea
                                            value={card.text}
                                            onChange={(e) => updateCard(index, 'text', e.target.value)}
                                            placeholder="Enter card text..."
                                            rows={2}
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                                        />
                                        <select
                                            value={card.focus}
                                            onChange={(e) => updateCard(index, 'focus', e.target.value)}
                                            className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                        >
                                            {Object.entries(FOCUS_AREAS).map(([key, { label }]) => (
                                                <option key={key} value={key}>{label} Focus</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => removeCard(index)}
                                        disabled={cards.length <= 1}
                                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-500/20 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCard}
                            className="mt-2 w-full py-2 rounded-lg border border-dashed border-white/20 hover:border-violet-500/50 text-slate-400 hover:text-violet-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <Plus className="w-3 h-3" />
                            {t('practiceCards.editor.addCard')}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-bold transition-all"
                    >
                        {t('practiceCards.editor.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isValid() || isSaving}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditing ? t('practiceCards.editor.update') : t('practiceCards.editor.create')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardSetEditor;

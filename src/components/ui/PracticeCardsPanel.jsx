import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, ChevronLeft, Play, Activity,
    Star, Trash2, Edit3, Check, X, Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePracticeCards } from '../../context/PracticeCardsContext';
import { DIFFICULTY_LEVELS, FOCUS_AREAS } from '../../data/PracticeCardsData';
import PracticeCardItem from './PracticeCardItem';
import CardSetEditor from './CardSetEditor';
import CardActivityModal from './CardActivityModal';
import ResizablePanel from './ResizablePanel';

const PracticeCardsPanel = ({ onClose, embedded = false }) => {
    const {
        cardSets,
        customCardSets,
        defaultCardSets,
        activeCardSet,
        activeCard,
        practiceSummary,
        isLoading,
        selectCardSet,
        selectCard,
        deleteCardSet
    } = usePracticeCards();

    const { t } = useTranslation();

    // View State
    const [view, setView] = useState('sets'); // 'sets', 'cards', 'practice'
    const [tab, setTab] = useState('default'); // 'default', 'custom'
    const [showEditor, setShowEditor] = useState(false);
    const [editingSet, setEditingSet] = useState(null);
    const [showActivity, setShowActivity] = useState(false);
    const [activityCardId, setActivityCardId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Filter by difficulty
    const [difficultyFilter, setDifficultyFilter] = useState('all');

    const displayedSets = tab === 'default'
        ? defaultCardSets
        : customCardSets;

    const filteredSets = difficultyFilter === 'all'
        ? displayedSets
        : displayedSets.filter(s => s.difficulty === difficultyFilter);

    // Handle card set selection
    const handleSelectSet = (setId) => {
        selectCardSet(setId);
        setView('cards');
    };

    // Handle going back
    const handleBack = () => {
        if (view === 'practice') {
            setView('cards');
            selectCard(null);
        } else if (view === 'cards') {
            setView('sets');
            selectCardSet(null);
        }
    };

    // Handle card selection for practice
    const handleSelectCard = (cardId) => {
        selectCard(cardId);
        setView('practice');
    };

    // Handle activity view
    const handleViewActivity = (cardId) => {
        setActivityCardId(cardId);
        setShowActivity(true);
    };

    // Handle delete
    const handleDelete = async (setId) => {
        if (confirmDelete === setId) {
            await deleteCardSet(setId);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(setId);
            setTimeout(() => setConfirmDelete(null), 3000);
        }
    };

    // Handle edit
    const handleEdit = (set) => {
        setEditingSet(set);
        setShowEditor(true);
    };

    // ============================================
    // Render: Card Sets List
    // ============================================
    const renderSetsList = () => (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                <button
                    onClick={() => setTab('default')}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all ${tab === 'default'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Layers className="w-3 h-3 inline mr-1" />
                    {t('practiceCards.defaultSets')}
                </button>
                <button
                    onClick={() => setTab('custom')}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all ${tab === 'custom'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Star className="w-3 h-3 inline mr-1" />
                    {t('practiceCards.mySets')} ({customCardSets.length})
                </button>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                <button
                    onClick={() => setDifficultyFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${difficultyFilter === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white'
                        }`}
                >
                    {t('practiceCards.allLevels')}
                </button>
                {Object.entries(DIFFICULTY_LEVELS).map(([key, { label, icon }]) => (
                    <button
                        key={key}
                        onClick={() => setDifficultyFilter(key)}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${difficultyFilter === key
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            {/* Sets List */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {filteredSets.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        {tab === 'custom' ? (
                            <>
                                <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">{t('practiceCards.noCustomSets')}</p>
                                <p className="text-xs mt-1">{t('practiceCards.createYourOwn')}</p>
                            </>
                        ) : (
                            <p className="text-sm">{t('practiceCards.noSetsMatch')}</p>
                        )}
                    </div>
                ) : (
                    filteredSets.map(set => (
                        <div
                            key={set.id}
                            className="group bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 hover:border-violet-500/30 p-4 transition-all cursor-pointer"
                            onClick={() => handleSelectSet(set.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white truncate">{set.name}</h3>
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{
                                                backgroundColor: `${DIFFICULTY_LEVELS[set.difficulty]?.color}20`,
                                                color: DIFFICULTY_LEVELS[set.difficulty]?.color
                                            }}
                                        >
                                            {DIFFICULTY_LEVELS[set.difficulty]?.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-1">{set.description}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {set.cards?.length || 0} cards
                                    </p>
                                </div>

                                {/* Actions for custom sets */}
                                {!set.isDefault && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(set); }}
                                            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(set.id); }}
                                            className={`p-1.5 rounded-lg transition-all ${confirmDelete === set.id
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                                                }`}
                                        >
                                            {confirmDelete === set.id ? <Check className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create New Button */}
            <button
                onClick={() => { setEditingSet(null); setShowEditor(true); }}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
            >
                <Plus className="w-4 h-4" />
                {t('practiceCards.createSet')}
            </button>
        </div>
    );

    // ============================================
    // Render: Cards Grid
    // ============================================
    const renderCardsGrid = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleBack}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{activeCardSet?.name}</h3>
                    <p className="text-xs text-slate-400">
                        {activeCardSet?.cards?.length || 0} cards •
                        <span style={{ color: DIFFICULTY_LEVELS[activeCardSet?.difficulty]?.color }}>
                            {' '}{DIFFICULTY_LEVELS[activeCardSet?.difficulty]?.label}
                        </span>
                    </p>
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {activeCardSet?.cards?.map((card, index) => (
                    <PracticeCardItem
                        key={card.id}
                        card={card}
                        index={index + 1}
                        onSelect={() => handleSelectCard(card.id)}
                        onViewActivity={() => handleViewActivity(card.id)}
                    />
                ))}
            </div>
        </div>
    );

    // ============================================
    // Render: Practice View
    // ============================================
    const renderPracticeView = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleBack}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    <p className="text-xs text-slate-500">{activeCardSet?.name}</p>
                    <p className="text-[10px] text-slate-600">
                        Card {activeCardSet?.cards?.findIndex(c => c.id === activeCard?.id) + 1} of {activeCardSet?.cards?.length}
                    </p>
                </div>
            </div>

            {/* Main Card Display */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-lg bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-8 shadow-2xl">
                    {/* Focus Badge */}
                    {activeCard?.focus && (
                        <div
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                            style={{
                                backgroundColor: `${FOCUS_AREAS[activeCard.focus]?.color}20`,
                                color: FOCUS_AREAS[activeCard.focus]?.color
                            }}
                        >
                            {FOCUS_AREAS[activeCard.focus]?.label} Focus
                        </div>
                    )}

                    {/* Card Text */}
                    <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed">
                        {activeCard?.text}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-4">
                <button
                    onClick={() => {
                        const cards = activeCardSet?.cards || [];
                        const currentIdx = cards.findIndex(c => c.id === activeCard?.id);
                        if (currentIdx > 0) {
                            selectCard(cards[currentIdx - 1].id);
                        }
                    }}
                    disabled={activeCardSet?.cards?.findIndex(c => c.id === activeCard?.id) === 0}
                    className="flex-1 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {t('practiceCards.previous')}
                </button>
                <button
                    onClick={() => handleViewActivity(activeCard?.id)}
                    className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                    <Activity className="w-5 h-5" />
                </button>
                <button
                    onClick={() => {
                        const cards = activeCardSet?.cards || [];
                        const currentIdx = cards.findIndex(c => c.id === activeCard?.id);
                        if (currentIdx < cards.length - 1) {
                            selectCard(cards[currentIdx + 1].id);
                        }
                    }}
                    disabled={activeCardSet?.cards?.findIndex(c => c.id === activeCard?.id) === (activeCardSet?.cards?.length || 0) - 1}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {t('practiceCards.next')}
                </button>
            </div>
        </div>
    );

    // ============================================
    // Main Content
    // ============================================
    const content = (
        <div className="bg-slate-900 w-full h-full p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{t('practiceCards.title')}</h2>
                        {practiceSummary && (
                            <p className="text-[10px] text-slate-400">
                                {practiceSummary.totalPractices} practices • {practiceSummary.uniqueCardsUsed} cards used
                            </p>
                        )}
                    </div>
                </div>
                {!embedded && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 relative z-10">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {view === 'sets' && renderSetsList()}
                        {view === 'cards' && renderCardsGrid()}
                        {view === 'practice' && renderPracticeView()}
                    </>
                )}
            </div>

            {/* Editor Modal */}
            {showEditor && (
                <CardSetEditor
                    existingSet={editingSet}
                    onClose={() => { setShowEditor(false); setEditingSet(null); }}
                    onSave={() => { setShowEditor(false); setEditingSet(null); setTab('custom'); }}
                />
            )}

            {/* Activity Modal */}
            {showActivity && (
                <CardActivityModal
                    cardId={activityCardId}
                    onClose={() => { setShowActivity(false); setActivityCardId(null); }}
                />
            )}
        </div>
    );

    if (embedded) return content;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <ResizablePanel
                className="relative"
                defaultWidth={550}
                defaultHeight={700}
                minWidth={400}
                minHeight={500}
            >
                {content}
            </ResizablePanel>
        </div>
    );
};

export default PracticeCardsPanel;

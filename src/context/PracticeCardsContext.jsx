import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_CARD_SETS, getAllCardSets, findCardById } from '../data/PracticeCardsData';
import { practiceCardsService } from '../services/practiceCardsService';

const PracticeCardsContext = createContext();

export const usePracticeCards = () => {
    const context = useContext(PracticeCardsContext);
    if (!context) {
        throw new Error('usePracticeCards must be used within a PracticeCardsProvider');
    }
    return context;
};

export const PracticeCardsProvider = ({ children }) => {
    // Card Sets State
    const [customCardSets, setCustomCardSets] = useState([]);
    const [activeCardSet, setActiveCardSet] = useState(null);
    const [activeCard, setActiveCard] = useState(null);

    // Practice Session State
    const [isPracticing, setIsPracticing] = useState(false);
    const [practiceStartTime, setPracticeStartTime] = useState(null);

    // Recording Session State (for tracking cards during recording)
    const [isRecordingSession, setIsRecordingSession] = useState(false);
    const recordingSessionRef = useRef({
        startTime: null,
        cardsUsed: [] // [{cardId, setId, startMs}]
    });

    // Activity Cache
    const [cardActivities, setCardActivities] = useState({});
    const [practiceSummary, setPracticeSummary] = useState(null);

    // Loading/Error State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Combined card sets (default + custom)
    const cardSets = getAllCardSets(customCardSets);

    // Load custom sets and summary on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [sets, summary] = await Promise.all([
                    practiceCardsService.getCustomCardSets(),
                    practiceCardsService.getPracticeSummary()
                ]);
                setCustomCardSets(sets);
                setPracticeSummary(summary);
                setError(null);
            } catch (err) {
                console.error('[PracticeCardsContext] Error loading data:', err);
                setError(err.message || 'Failed to load practice cards');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // ============================================
    // Card Set Selection
    // ============================================

    const selectCardSet = useCallback((setId) => {
        if (!setId) {
            setActiveCardSet(null);
            setActiveCard(null);
            return;
        }
        const set = cardSets.find(s => s.id === setId);
        if (set) {
            setActiveCardSet(set);
            setActiveCard(null); // Clear card when switching sets
        }
    }, [cardSets]);

    const selectCard = useCallback((cardId) => {
        if (!cardId) {
            setActiveCard(null);
            return;
        }
        const card = findCardById(cardId, customCardSets);
        if (card) {
            setActiveCard(card);
            // Auto-select the set if not already selected
            if (!activeCardSet || activeCardSet.id !== card.setId) {
                const set = cardSets.find(s => s.id === card.setId);
                if (set) setActiveCardSet(set);
            }
        }
    }, [customCardSets, activeCardSet, cardSets]);

    // ============================================
    // Custom Card Set CRUD
    // ============================================

    const createCardSet = useCallback(async (cardSetData) => {
        try {
            const id = await practiceCardsService.saveCustomCardSet(cardSetData);
            const sets = await practiceCardsService.getCustomCardSets();
            setCustomCardSets(sets);
            return id;
        } catch (err) {
            console.error('[PracticeCardsContext] Error creating card set:', err);
            throw err;
        }
    }, []);

    const updateCardSet = useCallback(async (setId, updates) => {
        try {
            await practiceCardsService.updateCustomCardSet(setId, updates);
            const sets = await practiceCardsService.getCustomCardSets();
            setCustomCardSets(sets);
            // Update active set if it was the one edited
            if (activeCardSet?.id === setId) {
                const updatedSet = sets.find(s => s.id === setId);
                if (updatedSet) setActiveCardSet(updatedSet);
            }
        } catch (err) {
            console.error('[PracticeCardsContext] Error updating card set:', err);
            throw err;
        }
    }, [activeCardSet]);

    const deleteCardSet = useCallback(async (setId) => {
        try {
            await practiceCardsService.deleteCustomCardSet(setId);
            const sets = await practiceCardsService.getCustomCardSets();
            setCustomCardSets(sets);
            // Clear active set if it was deleted
            if (activeCardSet?.id === setId) {
                setActiveCardSet(null);
                setActiveCard(null);
            }
        } catch (err) {
            console.error('[PracticeCardsContext] Error deleting card set:', err);
            throw err;
        }
    }, [activeCardSet]);

    // ============================================
    // Practice Tracking
    // ============================================

    const startCardPractice = useCallback((cardId) => {
        setIsPracticing(true);
        setPracticeStartTime(Date.now());
        const card = findCardById(cardId, customCardSets);
        if (card) {
            setActiveCard(card);
        }
    }, [customCardSets]);

    const endCardPractice = useCallback(async (recordingId = null) => {
        if (!isPracticing || !activeCard) {
            setIsPracticing(false);
            return;
        }

        const durationMs = practiceStartTime ? Date.now() - practiceStartTime : 0;

        // Only log if practiced for > 1 second
        if (durationMs >= 1000) {
            try {
                await practiceCardsService.logCardActivity({
                    cardId: activeCard.id,
                    setId: activeCard.setId,
                    recordingId,
                    durationMs
                });

                // Refresh activity for this card
                const activity = await practiceCardsService.getCardActivity(activeCard.id);
                setCardActivities(prev => ({
                    ...prev,
                    [activeCard.id]: activity
                }));

                // Refresh summary
                const summary = await practiceCardsService.getPracticeSummary();
                setPracticeSummary(summary);
            } catch (err) {
                console.error('[PracticeCardsContext] Error logging activity:', err);
            }
        }

        setIsPracticing(false);
        setPracticeStartTime(null);
    }, [isPracticing, activeCard, practiceStartTime]);

    const getCardActivity = useCallback(async (cardId) => {
        // Check cache first
        if (cardActivities[cardId]) {
            return cardActivities[cardId];
        }

        try {
            const activity = await practiceCardsService.getCardActivity(cardId);
            setCardActivities(prev => ({
                ...prev,
                [cardId]: activity
            }));
            return activity;
        } catch (err) {
            console.error('[PracticeCardsContext] Error getting activity:', err);
            return { totalPractices: 0, savedRecordings: 0, recentActivity: [] };
        }
    }, [cardActivities]);

    const getRecordingsForCard = useCallback(async (cardId) => {
        try {
            return await practiceCardsService.getRecordingsForCard(cardId);
        } catch (err) {
            console.error('[PracticeCardsContext] Error getting recordings:', err);
            return [];
        }
    }, []);

    // ============================================
    // Recording Session Management
    // ============================================

    const startRecordingSession = useCallback(() => {
        setIsRecordingSession(true);
        recordingSessionRef.current = {
            startTime: Date.now(),
            cardsUsed: []
        };
        // Track current active card if any
        if (activeCard) {
            recordingSessionRef.current.cardsUsed.push({
                cardId: activeCard.id,
                setId: activeCard.setId,
                startMs: 0
            });
        }
    }, [activeCard]);

    const trackCardDuringRecording = useCallback((cardId, setId) => {
        if (!isRecordingSession) return;

        const elapsed = Date.now() - recordingSessionRef.current.startTime;
        recordingSessionRef.current.cardsUsed.push({
            cardId,
            setId,
            startMs: elapsed
        });
    }, [isRecordingSession]);

    const finalizeRecordingSession = useCallback(async (recordingId) => {
        if (!isRecordingSession) return [];

        const session = recordingSessionRef.current;
        const cardsUsed = session.cardsUsed;

        // Log activity for each card used during recording
        for (const card of cardsUsed) {
            try {
                await practiceCardsService.logCardActivity({
                    cardId: card.cardId,
                    setId: card.setId,
                    recordingId,
                    durationMs: 0, // Full session, not individual timing for now
                    saved: true
                });
            } catch (err) {
                console.error('[PracticeCardsContext] Error logging recording card:', err);
            }
        }

        // Reset session
        setIsRecordingSession(false);
        recordingSessionRef.current = { startTime: null, cardsUsed: [] };

        // Refresh summary
        try {
            const summary = await practiceCardsService.getPracticeSummary();
            setPracticeSummary(summary);
        } catch (err) {
            console.error('[PracticeCardsContext] Error refreshing summary:', err);
        }

        return cardsUsed;
    }, [isRecordingSession]);

    const getActiveCardForRecording = useCallback(() => {
        return activeCard;
    }, [activeCard]);

    // ============================================
    // Context Value
    // ============================================

    const value = {
        // State
        cardSets,
        customCardSets,
        defaultCardSets: DEFAULT_CARD_SETS,
        activeCardSet,
        activeCard,
        isPracticing,
        isRecordingSession,
        cardActivities,
        practiceSummary,
        isLoading,
        error,

        // Card Set Actions
        selectCardSet,
        selectCard,
        createCardSet,
        updateCardSet,
        deleteCardSet,

        // Practice Actions
        startCardPractice,
        endCardPractice,
        getCardActivity,
        getRecordingsForCard,

        // Recording Session Actions
        startRecordingSession,
        trackCardDuringRecording,
        finalizeRecordingSession,
        getActiveCardForRecording
    };

    return (
        <PracticeCardsContext.Provider value={value}>
            {children}
        </PracticeCardsContext.Provider>
    );
};

export default PracticeCardsContext;


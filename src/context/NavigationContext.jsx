import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '../services/AnalyticsService';

const NavigationContext = createContext();

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};

export const NavigationProvider = ({ children }) => {
    // Primary Views: 'practice', 'journal', 'stats', 'settings'
    const [activeView, setActiveView] = useState('practice');

    // Practice Tabs: 'overview', 'pitch', 'resonance', 'weight', 'vowel', 'tilt', 'articulation', 'contour', 'quality', 'spectrogram', 'all'
    const [practiceTab, setPracticeTab] = useState('overview'); // Default to overview to show Dynamic Orb

    // History State for Breadcrumbs
    const [history, setHistory] = useState([]);

    // Modals & Overlays State
    const [modals, setModals] = useState({
        settings: false,
        tutorial: false,
        compass: false,
        calibration: false,
        journal: false,
        login: false,
        signup: false,
        profile: false,
        assessment: false,
        warmup: false,
        forwardFocus: false,
        vocalHealth: false,
        incognito: false,
        camera: false,
        practiceMode: false,
        migration: true, // Default to true as in App.jsx
        vocalFolds: false,
        voiceQuality: false,
        course: false,
        feedback: false,
        commandPalette: false, // New Command Palette
        adaptiveSession: false,
        practiceCards: false // Practice Cards feature
    });

    // Initialize Analytics
    useEffect(() => {
        analyticsService.init();
    }, []);

    const [navigationParams, setNavigationParams] = useState({});
    const [modalParams, setModalParams] = useState({});

    const openModal = useCallback((modalName, params = {}) => {
        setModalParams(prev => ({ ...prev, [modalName]: params }));
        setModals(prev => ({ ...prev, [modalName]: true }));
        analyticsService.trackModalOpen(modalName, params);
    }, []);

    // Global Event Listeners (moved from App.jsx)
    useEffect(() => {
        const handleOpenVocalHealth = () => openModal('vocalHealth');
        const handleOpenAssessment = () => openModal('assessment');
        const handleOpenWarmUp = () => openModal('warmup');
        const handleOpenForwardFocus = () => openModal('forwardFocus');

        window.addEventListener('openVocalHealth', handleOpenVocalHealth);
        window.addEventListener('openAssessment', handleOpenAssessment);
        window.addEventListener('openWarmUp', handleOpenWarmUp);
        window.addEventListener('openForwardFocus', handleOpenForwardFocus);

        return () => {
            window.removeEventListener('openVocalHealth', handleOpenVocalHealth);
            window.removeEventListener('openAssessment', handleOpenAssessment);
            window.removeEventListener('openWarmUp', handleOpenWarmUp);
            window.removeEventListener('openForwardFocus', handleOpenForwardFocus);
        };
    }, [openModal]);

    // Navigation Actions
    const navigate = useCallback((view, params = {}) => {
        if (view !== activeView || Object.keys(params).length > 0) {
            setNavigationParams(params);
            setActiveView(view);
            analyticsService.trackView(view, params);
        }
    }, [activeView]);

    const switchPracticeTab = useCallback((tab) => {
        if (tab !== practiceTab) {
            setPracticeTab(tab);
            analyticsService.logEvent('practice_tab_change', { tab });
        }
    }, [practiceTab]);

    const closeModal = useCallback((modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
    }, []);

    const closeAllModals = useCallback(() => {
        setModals(prev => {
            const closed = {};
            Object.keys(prev).forEach(key => closed[key] = false);
            return closed;
        });
    }, []);

    const addToHistory = useCallback((label, action) => {
        setHistory(prev => {
            if (prev.length > 0 && prev[prev.length - 1].label === label) return prev;
            const newHistory = [...prev, { label, action }];
            if (newHistory.length > 5) return newHistory.slice(newHistory.length - 5);
            return newHistory;
        });
    }, []);

    const value = useMemo(() => ({
        activeView,
        practiceTab,
        modals,
        history,
        navigationParams,
        modalParams,
        navigate,
        switchPracticeTab,
        openModal,
        closeModal,
        closeAllModals,
        addToHistory
    }), [
        activeView,
        practiceTab,
        modals,
        history,
        navigationParams,
        modalParams,
        navigate,
        switchPracticeTab,
        openModal,
        closeModal,
        closeAllModals,
        addToHistory
    ]);

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

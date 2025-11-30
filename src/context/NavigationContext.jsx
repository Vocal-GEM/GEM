import React, { createContext, useContext, useState, useEffect } from 'react';
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

    // Practice Tabs: 'overview', 'pitch', 'resonance', 'weight', 'vowel'
    const [practiceTab, setPracticeTab] = useState('overview');

    // Modals State
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
        warmup: false
    });

    // Initialize Analytics
    useEffect(() => {
        analyticsService.init();
    }, []);

    // Navigation Actions
    const navigate = (view) => {
        if (view !== activeView) {
            setActiveView(view);
            analyticsService.trackView(view);
        }
    };

    const switchPracticeTab = (tab) => {
        if (tab !== practiceTab) {
            setPracticeTab(tab);
            analyticsService.logEvent('practice_tab_change', { tab });
        }
    };

    const openModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: true }));
        analyticsService.trackModalOpen(modalName);
    };

    const closeModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
    };

    const closeAllModals = () => {
        setModals(prev => {
            const closed = {};
            Object.keys(prev).forEach(key => closed[key] = false);
            return closed;
        });
    };

    const value = {
        activeView,
        practiceTab,
        modals,
        navigate,
        switchPracticeTab,
        openModal,
        closeModal,
        closeAllModals
    };

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

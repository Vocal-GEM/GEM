import React, { createContext, useContext, useState, useEffect } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { syncManager } from '../services/SyncManager';
import { useAuth } from './AuthContext';

const JournalContext = createContext();

export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }) => {
    const { user } = useAuth();
    const [journals, setJournals] = useState([]);
    const [showJournalForm, setShowJournalForm] = useState(false);

    useEffect(() => {
        const loadJournals = async () => {
            try {
                await indexedDB.ensureReady();
                const savedJournals = await indexedDB.getJournals();
                if (savedJournals) setJournals(savedJournals);
            } catch (e) {
                console.error("Failed to load journals:", e);
            }
        };
        loadJournals();
    }, []);

    const addJournalEntry = async (entry) => {
        const newEntry = { ...entry, date: new Date().toISOString(), id: Date.now() };
        await indexedDB.saveJournal(newEntry);
        setJournals(prev => [...prev, newEntry]);
        setShowJournalForm(false);

        if (user) {
            syncManager.push('JOURNAL_ADD', newEntry);
        }
    };

    const value = {
        journals,
        addJournalEntry,
        showJournalForm,
        setShowJournalForm
    };

    return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

import { createContext, useContext, useState, useEffect } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { syncToServer, syncFromServer } from '../services/DataSyncService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Determine API URL:
// 1. Use VITE_API_URL if set
// 2. Fallback to Render URL for easier local dev without running local backend
const API_URL = import.meta.env.VITE_API_URL || 'https://vocalgem.onrender.com';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, username }
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Wake up the backend (Render cold-start can take 30-60s)
                // This ping happens early so signup/login is faster when user reaches it
                const res = await fetch(`${API_URL}/api/me`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        // Restore user data from server on app load if logged in
                        await syncFromServer();
                    }
                }
            } catch (e) {
                console.warn("Backend not reachable at " + API_URL + " - it may be waking up (cold start)");
            } finally {
                setIsAuthLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);

                // Pull user data from server after successful login
                console.log('[Auth] Login successful, syncing data from server...');
                await syncFromServer();

                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    };

    const signup = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);

                // If there's existing local data, sync it to the new account
                console.log('[Auth] Signup successful, syncing local data to server...');
                await syncToServer();

                return { success: true };
            } else {
                return { success: false, error: data.error || 'Signup failed' };
            }
        } catch (e) {
            console.error("Signup error:", e);
            return { success: false, error: `Network error connecting to ${API_URL}. Is the backend running?` };
        }
    };

    /**
     * Clear all local data (IndexedDB + localStorage)
     * Called on logout to prevent cross-user data access
     */
    const clearLocalData = async () => {
        try {
            console.log('[Auth] Clearing all local data...');
            await indexedDB.factoryReset();
            console.log('[Auth] Local data cleared successfully');
        } catch (e) {
            console.error('[Auth] Failed to clear local data:', e);
        }
    };

    const logout = async () => {
        try {
            // Sync data to server BEFORE clearing (preserve user's progress)
            console.log('[Auth] Syncing data to server before logout...');
            await syncToServer();

            // Clear local data (so next user starts fresh)
            await clearLocalData();

            await fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'include' });
            setUser(null);
        } catch (e) {
            console.error(e);
            setUser(null); // Still clear user state even if API fails
        }
    };

    const value = {
        user,
        isAuthLoading,
        login,
        signup,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



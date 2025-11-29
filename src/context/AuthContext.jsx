import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, username }
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Determine API URL:
    // 1. Use VITE_API_URL if set
    // 2. Fallback to Render URL for easier local dev without running local backend
    const API_URL = import.meta.env.VITE_API_URL || 'https://vocalgem.onrender.com';

    useEffect(() => {
        const initAuth = async () => {
            try {
                const res = await fetch(`${API_URL}/api/me`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                    }
                }
            } catch (e) {
                console.warn("Backend not reachable at " + API_URL);
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
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    };

    const signup = async (username, password) => {
        try {
            console.log("Signing up to:", `${API_URL}/api/signup`);
            const res = await fetch(`${API_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Signup failed' };
            }
        } catch (e) {
            console.error("Signup error:", e);
            return { success: false, error: `Network error connecting to ${API_URL}. Is the backend running?` };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/logout`, { method: 'POST' });
            setUser(null);
        } catch (e) { console.error(e); }
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

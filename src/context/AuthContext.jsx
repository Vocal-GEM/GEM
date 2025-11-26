import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, username }
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API_URL}/api/me`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                    }
                }
            } catch (e) {
                console.warn("Backend not reachable");
            } finally {
                setIsAuthLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
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
            const API_URL = import.meta.env.VITE_API_URL || '';
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
            console.error(e);
            return { success: false, error: 'Network error. Is the backend running?' };
        }
    };

    const logout = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
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

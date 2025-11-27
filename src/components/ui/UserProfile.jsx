import React, { useState, useEffect } from 'react';
import { X, LogOut, Trophy, Flame, Clock, Star, Lock, Award } from 'lucide-react';

import { indexedDB } from '../../services/IndexedDBManager';
import { useSettings } from '../../context/SettingsContext';

const UserProfile = ({ user, onClose, onLogout }) => {
    const { settings } = useSettings();
    const [totalSeconds, setTotalSeconds] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            // Get totalSeconds from IndexedDB directly
            const dbStats = await indexedDB.getStats();
            setTotalSeconds(dbStats.totalSeconds || 0);
        };
        loadStats();
    }, []);

    const formatPracticeTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };



    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md p-6 border-b border-white/5 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-white">Profile</h2>
                    <button onClick={onClose} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Account Info Section */}
                    <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="text-3xl">👤</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                                <p className="text-sm text-slate-400">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full p-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-xl text-left flex items-center gap-3 transition-colors"
                        >
                            <LogOut className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-bold text-red-200">Log Out</span>
                        </button>
                    </section>

                    {/* Gamification Stats Section */}
                    {/* Gamification Stats Section */}
                    {/* Usage Stats Only */}
                    <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Usage Stats
                        </h3>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{formatPracticeTime(totalSeconds)}</div>
                            <div className="text-xs text-slate-400 uppercase">Total Practice Time</div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

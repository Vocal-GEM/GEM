import React, { useState } from 'react';
import { Home, Mic, BookOpen, Activity, Dumbbell, BarChart2, Settings, Menu, X, ChevronRight, User } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import ProfileManager from '../ui/ProfileManager';

const Sidebar = ({ activeView, onViewChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileManager, setShowProfileManager] = useState(false);
    const { activeProfile } = useProfile();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
        { id: 'analysis', label: 'Voice Analysis', icon: <Mic size={20} /> },
        { id: 'assessment', label: 'Voice Assessment', icon: <BookOpen size={20} /> },
        { id: 'acoustics', label: 'Acoustic Analysis', icon: <Activity size={20} /> },
        { id: 'phonetogram', label: 'Voice Range', icon: <BarChart2 size={20} /> },
        { id: 'training', label: 'Training Gym', icon: <Dumbbell size={20} /> },
        { id: 'history', label: 'History & Progress', icon: <BarChart2 size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white shadow-lg border border-slate-700"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Vocal GEM
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">Gender Expression Modulator</p>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onViewChange(item.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === item.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                                {activeView === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={() => setShowProfileManager(true)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                                {activeProfile?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="text-left flex-1 overflow-hidden">
                                <div className="text-sm font-bold text-white truncate">{activeProfile?.name || 'User'}</div>
                                <div className="text-xs text-slate-400">Switch Profile</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {showProfileManager && <ProfileManager onClose={() => setShowProfileManager(false)} />}
        </>
    );
};

export default Sidebar;

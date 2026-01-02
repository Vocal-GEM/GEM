import { useState, useRef, useEffect, useCallback } from 'react';
import { Home, BookOpen, Activity, BarChart2, Settings, Menu, X, ChevronRight, User, Waves, Search, FileText, HelpCircle, Layers, BookMarked, Camera, Briefcase, ClipboardCheck } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import ProfileManager from '../ui/ProfileManager';
import Login from '../ui/Login';
import Signup from '../ui/Signup';
import { search, groupResultsByType } from '../../services/SearchService';

// Import version from package.json
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

// Icon mapping for search result types
const TYPE_ICONS = {
    navigation: Home,
    exercise: Activity,
    glossary: BookOpen,
    knowledge: HelpCircle,
    course: BookMarked,
    lesson: FileText,
    'practice-cards': Layers
};

const Sidebar = ({ activeView, onViewChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileManager, setShowProfileManager] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    useProfile(); // Context initialization
    const { user, logout } = useAuth();
    const { openModal } = useNavigation();

    // Consolidated navigation: 7 items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
        { id: 'practice', label: 'Practice', icon: <Activity size={20} /> },
        { id: 'analysis', label: 'Analysis', icon: <Waves size={20} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
        { id: 'coach', label: 'Coach', icon: <BookOpen size={20} /> },
        { id: 'library', label: 'Library', icon: <BookMarked size={20} /> },
        { id: 'camera', label: 'Mirror', icon: <Camera size={20} />, isModal: true },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    // Search handler with debouncing
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(() => {
            const results = search(searchQuery, { limit: 15 });
            setSearchResults(results);
            setShowResults(true);
            setSelectedIndex(0);
        }, 150);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle search result selection
    const handleSelectResult = useCallback((result) => {
        const { action } = result;

        switch (action.type) {
            case 'navigate':
                onViewChange(action.view);
                break;
            case 'exercise':
                // Navigate to practice mode - exercises are shown there
                onViewChange('practice');
                break;
            case 'knowledge':
                // Open coach which has knowledge base integration
                onViewChange('coach');
                break;
            case 'lesson':
                // Navigate to coach view
                onViewChange('coach');
                break;
            case 'practiceCards':
                openModal('practiceCards');
                break;
            default:
                break;
        }

        // Clear search and close
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
        setIsOpen(false);
    }, [onViewChange, openModal]);

    // Keyboard navigation for search
    const handleSearchKeyDown = useCallback((e) => {
        if (!showResults || searchResults.length === 0) {
            if (e.key === 'Escape') {
                setSearchQuery('');
                setShowResults(false);
                searchInputRef.current?.blur();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % searchResults.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (searchResults[selectedIndex]) {
                    handleSelectResult(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setSearchQuery('');
                setShowResults(false);
                searchInputRef.current?.blur();
                break;
            default:
                break;
        }
    }, [showResults, searchResults, selectedIndex, handleSelectResult]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (resultsRef.current && !resultsRef.current.contains(e.target) &&
                searchInputRef.current && !searchInputRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Group results by type for display
    const groupedResults = groupResultsByType(searchResults);

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
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                    Vocal GEM
                                </h1>
                                <p className="text-xs text-slate-500 mt-1">Gender Expression Modulator</p>
                            </div>
                            <span className="text-[10px] text-slate-600 font-mono bg-slate-800 px-2 py-1 rounded" title="App Version">
                                v{APP_VERSION}
                            </span>
                        </div>
                    </div>

                    {/* Search Box */}
                    <div className="px-4 py-3 border-b border-slate-800/50 relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                onFocus={() => searchQuery.length > 0 && setShowResults(true)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-500 font-mono">
                                ⌘K
                            </kbd>
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div
                                ref={resultsRef}
                                className="absolute left-4 right-4 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto"
                            >
                                {groupedResults.map((group, groupIndex) => (
                                    <div key={group.label}>
                                        {groupIndex > 0 && <div className="border-t border-slate-700/50" />}
                                        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/50">
                                            {group.label}
                                        </div>
                                        {group.items.map((result) => {
                                            const resultIndex = searchResults.indexOf(result);
                                            const Icon = TYPE_ICONS[result.type] || FileText;
                                            const isSelected = resultIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleSelectResult(result)}
                                                    onMouseEnter={() => setSelectedIndex(resultIndex)}
                                                    className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${isSelected
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-slate-300 hover:bg-slate-700/50'
                                                        }`}
                                                >
                                                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-700/50'}`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                            {result.title}
                                                        </div>
                                                        <div className={`text-xs truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                                                            {result.subtitle}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <ChevronRight size={14} className="text-white/70 flex-shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* Results footer hint */}
                                <div className="px-3 py-2 bg-slate-900/80 border-t border-slate-700/50 text-[10px] text-slate-500 flex justify-between">
                                    <span>↑↓ Navigate</span>
                                    <span>↵ Select</span>
                                    <span>Esc Close</span>
                                </div>
                            </div>
                        )}

                        {/* No results message */}
                        {showResults && searchQuery.length > 0 && searchResults.length === 0 && (
                            <div
                                ref={resultsRef}
                                className="absolute left-4 right-4 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-50"
                            >
                                <p className="text-sm text-slate-400 text-center">No results found</p>
                            </div>
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.isModal) {
                                        openModal(item.id);
                                    } else {
                                        onViewChange(item.id);
                                    }
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.isModal
                                    ? 'text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 border border-violet-500/20'
                                    : activeView === item.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                                {!item.isModal && activeView === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-slate-800">
                        {user ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                                        {user.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-left flex-1 overflow-hidden">
                                        <div className="text-sm font-bold text-white truncate">{user.username}</div>
                                        <button
                                            onClick={logout}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowLogin(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/20"
                            >
                                <User size={18} />
                                Sign In
                            </button>
                        )}
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
            {showLogin && (
                <Login
                    onClose={() => setShowLogin(false)}
                    onSwitchToSignup={() => {
                        setShowLogin(false);
                        setShowSignup(true);
                    }}
                />
            )}
            {showSignup && (
                <Signup
                    onClose={() => setShowSignup(false)}
                    onSwitchToLogin={() => {
                        setShowSignup(false);
                        setShowLogin(true);
                    }}
                />
            )}
        </>
    );
};

export default Sidebar;

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Command, ArrowRight, Mic, Activity, Book, Settings, LayoutGrid } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useAudio } from '../../context/AudioContext';

const CommandPalette = () => {
    const { modals, closeModal, navigate, switchPracticeTab, openModal, addToHistory } = useNavigation();
    const { toggleAudio, isAudioActive } = useAudio();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const isOpen = modals.commandPalette;

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Define Actions
    const actions = [
        {
            id: 'practice-mic',
            label: isAudioActive ? 'Stop Microphone' : 'Start Microphone',
            icon: Mic,
            category: 'Quick Actions',
            action: () => { toggleAudio(); navigate('practice'); }
        },
        {
            id: 'nav-practice',
            label: 'Go to Practice Mode',
            icon: Activity,
            category: 'Navigation',
            action: () => { navigate('practice'); addToHistory('Practice', () => navigate('practice')); }
        },
        {
            id: 'nav-history',
            label: 'Go to History',
            icon: Book,
            category: 'Navigation',
            action: () => { navigate('history'); addToHistory('History', () => navigate('history')); }
        },
        {
            id: 'nav-settings',
            label: 'Open Settings',
            icon: Settings,
            category: 'Navigation',
            action: () => openModal('settings')
        },
        {
            id: 'view-pitch',
            label: 'View Pitch Visualizer',
            icon: Activity,
            category: 'Tools',
            action: () => { navigate('practice'); switchPracticeTab('pitch'); addToHistory('Pitch Tool', () => { navigate('practice'); switchPracticeTab('pitch'); }); }
        },
        {
            id: 'view-spectrogram',
            label: 'View Spectrogram',
            icon: Activity,
            category: 'Tools',
            action: () => { navigate('practice'); switchPracticeTab('spectrogram'); addToHistory('Spectrogram', () => { navigate('practice'); switchPracticeTab('spectrogram'); }); }
        },
        {
            id: 'view-vowel',
            label: 'View Vowel Space',
            icon: LayoutGrid,
            category: 'Tools',
            action: () => { navigate('practice'); switchPracticeTab('vowel'); addToHistory('Vowel Space', () => { navigate('practice'); switchPracticeTab('vowel'); }); }
        },
        {
            id: 'modal-warmup',
            label: 'Start Warm-up',
            icon: Command,
            category: 'Exercises',
            action: () => openModal('warmup')
        },
        {
            id: 'modal-assessment',
            label: 'Take Assessment',
            icon: Command,
            category: 'Exercises',
            action: () => openModal('assessment')
        },
        {
            id: 'modal-practice-cards',
            label: 'Open Practice Cards',
            icon: Book,
            category: 'Exercises',
            action: () => openModal('practiceCards')
        }
    ];

    // Filter Actions
    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase()) ||
        action.category.toLowerCase().includes(query.toLowerCase())
    );

    // Handle Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    handleSelect(filteredActions[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                closeModal('commandPalette');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredActions, selectedIndex, closeModal]); // handleSelect is defined inside component but uses no external closure deps that change, so it's tricky.
    // Actually, handleSelect is defined below. Let's move handleSelect up or wrap it in useCallback.
    // Wait, handleSelect is defined *after*.
    // Let's wrap handleSelect in useCallback and move it before useEffect, or just disable the line if it causes circular deps.
    // Simpler: handleSelect depends on nothing but closeModal which is stable from context.
    // But `filteredActions` changes.
    // Let's just add closeModal for now as the tool suggested.

    const handleSelect = (action) => {
        action.action();
        closeModal('commandPalette');
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => closeModal('commandPalette')}
            />

            {/* Palette */}
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[60vh]">
                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-slate-800 gap-3">
                    <Search className="text-slate-400 w-5 h-5" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-lg"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                    />
                    <div className="hidden sm:flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">ESC</kbd>
                    </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto custom-scrollbar p-2">
                    {filteredActions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No results found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredActions.map((action, index) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleSelect(action)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-left group ${index === selectedIndex ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                                            <action.icon size={18} />
                                        </div>
                                        <div>
                                            <div className={`font-medium ${index === selectedIndex ? 'text-white' : 'text-slate-200'}`}>
                                                {action.label}
                                            </div>
                                            <div className={`text-xs ${index === selectedIndex ? 'text-blue-200' : 'text-slate-500'}`}>
                                                {action.category}
                                            </div>
                                        </div>
                                    </div>
                                    {index === selectedIndex && (
                                        <ArrowRight size={16} className="animate-in slide-in-from-left-2 fade-in" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                    <span>Use <kbd className="font-mono">Γåæ</kbd> to navigate</span>
                    <span><kbd className="font-mono">Γå╡</kbd> to select</span>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommandPalette;

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const PracticeFilterMenu = ({ activeView, onViewChange, beginnerMode = false }) => {
    const [showMore, setShowMore] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMore(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const primaryFilters = [
        { id: 'all', label: 'Show All' },
        { id: 'pitch', label: 'Pitch' },
        { id: 'resonance', label: 'Resonance' },
        { id: 'weight', label: 'Weight' },
        { id: 'vowel', label: 'Vowel' },
    ];

    const secondaryFilters = [
        { id: 'tilt', label: 'Tilt' },
        { id: 'articulation', label: 'Articulation' },
        { id: 'contour', label: 'Contour' },
        { id: 'quality', label: 'Quality' },
        { id: 'spectrogram', label: 'Spectrogram' },
    ];

    const activeIsSecondary = secondaryFilters.some(f => f.id === activeView);

    return (
        <div className="glass-panel-dark rounded-xl p-2 mb-6 flex gap-2 overflow-x-auto items-center">
            {/* Primary Filters */}
            {primaryFilters.map(view => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap min-w-[80px] flex-shrink-0 ${activeView === view.id
                        ? 'bg-gradient-to-r from-teal-500 to-violet-500 text-white shadow-md shadow-teal-500/20'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/70 hover:text-white border border-slate-700/50'
                        }`}
                >
                    {view.label}
                </button>
            ))}

            {/* More Dropdown */}
            {!beginnerMode && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={`px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeIsSecondary || showMore
                            ? 'bg-slate-700 text-white border border-slate-600'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/70 hover:text-white border border-slate-700/50'
                            }`}
                    >
                        {activeIsSecondary ? secondaryFilters.find(f => f.id === activeView)?.label : 'More'}
                        <ChevronDown size={16} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
                    </button>

                    {showMore && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-1">
                                {secondaryFilters.map(view => (
                                    <button
                                        key={view.id}
                                        onClick={() => {
                                            onViewChange(view.id);
                                            setShowMore(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === view.id
                                            ? 'bg-teal-500/10 text-teal-400'
                                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        {view.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PracticeFilterMenu;

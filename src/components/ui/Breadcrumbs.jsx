import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

const Breadcrumbs = ({ items, className }) => {
    const { history, breadcrumbs, navigate, activeView, practiceTab, switchPracticeTab } = useNavigation();

    // Priority: Props > Context > History (Default)
    let displayHistory = items || breadcrumbs;

    // Only run default logic if no items are provided
    if (!displayHistory) {
        // Don't show on Dashboard (default behavior)
        if (activeView === 'dashboard') return null;

        displayHistory = history;

        if (displayHistory.length === 0) {
            // Default Breadcrumb Logic
            displayHistory = [{ label: 'Dashboard', action: () => navigate('dashboard') }];

            if (activeView === 'practice') {
                if (practiceTab && practiceTab !== 'overview') {
                    displayHistory.push({ label: 'Practice', action: () => switchPracticeTab('overview') });
                    displayHistory.push({ label: practiceTab.charAt(0).toUpperCase() + practiceTab.slice(1), action: null });
                } else {
                    displayHistory.push({ label: 'Practice', action: null });
                }
            } else {
                displayHistory.push({ label: activeView.charAt(0).toUpperCase() + activeView.slice(1), action: null });
            }
        }
    }

    return (
        <nav className={`flex items-center text-sm text-slate-400 animate-in fade-in slide-in-from-left-2 ${className || 'mb-4'}`} aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
                {displayHistory.map((item, index) => {
                    const isLast = index === displayHistory.length - 1;
                    return (
                        <li key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight size={14} className="text-slate-600" />}

                            {isLast ? (
                                <span className="font-bold text-white" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <button
                                    onClick={item.action}
                                    className="hover:text-blue-400 transition-colors flex items-center gap-1"
                                >
                                    {index === 0 && item.label === 'Dashboard' && <Home size={14} />}
                                    <span>{item.label}</span>
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;

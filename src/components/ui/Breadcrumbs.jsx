
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

const Breadcrumbs = () => {
    const { history, navigate, activeView } = useNavigation();

    // If history is empty, show default Home > Active View
    const displayHistory = history.length > 0 ? history : [
        { label: 'Home', action: () => navigate('practice') },
        { label: activeView.charAt(0).toUpperCase() + activeView.slice(1), action: null }
    ];

    return (
        <nav className="flex items-center text-sm text-slate-400 mb-4 animate-in fade-in slide-in-from-left-2" aria-label="Breadcrumb">
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
                                    {index === 0 && item.label === 'Home' && <Home size={14} />}
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

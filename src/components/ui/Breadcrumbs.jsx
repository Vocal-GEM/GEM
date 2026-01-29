import {
    ChevronRight,
    Home,
    Mic,
    Activity,
    BookOpen,
    Settings,
    Layers,
    History,
    Library,
    BookA,
    FileText,
    TrendingUp,
    BarChart2,
    Stethoscope,
    Flame,
    ClipboardCheck,
    Music,
    Cpu,
    GraduationCap
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

const ROUTE_CONFIG = {
    dashboard: { label: 'Dashboard', icon: Home },
    practice: { label: 'Practice', icon: Mic },
    analysis: { label: 'Analysis', icon: Activity },
    learn: { label: 'Learn', icon: GraduationCap },
    settings: { label: 'Settings', icon: Settings },
    program: { label: 'Program', icon: Layers },
    history: { label: 'History', icon: History },
    library: { label: 'Library', icon: Library },
    glossary: { label: 'Glossary', icon: BookA },
    journal: { label: 'Journal', icon: FileText },
    progress: { label: 'Progress', icon: TrendingUp },
    analytics: { label: 'Analytics', icon: BarChart2 },
    assessment: { label: 'Assessment', icon: ClipboardCheck },
    capev: { label: 'CAPE-V', icon: Stethoscope },
    spectrogram: { label: 'Spectrogram', icon: Activity },
    'pitch-tool': { label: 'Pitch Tool', icon: Music },
    'client-dashboard': { label: 'Clients', icon: TrendingUp },
    warmup: { label: 'Warm Up', icon: Flame },
    'adaptive-session': { label: 'Adaptive Session', icon: Cpu }
};

const Breadcrumbs = () => {
    const { history, navigate, activeView, practiceTab, switchPracticeTab } = useNavigation();

    // Don't show on Dashboard
    if (activeView === 'dashboard') return null;

    let displayHistory = history;

    if (displayHistory.length === 0) {
        // Default Breadcrumb Logic
        displayHistory = [{ label: 'Dashboard', action: () => navigate('dashboard'), icon: Home }];

        if (activeView === 'practice') {
            if (practiceTab && practiceTab !== 'overview') {
                displayHistory.push({
                    label: 'Practice',
                    action: () => switchPracticeTab('overview'),
                    icon: Mic
                });
                displayHistory.push({
                    label: practiceTab.charAt(0).toUpperCase() + practiceTab.slice(1),
                    action: null,
                    icon: null // Sub-tabs might not have specific icons yet, or we could map them
                });
            } else {
                displayHistory.push({ label: 'Practice', action: null, icon: Mic });
            }
        } else {
            const config = ROUTE_CONFIG[activeView];
            displayHistory.push({
                label: config?.label || activeView.charAt(0).toUpperCase() + activeView.slice(1),
                action: null,
                icon: config?.icon || null
            });
        }
    }

    return (
        <nav className="flex items-center text-sm text-slate-400 mb-6 animate-in fade-in slide-in-from-left-2" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
                {displayHistory.map((item, index) => {
                    const isLast = index === displayHistory.length - 1;
                    const Icon = item.icon;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight size={14} className="text-slate-600" aria-hidden="true" />}

                            {isLast ? (
                                <span className="flex items-center gap-1.5 font-semibold text-white bg-slate-800/50 px-2 py-1 rounded-md" aria-current="page">
                                    {Icon && <Icon size={14} className="text-blue-400" aria-hidden="true" />}
                                    {item.label}
                                </span>
                            ) : (
                                <button
                                    onClick={item.action}
                                    className="hover:text-blue-400 hover:bg-slate-800/30 px-2 py-1 rounded-md transition-all flex items-center gap-1.5 group"
                                >
                                    {Icon && <Icon size={14} className="group-hover:text-blue-400 transition-colors" aria-hidden="true" />}
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

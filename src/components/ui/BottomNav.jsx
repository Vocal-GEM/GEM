
import { Home, Activity, Waves, BarChart2, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'practice', label: 'Practice', icon: Activity },
    { id: 'analysis', label: 'Analysis', icon: Waves },
    { id: 'history', label: 'History', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-[60px] max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-teal-500/10' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;

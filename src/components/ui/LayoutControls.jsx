
import { Lock, Unlock, RotateCcw, LayoutGrid } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';

const LayoutControls = () => {
    const { isLocked, toggleLock, resetLayout, currentPreset, applyPreset, presets } = useLayout();

    return (
        <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
            {/* Lock/Unlock Button */}
            <button
                onClick={toggleLock}
                className={`p-2 rounded-lg transition-all ${isLocked
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                title={isLocked ? 'Unlock Layout' : 'Lock Layout'}
            >
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>

            {/* Preset Selector */}
            <div className="relative">
                <select
                    value={currentPreset}
                    onChange={(e) => applyPreset(e.target.value)}
                    className="appearance-none bg-slate-700/50 text-slate-300 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                    disabled={isLocked}
                >
                    {presets.map(preset => (
                        <option key={preset} value={preset}>
                            {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </option>
                    ))}
                </select>
                <LayoutGrid size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Button */}
            <button
                onClick={resetLayout}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-all"
                title="Reset to Default"
                disabled={isLocked}
            >
                <RotateCcw size={16} />
            </button>

            {/* Status Indicator */}
            {isLocked && (
                <span className="text-xs text-yellow-400 font-medium ml-2">
                    Layout Locked
                </span>
            )}
        </div>
    );
};

export default LayoutControls;

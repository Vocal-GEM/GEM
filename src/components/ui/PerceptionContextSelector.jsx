/**
 * PerceptionContextSelector
 * 
 * Toggle between different listener perspectives for voice perception feedback.
 * Based on research showing that SLPs, cisgender, and trans/non-binary listeners
 * perceive gender in voice differently.
 * 
 * Reference: da Cruz Martinho et al. (2024)
 */

import PropTypes from 'prop-types';

const CONTEXTS = [
    {
        id: 'SLP',
        label: 'Clinical',
        description: 'How SLPs perceive your voice',
        icon: '🩺',
        color: '#10b981'
    },
    {
        id: 'CG',
        label: 'General',
        description: 'How most people perceive your voice',
        icon: '👥',
        color: '#8b5cf6'
    },

];

/**
 * Perception Context Selector Component
 * Allows users to toggle between different listener perspectives
 */
const PerceptionContextSelector = ({
    selected = 'CG',
    onChange,
    compact = false,
    className = ''
}) => {
    const handleSelect = (contextId) => {
        if (onChange) {
            onChange(contextId);
        }
    };

    if (compact) {
        return (
            <div className={`perception-context-selector-compact ${className}`}>
                <div className="inline-flex rounded-lg bg-slate-800 p-1">
                    {CONTEXTS.map((context) => (
                        <button
                            key={context.id}
                            onClick={() => handleSelect(context.id)}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-all
                                ${selected === context.id
                                    ? 'bg-slate-700 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200'}
                            `}
                            style={{
                                borderBottom: selected === context.id
                                    ? `2px solid ${context.color}`
                                    : '2px solid transparent'
                            }}
                            title={context.description}
                        >
                            <span className="mr-1">{context.icon}</span>
                            {context.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`perception-context-selector ${className}`}>
            <div className="mb-2 text-sm text-slate-400">
                Perception Context
            </div>
            <div className="grid grid-cols-3 gap-2">
                {CONTEXTS.map((context) => (
                    <button
                        key={context.id}
                        onClick={() => handleSelect(context.id)}
                        className={`
                            p-3 rounded-lg border-2 transition-all text-left
                            ${selected === context.id
                                ? 'border-current bg-slate-800/50'
                                : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'}
                        `}
                        style={{
                            borderColor: selected === context.id ? context.color : undefined,
                            color: selected === context.id ? context.color : '#94a3b8'
                        }}
                    >
                        <div className="text-2xl mb-1">{context.icon}</div>
                        <div className="font-medium text-sm text-slate-200">
                            {context.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                            {context.description}
                        </div>
                    </button>
                ))}
            </div>

            {/* Context explanation */}
            <div className="mt-3 p-2 rounded bg-slate-800/50 text-xs text-slate-400">
                {selected === 'SLP' && (
                    <p>
                        <strong>Clinical perspective:</strong> Speech-language pathologists
                        primarily use pitch (f0) for gender perception, especially in sustained vowels.
                    </p>
                )}
                {selected === 'CG' && (
                    <p>
                        <strong>General population:</strong> Most listeners use a combination of
                        pitch and voice quality (HNR, breathiness) to perceive gender.
                    </p>
                )}

            </div>
        </div>
    );
};

PerceptionContextSelector.propTypes = {
    /** Currently selected context ID */
    selected: PropTypes.oneOf(['SLP', 'CG']),
    /** Callback when selection changes */
    onChange: PropTypes.func,
    /** Use compact button group style */
    compact: PropTypes.bool,
    /** Additional CSS classes */
    className: PropTypes.string
};

export default PerceptionContextSelector;

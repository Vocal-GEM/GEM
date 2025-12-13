/**
 * KeyboardShortcuts - Global keyboard navigation
 */

import { useEffect, useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';

const SHORTCUTS = {
    // Navigation
    'g d': { action: 'navigate', target: 'dashboard', description: 'Go to Dashboard' },
    'g p': { action: 'navigate', target: 'practice', description: 'Go to Practice' },
    'g a': { action: 'navigate', target: 'analysis', description: 'Go to Analysis' },
    'g h': { action: 'navigate', target: 'history', description: 'Go to History' },
    'g c': { action: 'navigate', target: 'coach', description: 'Go to Coach' },
    'g s': { action: 'navigate', target: 'settings', description: 'Go to Settings' },

    // Actions
    '?': { action: 'showHelp', description: 'Show keyboard shortcuts' },
    '/': { action: 'search', description: 'Focus search' },
    'Escape': { action: 'close', description: 'Close modal/panel' }
};

/**
 * Hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = (onAction) => {
    const { navigate } = useNavigation();
    let keySequence = '';
    let keyTimeout = null;

    const handleKeyDown = useCallback((event) => {
        // Ignore if typing in input
        if (event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable) {
            return;
        }

        // Build key sequence
        const key = event.key;

        // Clear timeout and reset if too slow
        if (keyTimeout) clearTimeout(keyTimeout);

        keySequence += key === ' ' ? ' ' : key.toLowerCase();

        // Check for match
        const matchedShortcut = SHORTCUTS[keySequence];

        if (matchedShortcut) {
            event.preventDefault();

            switch (matchedShortcut.action) {
                case 'navigate':
                    navigate(matchedShortcut.target);
                    break;
                case 'showHelp':
                    onAction?.('showHelp');
                    break;
                case 'search':
                    onAction?.('search');
                    break;
                case 'close':
                    onAction?.('close');
                    break;
                default:
                    break;
            }

            keySequence = '';
        } else {
            // Reset after delay
            keyTimeout = setTimeout(() => {
                keySequence = '';
            }, 1000);
        }
    }, [navigate, onAction]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return SHORTCUTS;
};

/**
 * Keyboard shortcut help modal content
 */
export const ShortcutsList = () => {
    const shortcutEntries = Object.entries(SHORTCUTS);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Keyboard Shortcuts</h3>

            <div className="space-y-2">
                {shortcutEntries.map(([keys, config]) => (
                    <div key={keys} className="flex items-center justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-400">{config.description}</span>
                        <kbd className="px-2 py-1 bg-slate-800 text-white text-sm rounded font-mono">
                            {keys}
                        </kbd>
                    </div>
                ))}
            </div>

            <p className="text-xs text-slate-500">
                Press <kbd className="px-1 bg-slate-800 rounded">?</kbd> to show this help
            </p>
        </div>
    );
};

export default useKeyboardShortcuts;

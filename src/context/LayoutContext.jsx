import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

// Default layout presets
const PRESETS = {
    compact: [
        { i: 'pitch', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
        { i: 'resonance', x: 0, y: 4, w: 12, h: 3, minW: 4, minH: 2 },
        { i: 'weight', x: 0, y: 7, w: 12, h: 3, minW: 4, minH: 2 },
        { i: 'vowel', x: 0, y: 10, w: 12, h: 3, minW: 4, minH: 2 },
        { i: 'spectrogram', x: 0, y: 13, w: 12, h: 3, minW: 4, minH: 2 },
    ],
    balanced: [
        { i: 'pitch', x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
        { i: 'resonance', x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 2 },
        { i: 'weight', x: 0, y: 4, w: 6, h: 3, minW: 3, minH: 2 },
        { i: 'vowel', x: 6, y: 4, w: 6, h: 3, minW: 3, minH: 2 },
        { i: 'spectrogram', x: 0, y: 7, w: 12, h: 3, minW: 4, minH: 2 },
    ],
    expanded: [
        { i: 'pitch', x: 0, y: 0, w: 4, h: 5, minW: 3, minH: 3 },
        { i: 'resonance', x: 4, y: 0, w: 4, h: 5, minW: 3, minH: 3 },
        { i: 'vowel', x: 8, y: 0, w: 4, h: 5, minW: 3, minH: 3 },
        { i: 'weight', x: 0, y: 5, w: 4, h: 3, minW: 3, minH: 2 },
        { i: 'spectrogram', x: 4, y: 5, w: 8, h: 3, minW: 4, minH: 2 },
    ],
    clinical: [
        { i: 'pitch', x: 0, y: 0, w: 6, h: 3, minW: 4, minH: 2 },
        { i: 'cpp', x: 6, y: 0, w: 6, h: 3, minW: 4, minH: 2 },
        { i: 'spectrogram', x: 0, y: 3, w: 6, h: 3, minW: 4, minH: 2 },
        { i: 'mpt', x: 6, y: 3, w: 6, h: 3, minW: 4, minH: 2 },
        { i: 'intonation', x: 0, y: 6, w: 12, h: 3, minW: 6, minH: 2 },
    ]
};

export const LayoutProvider = ({ children }) => {
    const [layout, setLayout] = useState([]);
    const [currentPreset, setCurrentPreset] = useState('balanced');
    const [isLocked, setIsLocked] = useState(false);
    const [activeTools, setActiveTools] = useState(['pitch', 'resonance', 'weight', 'vowel', 'spectrogram']);

    // Load layout from localStorage on mount
    useEffect(() => {
        const savedLayout = localStorage.getItem('toolLayout');
        const savedPreset = localStorage.getItem('toolLayoutPreset');
        const savedLocked = localStorage.getItem('toolLayoutLocked');
        const savedActiveTools = localStorage.getItem('activeTools');

        if (savedLayout) {
            try {
                setLayout(JSON.parse(savedLayout));
            } catch (e) {
                console.error('Failed to parse saved layout:', e);
                setLayout(PRESETS.balanced);
            }
        } else {
            setLayout(PRESETS.balanced);
        }

        if (savedPreset) {
            setCurrentPreset(savedPreset);
        }

        if (savedLocked !== null) {
            setIsLocked(savedLocked === 'true');
        }

        if (savedActiveTools) {
            try {
                setActiveTools(JSON.parse(savedActiveTools));
            } catch (e) {
                console.error('Failed to parse active tools:', e);
            }
        }
    }, []);

    // Save layout to localStorage whenever it changes
    const updateLayout = (newLayout) => {
        setLayout(newLayout);
        localStorage.setItem('toolLayout', JSON.stringify(newLayout));
    };

    const applyPreset = (presetName) => {
        if (PRESETS[presetName]) {
            const preset = PRESETS[presetName];
            // Filter to only include active tools
            const filteredPreset = preset.filter(item => activeTools.includes(item.i));
            setLayout(filteredPreset);
            setCurrentPreset(presetName);
            localStorage.setItem('toolLayout', JSON.stringify(filteredPreset));
            localStorage.setItem('toolLayoutPreset', presetName);
        }
    };

    const resetLayout = () => {
        applyPreset(currentPreset);
    };

    const toggleLock = () => {
        const newLocked = !isLocked;
        setIsLocked(newLocked);
        localStorage.setItem('toolLayoutLocked', newLocked.toString());
    };

    const toggleTool = (toolId) => {
        const newActiveTools = activeTools.includes(toolId)
            ? activeTools.filter(id => id !== toolId)
            : [...activeTools, toolId];

        setActiveTools(newActiveTools);
        localStorage.setItem('activeTools', JSON.stringify(newActiveTools));

        // Update layout to include/exclude the tool
        if (newActiveTools.includes(toolId)) {
            // Add tool with default position from current preset
            const presetItem = PRESETS[currentPreset].find(item => item.i === toolId);
            if (presetItem && !layout.find(item => item.i === toolId)) {
                updateLayout([...layout, presetItem]);
            }
        } else {
            // Remove tool
            updateLayout(layout.filter(item => item.i !== toolId));
        }
    };

    const value = {
        layout,
        updateLayout,
        currentPreset,
        applyPreset,
        resetLayout,
        isLocked,
        toggleLock,
        activeTools,
        toggleTool,
        presets: Object.keys(PRESETS)
    };

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

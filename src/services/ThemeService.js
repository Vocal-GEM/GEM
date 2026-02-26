/**
 * ThemeService - Manages light/dark theme preferences
 */

const STORAGE_KEY = 'gem_theme';

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system'
};

/**
 * Get current theme preference
 */
export const getTheme = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && Object.values(THEMES).includes(stored)) {
            return stored;
        }
    } catch (e) {
        console.error('ThemeService: Failed to load', e);
    }
    return THEMES.DARK; // Default to dark
};

/**
 * Set theme preference
 */
export const setTheme = (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
};

/**
 * Apply theme to document
 */
export const applyTheme = (theme) => {
    const root = document.documentElement;

    let effectiveTheme = theme;

    if (theme === THEMES.SYSTEM) {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? THEMES.DARK
            : THEMES.LIGHT;
    }

    if (effectiveTheme === THEMES.LIGHT) {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
    } else {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
    }
};

/**
 * Initialize theme on app load
 */
export const initializeTheme = () => {
    const theme = getTheme();
    applyTheme(theme);

    // Listen for system theme changes
    if (getTheme() === THEMES.SYSTEM) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (getTheme() === THEMES.SYSTEM) {
                applyTheme(THEMES.SYSTEM);
            }
        });
    }
};

/**
 * Toggle between dark and light
 */
export const toggleTheme = () => {
    const current = getTheme();
    const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(next);
    return next;
};

export default {
    getTheme,
    setTheme,
    applyTheme,
    initializeTheme,
    toggleTheme,
    THEMES
};

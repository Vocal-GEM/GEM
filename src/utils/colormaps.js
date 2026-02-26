/**
 * Spectrogram Colormap Utilities
 * Provides multiple color schemes for spectrogram visualizations
 */

// Available color scheme presets
export const COLORMAP_PRESETS = {
    heatmap: {
        name: 'Heatmap',
        description: 'Blue → Cyan → Green → Yellow → Red',
        icon: '🔥'
    },
    magma: {
        name: 'Magma',
        description: 'Black → Purple → Orange → Yellow',
        icon: '🌋'
    },
    viridis: {
        name: 'Viridis',
        description: 'Colorblind-friendly scientific palette',
        icon: '🔬'
    },
    grayscale: {
        name: 'Grayscale',
        description: 'Accessibility-focused monochrome',
        icon: '⚪'
    }
};

/**
 * Get a color mapping function for canvas fillStyle
 * @param {string} scheme - Color scheme name ('heatmap' | 'magma' | 'viridis' | 'grayscale')
 * @returns {function} Function that maps value (0-255) to CSS color string
 */
export function getColormapFunction(scheme = 'heatmap') {
    switch (scheme) {
        case 'heatmap':
            return heatmapColor;
        case 'magma':
            return magmaColor;
        case 'viridis':
            return viridisColor;
        case 'grayscale':
            return grayscaleColor;
        default:
            return heatmapColor;
    }
}

/**
 * Generate a Uint32Array colormap for fast pixel manipulation
 * Used by HighResSpectrogram for ImageData
 * @param {string} scheme - Color scheme name
 * @param {number} size - Number of colors (default 256)
 * @returns {Uint32Array} Array of ABGR packed colors
 */
export function generateColormap(scheme = 'heatmap', size = 256) {
    const colormap = new Uint32Array(size);
    const colorFn = getColormapFunction(scheme);

    for (let i = 0; i < size; i++) {
        const cssColor = colorFn(i);
        // Parse rgb(r, g, b) string
        const match = cssColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);
            // Pack as ABGR (little-endian for Uint32Array on ImageData)
            colormap[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        } else {
            // Fallback black
            colormap[i] = (255 << 24);
        }
    }

    return colormap;
}

// ============================================
// Color Scheme Implementations
// ============================================

/**
 * Heatmap: Deep Blue → Cyan → Green → Yellow → Red
 */
function heatmapColor(value) {
    const normalized = value / 255;
    let r = 0, g = 0, b = 0;

    if (normalized < 0.2) {
        // Dark Blue to Blue
        b = 128 + (normalized / 0.2) * 127;
    } else if (normalized < 0.4) {
        // Blue to Cyan
        g = ((normalized - 0.2) / 0.2) * 255;
        b = 255;
    } else if (normalized < 0.6) {
        // Cyan to Green
        g = 255;
        b = 255 - ((normalized - 0.4) / 0.2) * 255;
    } else if (normalized < 0.8) {
        // Green to Yellow
        r = ((normalized - 0.6) / 0.2) * 255;
        g = 255;
    } else {
        // Yellow to Red
        r = 255;
        g = 255 - ((normalized - 0.8) / 0.2) * 255;
    }

    return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
}

/**
 * Magma: Black → Purple → Red → Orange → Yellow
 */
function magmaColor(value) {
    const t = value / 255;
    let r, g, b;

    if (t < 0.25) {
        // Black to Purple
        r = t * 4 * 100;
        g = 0;
        b = t * 4 * 150;
    } else if (t < 0.5) {
        // Purple to Red
        r = 100 + (t - 0.25) * 4 * 155;
        g = 0;
        b = 150 - (t - 0.25) * 4 * 100;
    } else if (t < 0.75) {
        // Red to Orange
        r = 255;
        g = (t - 0.5) * 4 * 128;
        b = 50;
    } else {
        // Orange to Yellow/White
        r = 255;
        g = 128 + (t - 0.75) * 4 * 127;
        b = 50 + (t - 0.75) * 4 * 205;
    }

    return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
}

/**
 * Viridis: Colorblind-friendly palette (Purple → Teal → Yellow)
 * Approximation of matplotlib's viridis
 */
function viridisColor(value) {
    const t = value / 255;
    let r, g, b;

    // Viridis approximation
    r = Math.floor(255 * (0.267 + 0.004 * t + 2.71 * t * t - 12.6 * t * t * t +
        28.9 * t * t * t * t - 27.3 * t * t * t * t * t + 9.3 * t * t * t * t * t * t));
    g = Math.floor(255 * (0.004 + 1.42 * t - 1.87 * t * t + 2.01 * t * t * t -
        0.68 * t * t * t * t - 0.02 * t * t * t * t * t));
    b = Math.floor(255 * (0.329 + 1.42 * t - 4.93 * t * t + 7.79 * t * t * t -
        5.58 * t * t * t * t + 1.31 * t * t * t * t * t));

    // Clamp values
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return `rgb(${r},${g},${b})`;
}

/**
 * Grayscale: Simple black to white
 */
function grayscaleColor(value) {
    const v = Math.floor(value);
    return `rgb(${v},${v},${v})`;
}

export default {
    COLORMAP_PRESETS,
    getColormapFunction,
    generateColormap
};

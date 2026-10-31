import fs from 'fs';
const content = fs.readFileSync('src/components/viz/HighResSpectrogram.jsx', 'utf8');

const bad1 = `        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame

        // Optimization: Use alpha: false for better performance
        const ctx = canvas.getContext('2d', { alpha: false });\n\n`;

const bad2 = `        // 1. Shift existing content to left
        // Optimization: Draw canvas onto itself instead of using an offscreen temp canvas.
        ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

        // 2. Draw new column
        // Reuse pre-allocated TypedArray
        const maxBin = Math.floor(spectrum.length / 3); // 8kHz cutoff

        for (let y = 0; y < height; y++) {
            // Map y (0 at top, height at bottom) to frequency\n`;

const bad3 = `    }, [dataRef, colormap]);

    // Initial canvas setup & ResizeObserver\n`;

const bad4 = `            const newWidth = Math.floor(rect.width * dpr);
            const newHeight = 512; // Fixed high vertical resolution\n`;

const bad5 = `        const resizeObserver = new ResizeObserver(() => {
            // Use RAF to debounce\n\n`;

const bad6 = `    }, [draw, componentId]);\n`;

let newContent = content.replace(bad1, "").replace(bad2, "").replace(bad3, "").replace(bad4, "").replace(bad5, "");
// Removing the duplicate useEffect dependency array line correctly
newContent = newContent.replace("    }, [draw, componentId]);\n    }, [componentId, draw]);\n", "    }, [componentId, draw]);\n")

fs.writeFileSync('src/components/viz/HighResSpectrogram.jsx', newContent);

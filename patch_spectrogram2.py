with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    content = f.read()

content = content.replace("""        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame

        // Optimization: Use alpha: false for better performance
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame""", """        // Optimization: Use alpha: false for better performance
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame""")

content = content.replace("""        // 1. Shift existing content to left
        // Optimization: Draw canvas onto itself instead of using an offscreen temp canvas.
        ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

        // 2. Draw new column
        // Reuse pre-allocated TypedArray
        const maxBin = Math.floor(spectrum.length / 3); // 8kHz cutoff

        for (let y = 0; y < height; y++) {
            // Map y (0 at top, height at bottom) to frequency
        // Copy the current canvas (from x=scrollSpeed to the end) to x=0
        // This is much faster on GPU-accelerated contexts.
        ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

        // 2. Draw new column
        // Optimized: Reuse pre-allocated TypedArray
        const maxBin = Math.floor(spectrum.length / 3);""", """        // 1. Shift existing content to left
        // Optimization: Draw canvas onto itself instead of using an offscreen temp canvas.
        ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

        // 2. Draw new column
        // Reuse pre-allocated TypedArray
        const maxBin = Math.floor(spectrum.length / 3); // 8kHz cutoff""")

content = content.replace("""            // Only update if dimensions actually changed
            const newWidth = Math.floor(rect.width * dpr);
            const newHeight = 512; // Fixed high vertical resolution
            const newWidth = Math.round(rect.width * dpr);
            const newHeight = 512; // Fixed internal height for vertical resolution""", """            // Only update if dimensions actually changed
            const newWidth = Math.round(rect.width * dpr);
            const newHeight = 512; // Fixed internal height for vertical resolution""")

with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.write(content)

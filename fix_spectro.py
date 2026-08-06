with open('src/components/viz/HighResSpectrogram.jsx', 'r') as f:
    c = f.read()

bad_block = """        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame

        // Optimization: Use alpha: false for better performance
        const ctx = canvas.getContext('2d', { alpha: false });

        // Optimization: Use alpha: false for better performance
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame"""

good_block = """        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame

        // Optimization: Use alpha: false for better performance
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });"""

c = c.replace(bad_block, good_block)

with open('src/components/viz/HighResSpectrogram.jsx', 'w') as f:
    f.write(c)

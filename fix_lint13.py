with open('src/components/viz/HighResSpectrogram.jsx', 'r') as file:
    content = file.read()
content = content.replace('''        const height = canvas.height;
        const scrollSpeed = 2; // px per frame

        // Optimization: Use alpha: false for better performance
        const ctx = canvas.getContext('2d', { alpha: false });

        // Optimization: Use alpha: false for better performance
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame''', '''        // Optimization: Use alpha: false for better performance
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame''')
with open('src/components/viz/HighResSpectrogram.jsx', 'w') as file:
    file.write(content)

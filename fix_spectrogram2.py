with open('src/components/viz/HighResSpectrogram.jsx', 'r') as f:
    content = f.read()

content = content.replace("        // Optimization: Use alpha: false for better performance\n        const ctx = canvas.getContext('2d', { alpha: false });\n\n        // Optimization: Use alpha: false for better performance\n        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration\n        const ctx = canvas.getContext('2d', { alpha: false });", "        // Optimization: Use alpha: false for better performance\n        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration\n        const ctx = canvas.getContext('2d', { alpha: false });")

with open('src/components/viz/HighResSpectrogram.jsx', 'w') as f:
    f.write(content)

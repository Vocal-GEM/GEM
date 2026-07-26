with open('src/components/viz/QualityVisualizer.jsx', 'r') as f:
    content = f.read()

import re

# Remove the broken duplicate block
old_block = """    const loop = useCallback(() => {
        if (!dataRef.current) return;
        const data = dataRef.current;

        // Update local state
        // Jitter/Shimmer are often small values (e.g. 0.01), we might want to scale them for display
        // Jitter > 0.01 (1%) is often considered rough
        // Shimmer > 0.35 dB (or 3-4%) is often considered rough.
        // Assuming the engine returns raw values.

        setMetrics({
            jitter: data.jitter || 0,
            shimmer: data.shimmer || 0,
            weight: data.weight || 50
        });
    const loop = useCallback(() => {"""

new_block = """    const loop = useCallback(() => {"""

content = content.replace(old_block, new_block)

with open('src/components/viz/QualityVisualizer.jsx', 'w') as f:
    f.write(content)

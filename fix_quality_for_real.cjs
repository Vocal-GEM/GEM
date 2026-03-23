const fs = require('fs');
let content = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');

const search = `    const loop = useCallback(() => {
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
    const loop = useCallback(() => {
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

            // Update history
            ['jitter', 'shimmer', 'weight'].forEach(key => {`;

const replace = `    const loop = useCallback(() => {
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

        // Update history
        ['jitter', 'shimmer', 'weight'].forEach(key => {`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', content);

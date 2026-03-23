const fs = require('fs');
let content = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');

// Notice that lines 74-88 in the original file have duplicated `['jitter', 'shimmer', 'weight'].forEach`
// AND the original file has a missing closing brace on line 253! Wait, the original error was line 253.
// Let's replace the entire useEffect loop with a clean version.

const search = `    useEffect(() => {
        const loop = () => {
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
            ['jitter', 'shimmer', 'weight'].forEach(key => {
                historyRef.current[key].push(data[key] || 0);
                if (historyRef.current[key].length > maxHistory) {
                    historyRef.current[key].shift();
                }
            });

            // No recursive requestAnimationFrame - RenderCoordinator handles this
        };

        // Update history
        ['jitter', 'shimmer', 'weight'].forEach(key => {
            historyRef.current[key].push(data[key] || 0);
            if (historyRef.current[key].length > maxHistory) {
                historyRef.current[key].shift();
            }
        });

        // REMOVED: requestAnimationFrame(loop) - handled by renderCoordinator
    }, [dataRef]);`;

const replace = `    const loop = useCallback(() => {
        if (!dataRef.current) return;
        const data = dataRef.current;

        setMetrics({
            jitter: data.jitter || 0,
            shimmer: data.shimmer || 0,
            weight: data.weight || 50
        });

        ['jitter', 'shimmer', 'weight'].forEach(key => {
            historyRef.current[key].push(data[key] || 0);
            if (historyRef.current[key].length > maxHistory) {
                historyRef.current[key].shift();
            }
        });
    }, [dataRef, maxHistory]);`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', content);

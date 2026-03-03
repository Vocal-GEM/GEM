with open('src/components/viz/QualityVisualizer.jsx', 'r') as f:
    content = f.read()

bad_block = """    useEffect(() => {
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
    }, [dataRef]);"""

good_block = """    const loop = useCallback(() => {
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
    }, [dataRef]);"""

content = content.replace(bad_block, good_block)
with open('src/components/viz/QualityVisualizer.jsx', 'w') as f:
    f.write(content)

const fs = require('fs');
let filepath = 'src/components/viz/HighResSpectrogram.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
    `    // Component ID for RenderCoordinator
    const componentId = useId();

    // Reusable buffers to avoid GC
    // Unique component ID for RenderCoordinator
    const uniqueId = useId();
    const componentId = \`spectrogram-highres-\${uniqueId}\`;`,
    `    // Component ID for RenderCoordinator
    const uniqueId = useId();
    const componentId = \`spectrogram-highres-\${uniqueId}\`;`
);

content = content.replace(
    `    }, [dataRef, colormap]);

    // Initial canvas setup & ResizeObserver
    }, [dataRef, colormap, componentId]);`,
    `    }, [dataRef, colormap, componentId]);`
);

content = content.replace(
    `    // Render loop subscription
    useEffect(() => {
        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            draw,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [draw, componentId]);
    }, [componentId, draw]);`,
    `    // Render loop subscription
    useEffect(() => {
        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            draw,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [draw, componentId]);`
);

fs.writeFileSync(filepath, content);
console.log('HighResSpectrogram.jsx patched.');

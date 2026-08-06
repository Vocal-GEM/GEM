with open('src/components/viz/HighResSpectrogram.jsx', 'r') as f:
    c = f.read()

c = c.replace("""    // Component ID for RenderCoordinator
    const componentId = useId();

    // Reusable buffers to avoid GC
    // Unique component ID for RenderCoordinator
    const uniqueId = useId();
    const componentId = `spectrogram-highres-${uniqueId}`;""", """    // Component ID for RenderCoordinator
    const uniqueId = useId();
    const componentId = `spectrogram-highres-${uniqueId}`;""")

with open('src/components/viz/HighResSpectrogram.jsx', 'w') as f:
    f.write(c)

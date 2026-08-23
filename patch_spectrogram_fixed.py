with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    content = f.read()

content = content.replace("""    // Component ID for RenderCoordinator
    const componentId = useId();

    // Reusable buffers to avoid GC
    // Unique component ID for RenderCoordinator
    const uniqueId = useId();
    const componentId = `spectrogram-highres-${uniqueId}`;""", """    // Unique component ID for RenderCoordinator
    const uniqueId = useId();
    const componentId = `spectrogram-highres-${uniqueId}`;""")

with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.write(content)

import sys
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix componentId duplicate
    content = content.replace("const componentId = useId();\n\n    // Reusable buffers to avoid GC\n    // Unique component ID for RenderCoordinator\n    const uniqueId = useId();\n    const componentId = `spectrogram-highres-${uniqueId}`;", "const uniqueId = useId();\n    const componentId = `spectrogram-highres-${uniqueId}`;")

    # Fix duplicate useEffect dependencies and mismatched braces
    # 160:    }, [dataRef, colormap, componentId]);
    content = content.replace("    }, [dataRef, colormap]);\n\n    // Initial canvas setup & ResizeObserver\n    }, [dataRef, colormap, componentId]);", "    }, [dataRef, colormap, componentId]);")

    content = content.replace("    }, [draw, componentId]);\n    }, [componentId, draw]);", "    }, [componentId, draw]);")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/components/viz/HighResSpectrogram.jsx")

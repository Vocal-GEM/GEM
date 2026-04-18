with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    lines = f.readlines()

new_lines = lines[:146] + ["    }, [dataRef, colormap, componentId]);\n"] + lines[147:]

with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.writelines(new_lines)

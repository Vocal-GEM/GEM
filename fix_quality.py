with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    content = f.read()

content = content.replace(
"""        // Update history
        ['jitter', 'shimmer', 'weight'].forEach(key => {
            historyRef.current[key].push(data[key] || 0);
            if (historyRef.current[key].length > maxHistory) {
                historyRef.current[key].shift();
            }
        });
    }, [dataRef]);""",
"""        // Update history
        ['jitter', 'shimmer', 'weight'].forEach(key => {
            historyRef.current[key].push(data[key] || 0);
            if (historyRef.current[key].length > maxHistory) {
                historyRef.current[key].shift();
            }
        });
"""
)

with open("src/components/viz/QualityVisualizer.jsx", "w") as f:
    f.write(content)

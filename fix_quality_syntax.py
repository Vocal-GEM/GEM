with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == "});":
        # Check if it's the bad useCallback closing brace without dependency array
        pass
new_lines = []
skip = False
with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    content = f.read()

# Remove the broken useCallback block
content = content.replace(
"""    const loop = useCallback(() => {
        if (!dataRef.current) return;
        const data = dataRef.current;

        // Update local state
        setMetrics({
            jitter: data.jitter || 0,
            shimmer: data.shimmer || 0,
            weight: data.weight || 50
        });""",
"""    """
)

with open("src/components/viz/QualityVisualizer.jsx", "w") as f:
    f.write(content)

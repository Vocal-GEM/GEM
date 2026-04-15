with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    lines = f.readlines()

# The error is in how useCallback and useEffect were merged incorrectly.
# Lines 28-42 and 71-80 look like a mangled merge.
# We will just rewrite the `loop` callback to be a plain function inside useEffect, or clean up the useCallback.

# Looking at line 28: `const loop = useCallback(() => {`
# And line 43: `    useEffect(() => {` inside the useCallback block!

correct_content = """import { useEffect, useState, useRef, useId } from 'react';
import { Sparkles, Waves, Wind, Activity } from 'lucide-react';
import { renderCoordinator } from '../../services/RenderCoordinator';

const QualityVisualizer = ({ dataRef }) => {
    const [metrics, setMetrics] = useState({
        jitter: 0,
        shimmer: 0,
        weight: 50
    });

    const componentId = useId();

    const historyRef = useRef({
        jitter: [],
        shimmer: [],
        weight: []
    });
    const maxHistory = 100;

    useEffect(() => {
        const loop = () => {
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
        };

        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [dataRef, componentId]);
"""

with open("src/components/viz/QualityVisualizer.jsx", "w") as f:
    f.write(correct_content)
    # append the rest starting from line 94 `    // Helper to render sparkline`
    for line in lines[93:]:
        f.write(line)

with open('src/components/viz/RegisterGauge.jsx', 'r') as f:
    c = f.read()

import re
# First do the safe import addition
import_index = c.find('import { Layers')
c = c[:import_index] + "import { renderCoordinator } from '../../services/RenderCoordinator';\n" + c[import_index:]

# Remove unused animationRef
c = re.sub(r'const animationRef = useRef\(\);\n', '', c)

old = """            animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationRef.current);"""

new = """        };

        const unsubscribe = renderCoordinator.subscribe(
            'register-gauge',
            update,
            renderCoordinator.PRIORITY.HIGH
        );

        return () => unsubscribe();"""

c = c.replace(old, new)

opt_comment = """    useEffect(() => {
        // Bolt Optimization: Use centralized RenderCoordinator instead of separate requestAnimationFrame loop
        // Expected impact: Reduces CPU usage and browser main thread blocking by batching frame updates
        const update = () => {"""
c = c.replace("    useEffect(() => {\n        const update = () => {", opt_comment)

with open('src/components/viz/RegisterGauge.jsx', 'w') as f:
    f.write(c)

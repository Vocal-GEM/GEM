with open('src/components/viz/SpectralTiltMeter.jsx', 'r') as f:
    c = f.read()

c = c.replace("""        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                `spectral-tilt-meter-${id}`,
                loop,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });
            // No recursive requestAnimationFrame - RenderCoordinator handles this
        };

        const unsubscribe = renderCoordinator.subscribe(
            `spectral-tilt-meter-${componentId}`,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );""", """        // No recursive requestAnimationFrame - RenderCoordinator handles this
        };

        const unsubscribe = renderCoordinator.subscribe(
            `spectral-tilt-meter-${componentId}`,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );""")

with open('src/components/viz/SpectralTiltMeter.jsx', 'w') as f:
    f.write(c)

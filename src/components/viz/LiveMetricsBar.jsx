import { useEffect, useRef } from 'react';

const LiveMetricsBar = ({ dataRef }) => {
    // BOLT OPTIMIZATION:
    // Replaced useState with useRef to avoid triggering React re-renders on every audio frame.
    // High-frequency updates (up to 60fps) are now applied directly to the DOM via textContent,
    // significantly reducing CPU usage and React reconciliation overhead.
    const f0Ref = useRef(null);
    const f1Ref = useRef(null);
    const f2Ref = useRef(null);
    const wRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (dataRef.current) {
                const f0 = Math.round(dataRef.current.pitch || 0);
                if (f0Ref.current) f0Ref.current.textContent = `F0: ${f0 > 0 ? f0 : '--'}Hz`;
                if (f1Ref.current) f1Ref.current.textContent = `F1: ${Math.round(dataRef.current.f1 || 0)}Hz`;
                if (f2Ref.current) f2Ref.current.textContent = `F2: ${Math.round(dataRef.current.f2 || 0)}Hz`;
                if (wRef.current) wRef.current.textContent = `W: ${Math.round(dataRef.current.weight || 0)}`;
            }
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'live-metrics-bar',
                loop,
                renderCoordinator.PRIORITY.CRITICAL
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    return (
        <div className="glass-panel rounded-xl p-3 mb-4 flex justify-between text-xs font-mono text-blue-300">
            <span ref={f0Ref}>F0: --Hz</span>
            <span ref={f1Ref}>F1: 0Hz</span>
            <span ref={f2Ref}>F2: 0Hz</span>
            <span ref={wRef}>W: 0</span>
        </div>
    );
};

export default LiveMetricsBar;

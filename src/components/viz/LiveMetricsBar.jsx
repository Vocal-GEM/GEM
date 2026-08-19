import { useEffect, useRef } from 'react';

const LiveMetricsBar = ({ dataRef }) => {
    const f0Ref = useRef(null);
    const f1Ref = useRef(null);
    const f2Ref = useRef(null);
    const wRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const loop = () => {
            if (dataRef.current) {
                const pitch = Math.round(dataRef.current.pitch);
                if (f0Ref.current) f0Ref.current.textContent = `F0: ${pitch > 0 ? pitch : '--'}Hz`;
                if (f1Ref.current) f1Ref.current.textContent = `F1: ${Math.round(dataRef.current.f1)}Hz`;
                if (f2Ref.current) f2Ref.current.textContent = `F2: ${Math.round(dataRef.current.f2)}Hz`;
                if (wRef.current) wRef.current.textContent = `W: ${Math.round(dataRef.current.weight)}`;
            }
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            if (!isMounted) return;
            unsubscribe = renderCoordinator.subscribe(
                'live-metrics-bar',
                loop,
                renderCoordinator.PRIORITY.CRITICAL
            );
        });

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    // ⚡ Bolt Performance Optimization: Replaced useState with useRef and direct DOM mutation. Impact: Bypasses React's reconciliation cycle for 60FPS updates, significantly reducing CPU overhead.
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

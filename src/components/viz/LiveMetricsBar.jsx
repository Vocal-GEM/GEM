import { useEffect, useRef } from 'react';

const LiveMetricsBar = ({ dataRef }) => {
    const f0Ref = useRef(null);
    const f1Ref = useRef(null);
    const f2Ref = useRef(null);
    const wRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (dataRef.current) {
                const pitch = Math.round(dataRef.current.pitch);
                const f1 = Math.round(dataRef.current.f1);
                const f2 = Math.round(dataRef.current.f2);
                const weight = Math.round(dataRef.current.weight);

                if (f0Ref.current) f0Ref.current.textContent = `F0: ${pitch > 0 ? pitch : '--'}Hz`;
                if (f1Ref.current) f1Ref.current.textContent = `F1: ${f1}Hz`;
                if (f2Ref.current) f2Ref.current.textContent = `F2: ${f2}Hz`;
                if (wRef.current) wRef.current.textContent = `W: ${weight}`;
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

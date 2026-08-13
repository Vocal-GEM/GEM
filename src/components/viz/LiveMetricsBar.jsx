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
                if (f0Ref.current) f0Ref.current.textContent = pitch > 0 ? pitch : '--';
                if (f1Ref.current) f1Ref.current.textContent = Math.round(dataRef.current.f1);
                if (f2Ref.current) f2Ref.current.textContent = Math.round(dataRef.current.f2);
                if (wRef.current) wRef.current.textContent = Math.round(dataRef.current.weight);
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
            <span>F0: <span ref={f0Ref}>--</span>Hz</span>
            <span>F1: <span ref={f1Ref}>0</span>Hz</span>
            <span>F2: <span ref={f2Ref}>0</span>Hz</span>
            <span>W: <span ref={wRef}>0</span></span>
        </div>
    );
};

export default LiveMetricsBar;

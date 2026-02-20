import { useEffect, useRef, memo } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';

const LiveMetricsBar = memo(({ dataRef }) => {
    const f0Ref = useRef(null);
    const f1Ref = useRef(null);
    const f2Ref = useRef(null);
    const wRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (dataRef.current) {
                const { pitch, f1, f2, weight } = dataRef.current;

                if (f0Ref.current) {
                    const p = Math.round(pitch);
                    f0Ref.current.textContent = p > 0 ? p : '--';
                }
                if (f1Ref.current) f1Ref.current.textContent = Math.round(f1);
                if (f2Ref.current) f2Ref.current.textContent = Math.round(f2);
                if (wRef.current) wRef.current.textContent = Math.round(weight);
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            'live-metrics-bar',
            loop,
            renderCoordinator.PRIORITY.CRITICAL
        );

        return () => {
            unsubscribe();
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
});

LiveMetricsBar.displayName = 'LiveMetricsBar';
export default LiveMetricsBar;

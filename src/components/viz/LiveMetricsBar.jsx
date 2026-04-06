import { useState, useEffect } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';

const LiveMetricsBar = ({ dataRef }) => {
    const [metrics, setMetrics] = useState({ f0: 0, f1: 0, f2: 0, w: 0 });
    useEffect(() => {
        const loop = () => {
            if (dataRef.current) {
                setMetrics({
                    f0: Math.round(dataRef.current.pitch),
                    f1: Math.round(dataRef.current.f1),
                    f2: Math.round(dataRef.current.f2),
                    w: Math.round(dataRef.current.weight)
                });
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
            <span>F0: {metrics.f0 > 0 ? metrics.f0 : '--'}Hz</span>
            <span>F1: {metrics.f1}Hz</span>
            <span>F2: {metrics.f2}Hz</span>
            <span>W: {metrics.w}</span>
        </div>
    );
};

export default LiveMetricsBar;

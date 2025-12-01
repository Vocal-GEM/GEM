import React, { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useLayout } from '../../context/LayoutContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResizableToolGrid = ({ children, className = '' }) => {
    const { layout, updateLayout, isLocked, activeTools } = useLayout();

    // Map children to grid items
    const gridItems = useMemo(() => {
        return React.Children.map(children, (child) => {
            if (!child || !child.props.toolId) return null;

            const toolId = child.props.toolId;
            if (!activeTools.includes(toolId)) return null;

            return (
                <div key={toolId} className="grid-item">
                    {child}
                </div>
            );
        });
    }, [children, activeTools]);

    const handleLayoutChange = (newLayout) => {
        if (!isLocked) {
            updateLayout(newLayout);
        }
    };

    // Responsive breakpoints
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

    return (
        <div className={`resizable-tool-grid ${className}`}>
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={breakpoints}
                cols={cols}
                rowHeight={60}
                isDraggable={!isLocked}
                isResizable={!isLocked}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".drag-handle"
                compactType="vertical"
                preventCollision={false}
                margin={[16, 16]}
                containerPadding={[0, 0]}
            >
                {gridItems}
            </ResponsiveGridLayout>
        </div>
    );
};

// Wrapper component for individual tools
export const GridTool = ({ toolId, title, children, showDragHandle = true }) => {
    const { isLocked } = useLayout();

    return (
        <div className="h-full w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative group">
            {/* Drag Handle */}
            {!isLocked && showDragHandle && (
                <div className="drag-handle absolute top-2 left-2 z-10 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-slate-700/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex gap-0.5">
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            </div>
                            <div className="flex gap-0.5">
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            </div>
                        </div>
                        {title && <span className="text-xs text-slate-400 font-medium ml-1">{title}</span>}
                    </div>
                </div>
            )}

            {/* Resize Indicator */}
            {!isLocked && (
                <div className="absolute bottom-1 right-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <svg viewBox="0 0 16 16" className="text-slate-600">
                        <path
                            d="M15 15L15 11M15 15L11 15M15 15L10 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>
                </div>
            )}

            {/* Tool Content */}
            <div className="h-full w-full">
                {children}
            </div>
        </div>
    );
};

export default ResizableToolGrid;

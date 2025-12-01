import React, { useState, useRef, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';

const ResizablePanel = ({
    children,
    className = "",
    minWidth = 300,
    minHeight = 200,
    defaultHeight = 600,
    defaultWidth = "50%",
    onResize
}) => {
    // We only manage height and width. 
    // Initial width might be 'auto' or controlled by flex, so we might not set it initially.
    const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef(null);
    const startPos = useRef({ x: 0, y: 0 });
    const startDims = useRef({ width: 0, height: 0 });

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = panelRef.current.getBoundingClientRect();
        startPos.current = { x: e.clientX, y: e.clientY };
        startDims.current = { width: rect.width, height: rect.height };

        // Initialize width state if it was null (auto)
        if (dimensions.width === null) {
            setDimensions(prev => ({ ...prev, width: rect.width }));
        }

        setIsResizing(true);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'nwse-resize';
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
        if (!startPos.current) return;

        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;

        const newWidth = Math.max(minWidth, startDims.current.width + dx);
        const newHeight = Math.max(minHeight, startDims.current.height + dy);

        setDimensions({ width: newWidth, height: newHeight });

        if (onResize) {
            onResize({ width: newWidth, height: newHeight });
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };

    const handleTouchStart = (e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        const rect = panelRef.current.getBoundingClientRect();
        startPos.current = { x: touch.clientX, y: touch.clientY };
        startDims.current = { width: rect.width, height: rect.height };

        // Initialize width state if it was null (auto)
        if (dimensions.width === null) {
            setDimensions(prev => ({ ...prev, width: rect.width }));
        }

        setIsResizing(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling while resizing
    };

    const handleTouchMove = (e) => {
        if (!startPos.current) return;
        const touch = e.touches[0];
        const dx = touch.clientX - startPos.current.x;
        const dy = touch.clientY - startPos.current.y;

        const newWidth = Math.max(minWidth, startDims.current.width + dx);
        const newHeight = Math.max(minHeight, startDims.current.height + dy);

        setDimensions({ width: newWidth, height: newHeight });

        if (onResize) {
            onResize({ width: newWidth, height: newHeight });
        }
    };

    const handleTouchEnd = () => {
        setIsResizing(false);
        document.body.style.overflow = '';
    };

    // Cleanup
    useEffect(() => {
        if (isResizing) {
            // Touch events need to be added/removed dynamically or they might interfere
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        } else {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.body.style.overflow = '';
        };
    }, [isResizing]);

    return (
        <div
            ref={panelRef}
            className={`relative group ${className}`}
            style={{
                height: dimensions.height,
                width: dimensions.width ?? undefined, // Use undefined to let CSS take over if null
                transition: isResizing ? 'none' : 'width 0.2s, height 0.2s'
            }}
        >
            {children}

            {/* Resize Handle */}
            <div
                className={`absolute bottom-0 right-0 p-1 cursor-nwse-resize z-50 opacity-0 group-hover:opacity-100 transition-opacity ${isResizing ? 'opacity-100' : ''}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="w-6 h-6 bg-slate-800/80 backdrop-blur-sm rounded-tl-lg border-t border-l border-white/20 flex items-center justify-center shadow-lg hover:bg-blue-500/80 transition-colors">
                    <GripHorizontal size={16} className="text-white/70 transform -rotate-45" />
                </div>
            </div>

            {/* Resize Overlay to prevent iframe/interaction interference during resize */}
            {
                isResizing && (
                    <div className="absolute inset-0 z-40 bg-transparent" />
                )
            }
        </div >
    );

};

export default ResizablePanel;

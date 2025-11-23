import React, { useState, useRef, useEffect } from 'react';

const FloatingCamera = ({ onClose }) => {
    const videoRef = useRef(null);
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const [size, setSize] = useState({ width: 160, height: 120 }); // Aspect 4:3
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState(null);

    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Camera access denied");
            }
        };
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleZoom = (delta) => {
        setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
    };

    const toggleSize = () => {
        if (size.width === 160) setSize({ width: 240, height: 180 });
        else setSize({ width: 160, height: 120 });
    };

    if (error) return null;

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex: 100,
                touchAction: 'none'
            }}
            className="rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black group"
        >
            {/* Drag Handle */}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    setIsDragging(true);
                    setDragOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
                }}
                onTouchMove={(e) => {
                    if (isDragging) {
                        const touch = e.touches[0];
                        setPosition({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
                    }
                }}
                onTouchEnd={() => setIsDragging(false)}
                className="absolute inset-0 z-10 cursor-move"
            ></div>

            {/* Video */}
            <div className="w-full h-full overflow-hidden relative">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        transform: `scale(${zoom}) scaleX(-1)`, // Mirror + Zoom
                        transformOrigin: 'center center'
                    }}
                    className="w-full h-full object-cover pointer-events-none"
                />
            </div>

            {/* Controls Overlay (Visible on Hover/Tap) */}
            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="flex gap-1">
                    <button onClick={() => handleZoom(-0.2)} className="p-1 bg-white/10 rounded hover:bg-white/20 text-white text-[10px]"><i data-lucide="minus" className="w-3 h-3"></i></button>
                    <button onClick={() => handleZoom(0.2)} className="p-1 bg-white/10 rounded hover:bg-white/20 text-white text-[10px]"><i data-lucide="plus" className="w-3 h-3"></i></button>
                </div>
                <div className="flex gap-1">
                    <button onClick={toggleSize} className="p-1 bg-white/10 rounded hover:bg-white/20 text-white"><i data-lucide="maximize-2" className="w-3 h-3"></i></button>
                    <button onClick={onClose} className="p-1 bg-red-500/80 rounded hover:bg-red-500 text-white"><i data-lucide="x" className="w-3 h-3"></i></button>
                </div>
            </div>
        </div>
    );
};

export default FloatingCamera;

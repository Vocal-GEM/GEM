import { useEffect, useRef, useState } from 'react';

const MirrorComponent = () => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Could not access camera. Please check permissions.");
            }
        };
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    if (error) return <div className="p-4 text-red-400 text-center bg-slate-800 rounded-xl">{error}</div>;

    return (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-2xl border border-white/10">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-bold">
                🪞 Mirror Mode
            </div>
        </div>
    );
};

export default MirrorComponent;
